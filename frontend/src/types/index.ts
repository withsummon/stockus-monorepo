export interface Course {
  id: number
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  isFreePreview: boolean
  createdAt: string
}

export interface CourseSession {
  id: number
  courseId: number
  title: string
  description: string | null
  sessionOrder: number
  videoUrl: string | null
  createdAt: string
}

export interface CourseWithSessions extends Course {
  sessions: CourseSession[]
}

export interface ResearchReport {
  id: number
  title: string
  slug: string
  summary: string
  requiredTier: 'free' | 'member'
  isFreePreview: boolean
  restricted: boolean
  publishedAt: string | null
  stockSymbol?: string | null
  stockName?: string | null
}

export interface ResearchReportDetail extends ResearchReport {
  content: string | null
  stockSymbol: string | null
  stockName: string | null
  analystRating: string | null
  targetPrice: number | null
  fileUrl: string | null
}

export interface Template {
  id: number
  title: string
  description: string | null
  fileUrl: string
  isFreePreview: boolean
  createdAt: string
}

export interface Cohort {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  price: number
  maxParticipants: number
  enrolledCount: number
}

export interface CohortSession {
  id: number
  cohortId: number
  title: string
  scheduledAt: string
  zoomLink: string | null
  recordingUrl: string | null
  sessionOrder: number
}

export interface CohortWithSessions extends Omit<Cohort, 'title' | 'description'> {
  name: string
  courseId: number
  status: 'upcoming' | 'open' | 'closed' | 'completed'
  enrollmentOpenDate: string
  enrollmentCloseDate: string
  sessions: CohortSession[]
  course?: {
    id: number
    title: string
    slug: string
  }
}

export interface TeamMember {
  name: string
  role: string
  bio: string
  imageUrl: string
}

export interface WatchlistStock {
  id: string
  stockSymbol: string
  stockName: string
  logoUrl: string | null
  category: 'swing' | 'short_term' | 'long_term'
  entryPrice: number | null
  targetPrice: number | null
  stopLoss: number | null
  currentPrice: number | null
  analystRating: string | null
  notes: string | null
  sortOrder: number
  restricted: boolean
  createdAt: string
}

export interface PortfolioHolding {
  id: string
  stockSymbol: string
  stockName: string
  logoUrl: string | null
  avgBuyPrice: string | null
  currentPrice: string | null
  totalShares: number | null
  allocationPercent: string | null
  sortOrder: number
  restricted: boolean
  createdAt: string
}
