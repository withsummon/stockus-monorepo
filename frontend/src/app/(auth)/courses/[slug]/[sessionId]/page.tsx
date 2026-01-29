import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/dal'
import { fetchAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CoursePlayerClient } from '@/components/member/CoursePlayerClient'
import { SITE_NAME } from '@/lib/constants'
import type { CourseWithSessions, CourseSession } from '@/types'
import { ArrowLeft, ArrowRight, BookOpen, Lock } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string; sessionId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, sessionId } = await params
  try {
    const data = await fetchAPI<{ course: CourseWithSessions }>(`/courses/${slug}`)
    const session = data.course.sessions?.find(s => s.id === parseInt(sessionId))
    return {
      title: `${session?.title || 'Sesi'} - ${data.course.title} - ${SITE_NAME}`,
    }
  } catch {
    return {
      title: `Kursus - ${SITE_NAME}`,
    }
  }
}

export default async function CoursePlayerPage({ params }: PageProps) {
  const { slug, sessionId } = await params
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  let course: CourseWithSessions | null = null

  try {
    const data = await fetchAPI<{ course: CourseWithSessions }>(`/courses/${slug}`, {
      revalidate: 300,
    })
    course = data.course
  } catch (error: any) {
    if (error.status === 403) {
      redirect('/pricing')
    }
    if (error.status === 404) {
      notFound()
    }
    throw error
  }

  if (!course) {
    notFound()
  }

  const canAccess = user.tier === 'member' || course.isFreePreview

  if (!canAccess) {
    redirect('/pricing')
  }

  const sessions = course.sessions?.sort((a, b) => a.sessionOrder - b.sessionOrder) || []
  const currentIndex = sessions.findIndex(s => s.id === parseInt(sessionId))
  const currentSession = sessions[currentIndex]

  if (!currentSession) {
    notFound()
  }

  const prevSession = currentIndex > 0 ? sessions[currentIndex - 1] : null
  const nextSession = currentIndex < sessions.length - 1 ? sessions[currentIndex + 1] : null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:text-foreground">
          Kursus
        </Link>
        <span>/</span>
        <Link href={`/courses/${slug}`} className="hover:text-foreground">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{currentSession.title}</span>
      </div>

      {/* Video Player */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{currentSession.title}</h1>

        {currentSession.videoUrl ? (
          <CoursePlayerClient
            videoUrl={currentSession.videoUrl}
            title={currentSession.title}
            courseId={course.id}
            sessionId={currentSession.id}
            totalSessions={sessions.length}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Video untuk sesi ini belum tersedia.</p>
            </CardContent>
          </Card>
        )}

        {currentSession.description && (
          <p className="text-muted-foreground">{currentSession.description}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        {prevSession ? (
          <Button variant="outline" asChild>
            <Link href={`/courses/${slug}/${prevSession.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {prevSession.title}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {nextSession ? (
          <Button asChild>
            <Link href={`/courses/${slug}/${nextSession.id}`}>
              {nextSession.title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={`/courses/${slug}`}>
              Kembali ke Kursus
            </Link>
          </Button>
        )}
      </div>

      {/* Session List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Semua Sesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions.map((session, index) => (
              <Link
                key={session.id}
                href={`/courses/${slug}/${session.id}`}
                className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors ${
                  session.id === currentSession.id ? 'bg-muted' : ''
                }`}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  session.id === currentSession.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <span className={session.id === currentSession.id ? 'font-medium' : ''}>
                  {session.title}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
