import { clientFetchAPI } from '../api-client'

// Course types
export interface Course {
  id: number
  title: string
  slug: string
  description: string
  content: string
  thumbnailUrl: string | null
  status: string
  isFreePreview: boolean
  createdAt: string
  updatedAt: string
  sessions?: CourseSession[]
}

export interface CourseSession {
  id: number
  courseId: number
  title: string
  description: string | null
  sessionOrder: number
  durationMinutes: number | null
  videoUrl: string | null
}

export interface CourseFormData {
  title: string
  description?: string
  content?: string
  thumbnailUrl?: string | null
  isFreePreview?: boolean
}

// Course API functions
export async function getAdminCourses() {
  // Note: Use the regular /courses endpoint which already returns all courses for authenticated users
  // Admin middleware is only needed for POST/PATCH/DELETE
  const data = await clientFetchAPI<{ courses: Course[] }>('/courses')
  return data.courses
}

export async function getAdminCourse(id: number) {
  const data = await clientFetchAPI<{ course: Course }>(`/courses/${id}`)
  return data.course
}

export async function createCourse(data: CourseFormData) {
  return clientFetchAPI('/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateCourse(id: number, data: Partial<CourseFormData>) {
  return clientFetchAPI(`/courses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteCourse(id: number) {
  return clientFetchAPI(`/courses/${id}`, {
    method: 'DELETE',
  })
}

// Template types
export interface Template {
  id: number
  title: string
  slug: string
  description: string | null
  originalFilename: string
  filename: string
  filepath: string
  fileSize: number
  mimeType: string
  isFreePreview: boolean
  downloadCount: number
  uploadedBy: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export async function getAdminTemplates() {
  const data = await clientFetchAPI<{ templates: Template[] }>('/templates')
  return data.templates
}

export async function getAdminTemplate(id: number) {
  const data = await clientFetchAPI<{ template: Template }>(`/templates/${id}`)
  return data.template
}

// Note: createTemplate uses FormData for file upload
// This is handled separately in the client component

export async function updateTemplate(
  id: number,
  data: { title?: string; description?: string; isFreePreview?: boolean }
) {
  return clientFetchAPI(`/templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteTemplate(id: number) {
  return clientFetchAPI(`/templates/${id}`, {
    method: 'DELETE',
  })
}

// Research types
export interface Research {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  thumbnailUrl: string | null
  publishedAt: string | null
  isFreePreview: boolean
  status: string
  // Stock-specific fields (nullable)
  stockSymbol: string | null
  stockName: string | null
  analystRating: string | null // 'buy' | 'hold' | 'sell'
  targetPrice: number | null
  createdAt: string
  updatedAt: string
}

export interface ResearchFormData {
  title: string
  summary?: string
  content?: string
  thumbnailUrl?: string | null
  isFreePreview?: boolean
  stockSymbol?: string | null
  stockName?: string | null
  analystRating?: string | null
  targetPrice?: number | null
}

export async function getAdminResearch() {
  const data = await clientFetchAPI<{ reports: Research[] }>('/research')
  return data.reports
}

export async function getAdminResearchById(id: number) {
  const data = await clientFetchAPI<{ report: Research }>(`/research/${id}`)
  return data.report
}

export async function createResearch(data: ResearchFormData) {
  return clientFetchAPI('/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateResearch(id: number, data: Partial<ResearchFormData>) {
  return clientFetchAPI(`/research/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteResearch(id: number) {
  return clientFetchAPI(`/research/${id}`, {
    method: 'DELETE',
  })
}

// Admin-specific types
export interface AdminUser {
  id: number
  email: string
  name: string
  tier: 'free' | 'member'
  isVerified: boolean
  createdAt: string
  subscriptionStatus: string | null
}

export interface AdminOrder {
  id: number
  midtransOrderId: string
  type: 'subscription' | 'workshop'
  status: string
  amount: number
  paymentMethod: string | null
  createdAt: string
  paidAt: string | null
  user: {
    name: string
    email: string
  }
}

export interface AdminMetrics {
  totalMembers: number
  totalRevenue: number
  activeSubscriptions: number
  recentOrders: number
}

// Admin API functions
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const data = await clientFetchAPI<{ metrics: AdminMetrics }>('/admin/metrics')
  return data.metrics
}

export async function getAdminUsers(page = 1, limit = 20, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  return clientFetchAPI<{ users: AdminUser[]; total: number; page: number; limit: number }>(`/admin/users?${params}`)
}

export async function getAdminOrders(page = 1, limit = 20, status?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.set('status', status)
  return clientFetchAPI<{ orders: AdminOrder[]; total: number; page: number; limit: number }>(`/admin/orders?${params}`)
}
