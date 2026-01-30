import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { db } from '../db/index.js'
import { videos, courseSessions } from '../db/schema/index.js'
import { authMiddleware, requireAdmin, requireTier, AuthEnv } from '../middleware/auth.js'
import { generateUploadUrl, generatePlaybackUrl } from '../services/r2.service.js'
import { env } from '../config/env.js'
import { eq, desc, isNull, and } from 'drizzle-orm'

// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
]

// Maximum video size: 5GB (R2 single PUT limit)
const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024

// Helper to get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
  }
  return mimeToExt[mimeType] || 'mp4'
}

// Request upload schema
const requestUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().refine(
    (val) => ALLOWED_VIDEO_TYPES.includes(val),
    { message: `Content type must be one of: ${ALLOWED_VIDEO_TYPES.join(', ')}` }
  ),
  sizeBytes: z.number().int().positive().max(MAX_VIDEO_SIZE, {
    message: `File size must not exceed 5GB`,
  }),
  sessionId: z.string().length(26).optional(), // ULID
})

// Confirm upload schema
const confirmUploadSchema = z.object({
  r2Key: z.string().refine(
    (val) => val.startsWith('videos/'),
    { message: 'r2Key must start with videos/' }
  ),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  contentType: z.string().refine(
    (val) => ALLOWED_VIDEO_TYPES.includes(val),
    { message: `Content type must be one of: ${ALLOWED_VIDEO_TYPES.join(', ')}` }
  ),
  sizeBytes: z.number().int().positive(),
  durationSeconds: z.number().int().positive().optional(),
  sessionId: z.string().length(26).optional(), // ULID
})

const videoRoutes = new Hono<AuthEnv>()

/**
 * POST /request-upload - Request presigned URL for video upload
 * Auth: Admin only
 */
videoRoutes.post(
  '/request-upload',
  authMiddleware,
  requireAdmin(),
  zValidator('json', requestUploadSchema),
  async (c) => {
    const body = c.req.valid('json')

    // If sessionId provided, verify session exists
    if (body.sessionId) {
      const session = await db.query.courseSessions.findFirst({
        where: eq(courseSessions.id, body.sessionId),
      })

      if (!session) {
        return c.json({ error: 'Session not found' }, 404)
      }
    }

    // Generate UUID-based r2Key
    const extension = getExtensionFromMimeType(body.contentType)
    const r2Key = `videos/${randomUUID()}.${extension}`

    // Generate presigned upload URL
    const uploadUrl = await generateUploadUrl(r2Key, body.contentType)

    return c.json({
      uploadUrl,
      r2Key,
      expiresIn: env.VIDEO_UPLOAD_URL_EXPIRY,
    })
  }
)

/**
 * POST /confirm-upload - Confirm video upload and save metadata
 * Auth: Admin only
 */
videoRoutes.post(
  '/confirm-upload',
  authMiddleware,
  requireAdmin(),
  zValidator('json', confirmUploadSchema),
  async (c) => {
    const body = c.req.valid('json')
    const userId = c.get('userId')

    // If sessionId provided, verify session exists
    if (body.sessionId) {
      const session = await db.query.courseSessions.findFirst({
        where: eq(courseSessions.id, body.sessionId),
      })

      if (!session) {
        return c.json({ error: 'Session not found' }, 404)
      }
    }

    // Insert video record
    const [video] = await db.insert(videos).values({
      title: body.title,
      description: body.description || null,
      r2Key: body.r2Key,
      contentType: body.contentType,
      sizeBytes: body.sizeBytes,
      durationSeconds: body.durationSeconds || null,
      sessionId: body.sessionId || null,
      uploadedBy: userId,
    }).returning()

    // If sessionId provided, update courseSessions.videoUrl
    if (body.sessionId) {
      await db.update(courseSessions)
        .set({ videoUrl: `/videos/${video.id}/playback` })
        .where(eq(courseSessions.id, body.sessionId))
    }

    return c.json({ video }, 201)
  }
)

/**
 * GET / - List all videos
 * Auth: Admin only
 */
videoRoutes.get(
  '/',
  authMiddleware,
  requireAdmin(),
  async (c) => {
    const sessionIdParam = c.req.query('sessionId')

    // Build where conditions
    const conditions = [isNull(videos.deletedAt)]

    if (sessionIdParam) {
      // sessionIdParam is a ULID string
      conditions.push(eq(videos.sessionId, sessionIdParam))
    }

    const videoList = await db.query.videos.findMany({
      where: and(...conditions),
      with: {
        session: {
          with: {
            course: true,
          },
        },
        uploader: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: desc(videos.createdAt),
    })

    return c.json({ videos: videoList })
  }
)

/**
 * DELETE /:id - Soft delete video
 * Auth: Admin only
 */
videoRoutes.delete(
  '/:id',
  authMiddleware,
  requireAdmin(),
  async (c) => {
    const id = c.req.param('id')

    const existingVideo = await db.query.videos.findFirst({
      where: and(
        eq(videos.id, id),
        isNull(videos.deletedAt)
      ),
    })

    if (!existingVideo) {
      return c.json({ error: 'Video not found' }, 404)
    }

    await db.update(videos)
      .set({ deletedAt: new Date() })
      .where(eq(videos.id, id))

    return c.json({ success: true })
  }
)

/**
 * GET /:id/playback - Get presigned playback URL
 * Auth: Member tier required
 */
videoRoutes.get(
  '/:id/playback',
  authMiddleware,
  requireTier('member'),
  async (c) => {
    const id = c.req.param('id')

    const video = await db.query.videos.findFirst({
      where: and(
        eq(videos.id, id),
        isNull(videos.deletedAt)
      ),
      with: {
        session: true,
      },
    })

    if (!video) {
      return c.json({ error: 'Video not found' }, 404)
    }

    // Generate presigned playback URL
    const playbackUrl = await generatePlaybackUrl(video.r2Key)

    return c.json({
      playbackUrl,
      expiresIn: env.VIDEO_PLAYBACK_URL_EXPIRY,
      contentType: video.contentType,
      title: video.title,
    })
  }
)

export { videoRoutes }
