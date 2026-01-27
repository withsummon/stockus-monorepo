import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Komunitas',
  description: 'Bergabunglah dengan komunitas investor StockUs. Diskusi strategi investasi, analisis saham, dan belajar bersama di Discord kami.',
  openGraph: {
    title: 'Komunitas | StockUs',
    description: 'Bergabunglah dengan komunitas investor StockUs. Diskusi strategi investasi, analisis saham, dan belajar bersama di Discord kami.',
  },
}

const freeFeatures = [
  'Akses ke channel diskusi umum',
  'Update pasar dan berita',
  'Tips investasi mingguan',
  'Networking dengan sesama investor',
]

const premiumFeatures = [
  'Semua benefit Free tier',
  'Akses ke channel riset eksklusif',
  'Diskusi langsung dengan instructor',
  'Q&A session rutin',
  'Channel untuk course members',
  'Akses ke template dan tools',
  'Priority support',
]

const guidelines = [
  'Hormati sesama member dan jaga sikap profesional',
  'No spam, no promosi produk/jasa tanpa izin',
  'Diskusi berbasis data dan analisis, bukan rumor',
  'Jaga privasi - jangan share informasi pribadi orang lain',
  'Help others - share knowledge dan pengalaman Anda',
  'Stay on topic - gunakan channel yang sesuai',
]

export default function CommunityPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-slate-50 to-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Bergabung dengan Komunitas
          </h1>
          <p className="text-lg text-slate-600 md:text-xl">
            Diskusi, belajar, dan berkembang bersama investor lain di komunitas Discord kami
          </p>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Mengapa Bergabung?</h2>
          <div className="space-y-6 text-lg leading-relaxed text-slate-700">
            <p>
              Investasi bukan hanya tentang analisis angka dan laporan keuangan. Komunitas yang supportive
              dan collaborative memberikan perspektif baru, feedback konstruktif, dan dukungan moral ketika
              pasar sedang volatile.
            </p>
            <p>
              Di komunitas Discord StockUs, Anda akan terhubung dengan investor lain yang juga sedang
              belajar dan mengembangkan strategi investasi mereka. Diskusi real-time, sharing insight,
              dan belajar dari pengalaman orang lain—semua dalam satu tempat.
            </p>
          </div>
        </div>
      </section>

      {/* Community Tiers */}
      <section className="border-y bg-slate-50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Pilihan Akses Komunitas</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Tier */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="mb-2">
                  <Badge variant="secondary">Gratis</Badge>
                </div>
                <CardTitle className="text-2xl">Free Community</CardTitle>
                <p className="mt-2 text-slate-600">
                  Bergabung dengan channel diskusi publik
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <a
                    href="https://discord.gg/stockus"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Discord
                  </a>
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Tier */}
            <Card className="flex flex-col border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="mb-2">
                  <Badge className="bg-blue-600 hover:bg-blue-700">Premium</Badge>
                </div>
                <CardTitle className="text-2xl">Member Community</CardTitle>
                <p className="mt-2 text-slate-600">
                  Akses penuh ke semua channel eksklusif
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/pricing">Lihat Membership</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Community Guidelines</h2>
          <p className="mb-8 text-center text-slate-600">
            Untuk menjaga kualitas diskusi dan menciptakan lingkungan yang produktif, mohon ikuti panduan berikut:
          </p>
          <ol className="space-y-4">
            {guidelines.map((guideline, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                  {index + 1}
                </span>
                <span className="pt-1 text-slate-700">{guideline}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 px-6 py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Siap Bergabung?</h2>
          <p className="mb-8 text-lg text-slate-300">
            Join komunitas kami hari ini dan mulai diskusi dengan investor lain
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary">
              <a
                href="https://discord.gg/stockus"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Free Community
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
              <Link href="/pricing">Upgrade ke Member</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
