import { Hono } from 'hono'
import health from './health.js'
import { auth } from './auth.js'
import { researchRoutes } from './research.js'
import { courseRoutes } from './courses.js'
import { templateRoutes } from './templates.js'
import { imageRoutes } from './images.js'
import { cohortRoutes } from './cohorts.js'
import { referralRoutes } from './referrals.js'
import { paymentRoutes } from './payments.js'
import { webhookRoutes } from './webhooks.js'
import { videoRoutes } from './videos.js'

const routes = new Hono()

// Health check routes
routes.route('/health', health)

// Authentication routes
routes.route('/auth', auth)

// Research routes
routes.route('/research', researchRoutes)

// Course routes
routes.route('/courses', courseRoutes)

// Template routes
routes.route('/templates', templateRoutes)

// Image routes
routes.route('/images', imageRoutes)

// Cohort routes
routes.route('/cohorts', cohortRoutes)

// Referral routes
routes.route('/referrals', referralRoutes)

// Payment routes
routes.route('/payments', paymentRoutes)

// Webhook routes (external service callbacks)
routes.route('/webhooks', webhookRoutes)

// Video routes (admin upload, member playback)
routes.route('/videos', videoRoutes)

export default routes
