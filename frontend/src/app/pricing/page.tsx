import { Metadata } from 'next'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SITE_NAME, MEMBERSHIP_PRICE, MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Pricing - StockUs Membership',
  description: `Join StockUs membership for ${MEMBERSHIP_PRICE_FORMATTED} per year. Access premium courses, exclusive research, investment templates, and professional community.`,
  openGraph: {
    title: 'Pricing - StockUs Membership',
    description: `Join StockUs membership for ${MEMBERSHIP_PRICE_FORMATTED} per year. Access premium courses, exclusive research, investment templates, and professional community.`,
  },
}

const features = {
  courses: {
    title: 'Kursus',
    icon: '📚',
    free: ['Video intro gratis', 'Materi dasar terbatas'],
    member: ['Akses semua video kursus', 'Materi lengkap & mendalam', 'Certificate of completion', 'Lifetime access'],
  },
  research: {
    title: 'Research',
    icon: '📊',
    free: ['Research preview terbatas'],
    member: ['Semua research reports', 'In-depth analysis', 'Stock recommendations', 'Monthly market outlook'],
  },
  templates: {
    title: 'Templates',
    icon: '📋',
    free: ['Template dasar gratis'],
    member: ['Semua investment templates', 'Financial models', 'Portfolio trackers', 'Due diligence checklists'],
  },
  community: {
    title: 'Community',
    icon: '👥',
    free: ['-'],
    member: ['Private Discord community', 'Monthly live Q&A', 'Networking dengan investors', 'Exclusive webinars'],
  },
}

const faqs = [
  {
    question: 'Apa yang membedakan StockUs dengan platform lain?',
    answer: 'StockUs fokus pada pendekatan terstruktur untuk investasi saham global. Kami tidak hanya memberikan tips atau rekomendasi saham, tapi mengajarkan framework berpikir dan analisis yang bisa digunakan seumur hidup.',
  },
  {
    question: 'Apakah cocok untuk pemula?',
    answer: 'Ya! Kursus kami dirancang dari level fundamental. Anda akan dipandu step-by-step mulai dari konsep dasar hingga analisis mendalam.',
  },
  {
    question: 'Berapa lama akses membership berlaku?',
    answer: 'Membership berlaku 1 tahun sejak tanggal pembayaran. Semua konten yang sudah diakses bisa dilihat kembali selama periode aktif.',
  },
  {
    question: 'Apakah ada garansi uang kembali?',
    answer: 'Ya, kami memberikan 14 hari garansi uang kembali. Jika dalam 14 hari pertama Anda merasa program ini tidak sesuai, kami akan mengembalikan 100% pembayaran Anda.',
  },
  {
    question: 'Bagaimana cara pembayaran?',
    answer: 'Kami menerima berbagai metode pembayaran melalui Midtrans: transfer bank, kartu kredit, e-wallet (GoPay, OVO, Dana), dan Indomaret/Alfamart.',
  },
  {
    question: 'Apakah bisa konsultasi langsung?',
    answer: 'Member bisa bertanya di Discord community dan mengikuti monthly live Q&A session. Untuk konsultasi portfolio pribadi, tersedia add-on service terpisah.',
  },
]

export default function PricingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${SITE_NAME} Membership`,
    description: 'Annual membership for structured global equity investing education',
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: MEMBERSHIP_PRICE,
      priceCurrency: 'IDR',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://stockus.id/pricing',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">
            Investasi Terbaik untuk Masa Depan Anda
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Satu Membership, Akses Semua
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bergabung dengan ratusan investor yang belajar pendekatan terstruktur investasi saham global
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-20">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-2">StockUs Member</CardTitle>
              <CardDescription>Akses penuh ke semua fitur</CardDescription>
              <div className="mt-6">
                <div className="text-5xl font-bold">{MEMBERSHIP_PRICE_FORMATTED}</div>
                <div className="text-muted-foreground mt-2">per tahun</div>
                <div className="text-sm text-muted-foreground mt-1">
                  ~{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(MEMBERSHIP_PRICE / 12)}/bulan
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Akses semua video kursus selamanya</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Semua research reports & analysis</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Investment templates & tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Private Discord community</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Monthly live Q&A sessions</span>
                </li>
                <li className="flex items-start">
                  <Check className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>14 hari garansi uang kembali</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg">
                <Link href="/auth/register">Mulai Sekarang</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Features by Category */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Apa yang Anda Dapatkan</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(features).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <span>{category.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground mb-2">Gratis:</div>
                      <ul className="space-y-1">
                        {category.free.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-start">
                            {item === '-' ? (
                              <span className="text-muted-foreground italic">{item}</span>
                            ) : (
                              <>
                                <span className="mr-2 text-muted-foreground">•</span>
                                <span>{item}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary mb-2">Member:</div>
                      <ul className="space-y-1">
                        {category.member.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-start">
                            <Check className="mr-2 h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Gratis vs Member</h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Fitur</th>
                        <th className="text-center p-4 font-semibold">Gratis</th>
                        <th className="text-center p-4 font-semibold bg-primary/5">Member</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4">Video kursus</td>
                        <td className="text-center p-4">
                          <span className="text-sm text-muted-foreground">Intro only</span>
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          <Check className="h-5 w-5 text-primary inline" />
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Research reports</td>
                        <td className="text-center p-4">
                          <span className="text-sm text-muted-foreground">Preview</span>
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          <Check className="h-5 w-5 text-primary inline" />
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Investment templates</td>
                        <td className="text-center p-4">
                          <span className="text-sm text-muted-foreground">Basic</span>
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          <Check className="h-5 w-5 text-primary inline" />
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Private community</td>
                        <td className="text-center p-4">
                          <X className="h-5 w-5 text-muted-foreground inline" />
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          <Check className="h-5 w-5 text-primary inline" />
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Live Q&A sessions</td>
                        <td className="text-center p-4">
                          <X className="h-5 w-5 text-muted-foreground inline" />
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          <Check className="h-5 w-5 text-primary inline" />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Certificate</td>
                        <td className="text-center p-4">
                          <X className="h-5 w-5 text-muted-foreground inline" />
                        </td>
                        <td className="text-center p-4 bg-primary/5">
                          <Check className="h-5 w-5 text-primary inline" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Pertanyaan Umum</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Siap Memulai Perjalanan Investasi Anda?</CardTitle>
              <CardDescription className="text-base">
                Bergabung sekarang dan dapatkan akses penuh ke semua konten premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/register">Daftar Sekarang - {MEMBERSHIP_PRICE_FORMATTED}/tahun</Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                14 hari garansi uang kembali • Batalkan kapan saja
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
