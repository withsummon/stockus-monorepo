import { Metadata } from 'next'
import Link from 'next/link'
import { getUser } from '@/lib/auth/dal'
import { fetchAPI } from '@/lib/api-client'
import { redirect } from 'next/navigation'
import { EmptyState } from '@/components/member/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SITE_NAME } from '@/lib/constants'
import type { ResearchReport } from '@/types'
import { FileText, Lock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: `Riset - ${SITE_NAME}`,
  description: 'Akses laporan riset dan analisis saham.',
}

export default async function ResearchPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  let reports: ResearchReport[] = []

  try {
    const data = await fetchAPI<{ reports: ResearchReport[] }>('/research', {
      revalidate: 300,
    })
    reports = data.reports || []
  } catch {
    reports = []
  }

  // Filter based on user tier
  const accessibleReports = reports.filter(
    report => user.tier === 'member' || report.requiredTier === 'free'
  )
  const lockedReports = reports.filter(
    report => user.tier === 'free' && report.requiredTier === 'member'
  )

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riset</h1>
          <p className="text-muted-foreground">Laporan analisis saham</p>
        </div>
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          title="Belum Ada Laporan Riset"
          description="Laporan riset akan segera tersedia. Pantau terus untuk update terbaru."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riset</h1>
        <p className="text-muted-foreground">
          {user.tier === 'member'
            ? 'Akses semua laporan riset dan analisis saham'
            : 'Upgrade untuk akses ke semua laporan riset'}
        </p>
      </div>

      {/* Accessible Reports */}
      {accessibleReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {user.tier === 'member' ? 'Semua Laporan' : 'Laporan Gratis'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accessibleReports.map((report) => (
              <Link key={report.id} href={`/research/${report.slug}`}>
                <Card className="h-full hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                      <Badge variant={report.requiredTier === 'free' ? 'secondary' : 'default'}>
                        {report.requiredTier === 'free' ? 'Free' : 'Member'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">{report.summary}</CardDescription>
                    {report.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-4">
                        {new Date(report.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Locked Reports for Free Users */}
      {user.tier === 'free' && lockedReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Laporan Member</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedReports.map((report) => (
              <Card key={report.id} className="h-full opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3">{report.summary}</CardDescription>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/pricing">Unlock</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upgrade CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Akses Semua Laporan Riset</CardTitle>
              <CardDescription>
                Upgrade ke member untuk membaca {lockedReports.length} laporan riset premium.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/pricing">
                  Lihat Harga
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
