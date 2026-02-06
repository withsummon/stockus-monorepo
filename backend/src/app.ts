import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import routes from './routes/index.js'
import { env } from './config/env.js'
import { securityHeaders } from './middleware/security-headers.js'

const app = new Hono()

// Middleware
app.use('*', logger())

// Security headers
app.use('*', securityHeaders)

// CORS configuration for cookie-based auth
app.use('*', cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}))

// Mount routes
app.route('/', routes)

// Root endpoint
app.get('/', (c) => {
  return c.json({ message: 'StockUs API', version: '1.0.0' })
})

export default app
