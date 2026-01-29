// Session payload from JWT (mirrors backend JwtPayload)
export interface SessionPayload {
  sub: number // userId
  tier: 'free' | 'member'
  exp: number
  iat: number
}

// User from /auth/me endpoint
export interface User {
  id: number
  email: string
  name: string
  tier: 'free' | 'member'
  isVerified: boolean
  createdAt: string
}

// Auth state for client components
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
