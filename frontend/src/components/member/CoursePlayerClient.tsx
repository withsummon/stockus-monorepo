'use client'

import { VideoPlayer } from './VideoPlayer'
import { markSessionComplete } from '@/lib/course-progress'

interface CoursePlayerClientProps {
  videoUrl: string
  title: string
  courseId: number
  sessionId: number
  totalSessions: number
}

export function CoursePlayerClient({
  videoUrl,
  title,
  courseId,
  sessionId,
  totalSessions
}: CoursePlayerClientProps) {
  const handleComplete = () => {
    markSessionComplete(courseId, sessionId, totalSessions)
  }

  return (
    <VideoPlayer
      videoUrl={videoUrl}
      title={title}
      onComplete={handleComplete}
    />
  )
}
