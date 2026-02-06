import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/dal'
import { fetchAPI } from '@/lib/api-client-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResearchDetailCard } from '@/components/member/ResearchDetailCard'
import { SITE_NAME } from '@/lib/constants'
import { sanitizeHtml } from '@/lib/sanitize'
import type { ResearchReportDetail } from '@/types'
import { ArrowLeft, Calendar, Download, Lock } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const data = await fetchAPI<{ report: ResearchReportDetail }>(`/research/${slug}`)
    return {
      title: `${data.report.title} - ${SITE_NAME}`,
      description: data.report.summary,
    }
  } catch {
    return {
      title: `Riset - ${SITE_NAME}`,
    }
  }
}

export default async function ResearchDetailPage({ params }: PageProps) {
  const { slug } = await params
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  let report: ResearchReportDetail | null = null

  try {
    const data = await fetchAPI<{ report: ResearchReportDetail }>(`/research/${slug}`, {
      revalidate: 300,
    })
    report = data.report
  } catch (error: any) {
    if (error.status === 403) {
      // Show locked state instead of redirect for better UX
      return (
        <div className="space-y-6">
          <Link
            href="/research"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Riset
          </Link>

          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Konten Premium</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Laporan ini hanya tersedia untuk member. Upgrade untuk membaca laporan lengkap.
              </p>
              <Button asChild>
                <Link href="/pricing">Upgrade ke Member</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    if (error.status === 404) {
      notFound()
    }
    throw error
  }

  if (!report) {
    notFound()
  }

  const canAccess = user.tier === 'member' || report.requiredTier === 'free'

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <Link
          href="/research"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Riset
        </Link>

        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Konten Premium</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Laporan ini hanya tersedia untuk member. Upgrade untuk membaca laporan lengkap.
            </p>
            <Button asChild>
              <Link href="/pricing">Upgrade ke Member</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/research"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Riset
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
            <Badge variant={report.requiredTier === 'free' ? 'secondary' : 'default'}>
              {report.requiredTier === 'free' ? 'Free' : 'Member'}
            </Badge>
          </div>
          {report.fileUrl && (
            <Button asChild>
              <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{report.summary}</p>
        {report.publishedAt && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(report.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {report.content ? (
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(report.content) }}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Konten laporan akan segera tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ResearchDetailCard
            stockSymbol={report.stockSymbol}
            stockName={report.stockName}
            analystRating={report.analystRating}
            targetPrice={report.targetPrice}
          />
        </div>
      </div>
    </div>
  )
}
