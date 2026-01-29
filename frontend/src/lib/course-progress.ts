// Course progress tracking using localStorage

const PROGRESS_KEY = 'stockus_course_progress'

interface CourseProgress {
  courseId: number
  completedSessions: number[]
  completedAt?: string // ISO date string when all sessions completed
}

interface ProgressStore {
  courses: Record<number, CourseProgress>
}

function getProgressStore(): ProgressStore {
  if (typeof window === 'undefined') return { courses: {} }
  try {
    const data = localStorage.getItem(PROGRESS_KEY)
    return data ? JSON.parse(data) : { courses: {} }
  } catch {
    return { courses: {} }
  }
}

function saveProgressStore(store: ProgressStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(store))
}

export function markSessionComplete(courseId: number, sessionId: number, totalSessions: number): boolean {
  const store = getProgressStore()

  if (!store.courses[courseId]) {
    store.courses[courseId] = { courseId, completedSessions: [] }
  }

  const progress = store.courses[courseId]
  if (!progress.completedSessions.includes(sessionId)) {
    progress.completedSessions.push(sessionId)
  }

  // Check if course is now complete
  const isComplete = progress.completedSessions.length >= totalSessions
  if (isComplete && !progress.completedAt) {
    progress.completedAt = new Date().toISOString()
  }

  saveProgressStore(store)
  return isComplete
}

export function getCourseProgress(courseId: number): CourseProgress | null {
  const store = getProgressStore()
  return store.courses[courseId] || null
}

export function isCourseComplete(courseId: number): boolean {
  const progress = getCourseProgress(courseId)
  return !!progress?.completedAt
}

export function isSessionComplete(courseId: number, sessionId: number): boolean {
  const progress = getCourseProgress(courseId)
  return progress?.completedSessions.includes(sessionId) ?? false
}
