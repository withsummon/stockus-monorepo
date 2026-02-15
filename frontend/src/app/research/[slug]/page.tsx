import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUser } from '@/lib/auth/dal'
import { fetchAPI } from '@/lib/api-client-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

  let report: ResearchReportDetail | null = null

  try {
    const data = await fetchAPI<{ report: ResearchReportDetail }>(`/research/${slug}`, {
      revalidate: 300,
    })
    report = data.report
  } catch (error: any) {
    if (error.status === 403) {
      return (
        <div className="bg-[#f5f7fa] min-h-screen py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/research"
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Riset
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-[#3b5998]" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Konten Premium</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Laporan ini hanya tersedia untuk member. Upgrade untuk membaca laporan lengkap.
              </p>
              <Link
                href={user ? '/pricing' : '/signup'}
                className="inline-flex items-center bg-[#3b5998] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#2d4373] transition-colors"
              >
                {user ? 'Upgrade ke Member' : 'Daftar Sekarang'}
              </Link>
            </div>
          </div>
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

  return (
    <div className="bg-[#f5f7fa] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          href="/research"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Riset
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-800">{report.title}</h1>
              <Badge variant={report.isFreePreview ? 'secondary' : 'default'}>
                {report.isFreePreview ? 'Free' : 'Member'}
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
          <p className="text-lg text-slate-500 mb-2">{report.summary}</p>
          {report.publishedAt && (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(report.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <CardContent className="pt-6">
                {report.content ? (
                  <div
                    className="prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(report.content) }}
                  />
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    Konten laporan akan segera tersedia.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

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
    </div>
  )
}
