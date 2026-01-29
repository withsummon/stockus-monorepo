import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/dal'
import { fetchAPI } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CourseCertificate } from '@/components/member/CourseCertificate'
import { SITE_NAME } from '@/lib/constants'
import type { CourseWithSessions } from '@/types'
import { Play, Lock, Clock, BookOpen } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const data = await fetchAPI<{ course: CourseWithSessions }>(`/courses/${slug}`)
    return {
      title: `${data.course.title} - ${SITE_NAME}`,
      description: data.course.description,
    }
  } catch {
    return {
      title: `Kursus - ${SITE_NAME}`,
    }
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
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
      // Insufficient permissions - redirect to pricing
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            {course.isFreePreview && (
              <Badge variant="secondary">Preview</Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl">{course.description}</p>
          {canAccess && (
            <div className="pt-2">
              <CourseCertificate
                courseId={course.id}
                courseTitle={course.title}
                userName={user.name}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{course.sessions?.length || 0} Sesi</span>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Daftar Sesi</h2>

        {course.sessions && course.sessions.length > 0 ? (
          <div className="space-y-3">
            {course.sessions
              .sort((a, b) => a.sessionOrder - b.sessionOrder)
              .map((session, index) => {
                const hasVideo = !!session.videoUrl

                return (
                  <Card key={session.id}>
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{session.title}</CardTitle>
                        {session.description && (
                          <CardDescription className="text-sm mt-1 line-clamp-1">
                            {session.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {canAccess && hasVideo ? (
                          <Button size="sm" asChild>
                            <Link href={`/courses/${slug}/${session.id}`}>
                              <Play className="h-4 w-4 mr-1" />
                              Tonton
                            </Link>
                          </Button>
                        ) : !canAccess ? (
                          <Button size="sm" variant="outline" disabled>
                            <Lock className="h-4 w-4 mr-1" />
                            Member Only
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <Clock className="h-4 w-4 mr-1" />
                            Segera Hadir
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Sesi akan segera ditambahkan.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade CTA for Free Users */}
      {!canAccess && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Unlock Kursus Ini</CardTitle>
            <CardDescription>
              Upgrade ke member untuk akses penuh ke semua kursus dan materi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/pricing">Lihat Harga Membership</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
