import 'server-only'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL || 'http://localhost:3000'

async function adminFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: `access_token=${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Admin API error: ${res.status}`)
  }

  return res.json()
}

export interface AdminMetrics {
  totalMembers: number
  totalRevenue: number
  activeSubscriptions: number
  recentOrders: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const data = await adminFetch('/admin/metrics')
  return data.metrics
}

// Type definitions for users and orders
export interface AdminUser {
  id: number
  email: string
  name: string
  tier: string
  isVerified: boolean
  createdAt: string
  subscription?: {
    status: string
    endDate: string
  } | null
}

export interface AdminOrder {
  id: number
  userId: number
  midtransOrderId: string
  type: string
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

export async function getAdminUsers(page = 1, limit = 20, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  const data = await adminFetch(`/admin/users?${params}`)
  return data as { users: AdminUser[]; total: number; page: number; limit: number }
}

export async function getAdminOrders(page = 1, limit = 20, status?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status) params.set('status', status)
  const data = await adminFetch(`/admin/orders?${params}`)
  return data as { orders: AdminOrder[]; total: number; page: number; limit: number }
}
