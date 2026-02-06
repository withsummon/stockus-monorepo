import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db/index.js'
import { templates } from '../db/schema/index.js'
import { authMiddleware, requireAdmin, AuthEnv } from '../middleware/auth.js'
import { validateFile, saveFile, getUploadDir, ALLOWED_TEMPLATE_TYPES, MAX_FILE_SIZE } from '../utils/file-upload.js'
import { eq, desc, isNull } from 'drizzle-orm'
import { readFile } from 'fs/promises'
import { join } from 'path'

const app = new Hono<AuthEnv>()

/**
 * GET / - List all templates
 * Auth: Required
 */
app.get('/', authMiddleware, async (c) => {
  const results = await db.query.templates.findMany({
    where: isNull(templates.deletedAt),
    orderBy: desc(templates.createdAt),
  })

  return c.json({ templates: results })
})

/**
 * GET /:id - Get template metadata
 * Auth: Required
 */
app.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  const template = await db.query.templates.findFirst({
    where: (templates, { eq, and, isNull }) =>
      and(eq(templates.id, id), isNull(templates.deletedAt)),
  })

  if (!template) {
    return c.json({ error: 'Template not found' }, 404)
  }

  return c.json({ template })
})

/**
 * GET /:id/download - Download template file
 * Auth: Required, tier-gated
 */
app.get('/:id/download', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const userTier = c.get('userTier')

  const template = await db.query.templates.findFirst({
    where: eq(templates.id, id),
  })

  if (!template || template.deletedAt) {
    return c.json({ error: 'Template not found' }, 404)
  }

  // Check tier access
  if (!template.isFreePreview && userTier !== 'member') {
    return c.json({
      error: 'Insufficient permissions',
      required: 'member',
      current: userTier
    }, 403)
  }

  // Read file from disk
  try {
    const fileBuffer = await readFile(join(getUploadDir('templates'), template.filename))

    // Set headers for file download
    c.header('Content-Type', template.mimeType)
    c.header('Content-Disposition', `attachment; filename="${template.originalFilename}"`)
    c.header('Content-Length', template.fileSize.toString())

    return c.body(fileBuffer)
  } catch (error) {
    console.error('Error reading file:', error)
    return c.json({ error: 'Failed to read file' }, 500)
  }
})

/**
 * POST / - Upload new template
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
    const validation = await validateFile(file, ALLOWED_TEMPLATE_TYPES)
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400)
    }

    // Save file to disk
    const { filename, filepath } = await saveFile(file, getUploadDir('templates'))

    // Extract metadata
    const title = body.title as string
    const description = body.description as string | undefined
    const isFreePreview = body.isFreePreview === 'true'

    if (!title) {
      return c.json({ error: 'Title is required' }, 400)
    }

    // Insert template record
    const [template] = await db.insert(templates).values({
      title,
      description: description || null,
      originalFilename: file.name,
      filename,
      filepath,
      fileSize: file.size,
      mimeType: file.type,
      isFreePreview,
      uploadedBy: userId,
    }).returning()

    return c.json({ template }, 201)
  } catch (error) {
    console.error('Error uploading template:', error)
    return c.json({ error: 'Failed to upload template' }, 500)
  }
})

/**
 * PATCH /:id - Update template metadata
 * Auth: Admin only
 */
app.patch('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json()

    const updateSchema = z.object({
      title: z.string().max(255).optional(),
      description: z.string().max(500).optional(),
      isFreePreview: z.boolean().optional(),
    })

    const data = updateSchema.parse(body)

    const [template] = await db.update(templates)
      .set(data)
      .where(eq(templates.id, id))
      .returning()

    if (!template) {
      return c.json({ error: 'Template not found' }, 404)
    }

    return c.json({ template })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error('Error updating template:', error)
    return c.json({ error: 'Failed to update template' }, 500)
  }
})

/**
 * DELETE /:id - Soft delete template
 * Auth: Admin only
 */
app.delete('/:id', authMiddleware, requireAdmin(), async (c) => {
  const id = c.req.param('id')

  const [template] = await db.update(templates)
    .set({ deletedAt: new Date() })
    .where(eq(templates.id, id))
    .returning()

  if (!template) {
    return c.json({ error: 'Template not found' }, 404)
  }

  return c.json({ message: 'Template deleted' })
})

export const templateRoutes = app
