import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db/index.js'
import { images } from '../db/schema/index.js'
import { authMiddleware, requireAdmin, AuthEnv } from '../middleware/auth.js'
import { validateFile, saveFile, getUploadDir, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../utils/file-upload.js'
import { eq, desc, isNull } from 'drizzle-orm'
import { unlink } from 'fs/promises'
import { join } from 'path'

const app = new Hono<AuthEnv>()

/**
 * GET / - List all images
 * Auth: Admin only
 */
app.get('/', authMiddleware, requireAdmin(), async (c) => {
  const results = await db.query.images.findMany({
    where: isNull(images.deletedAt),
    orderBy: desc(images.createdAt),
  })

  return c.json({ images: results })
})

/**
 * GET /:id - Get single image metadata
 * Auth: Admin only
 */
app.get('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  const image = await db.query.images.findFirst({
    where: (images, { eq, and, isNull }) =>
      and(eq(images.id, id), isNull(images.deletedAt)),
  })

  if (!image) {
    return c.json({ error: 'Image not found' }, 404)
  }

  return c.json({ image })
})

/**
 * POST / - Upload new image
 * Auth: Admin only
 */
app.post('/', authMiddleware, requireAdmin(), async (c) => {
  const userId = c.get('userId')

  try {
    const body = await c.req.parseBody()

    // Validate file exists and is a File object
    if (!body.file || typeof body.file === 'string') {
      return c.json({ error: 'File is required' }, 400)
    }

    const file = body.file as File

    // Validate file type, size, and magic bytes
    const validation = await validateFile(file, ALLOWED_IMAGE_TYPES)
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400)
    }

    // Save file to disk
    const { filename, filepath } = await saveFile(file, getUploadDir('images'))

    // Extract optional metadata
    const alt = body.alt as string | undefined
    const description = body.description as string | undefined

    // Insert image record
    const [image] = await db.insert(images).values({
      originalFilename: file.name,
      filename,
      filepath,
      fileSize: file.size,
      mimeType: file.type,
      alt: alt || null,
      description: description || null,
      uploadedBy: userId,
    }).returning()

    return c.json({ image }, 201)
  } catch (error) {
    console.error('Error uploading image:', error)
    return c.json({ error: 'Failed to upload image' }, 500)
  }
})

/**
 * PATCH /:id - Update image metadata
 * Auth: Admin only
 */
app.patch('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json()

    const updateSchema = z.object({
      alt: z.string().optional(),
      description: z.string().optional(),
    })

    const data = updateSchema.parse(body)

    const [image] = await db.update(images)
      .set(data)
      .where(eq(images.id, id))
      .returning()

    if (!image) {
      return c.json({ error: 'Image not found' }, 404)
    }

    return c.json({ image })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error('Error updating image:', error)
    return c.json({ error: 'Failed to update image' }, 500)
  }
})

/**
 * DELETE /:id - Soft delete image
 * Auth: Admin only
 */
app.delete('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  const [image] = await db.update(images)
    .set({ deletedAt: new Date() })
    .where(eq(images.id, id))
    .returning()

  if (!image) {
    return c.json({ error: 'Image not found' }, 404)
  }

  return c.json({ message: 'Image deleted' })
})

export const imageRoutes = app
