import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SITE_NAME, MEMBERSHIP_PRICE, MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'
import { FAQ } from '@/components/sections/FAQ'

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

      <div
        className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(0deg, #F96E00 0%, #000000 69.13%)'
        }}
      >
        <div className="container mx-auto max-w-7xl">
          {/* Hero Header */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-white leading-tight tracking-tight text-wrap-balance">
              Join Our Membership
            </h1>
            <p className="text-white text-lg md:text-2xl font-montserrat font-light text-wrap-balance">
              Get started to learn StockUs <span className="text-[#F96E00] font-bold">Fundamentals Course</span>
            </p>
          </div>

          {/* New Membership Card */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-2 border-brand/20 p-8 md:p-16 flex flex-col items-center space-y-12 transition-all duration-300 hover:scale-[1.01]">
              {/* Card Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-5xl font-bold font-montserrat text-main-black tracking-tight">
                  StockUs Fundamentals
                </h2>
                <p className="text-slate-500 text-lg md:text-xl font-montserrat italic font-light">
                  5-Day Intensive
                </p>
              </div>

              {/* Price */}
              <div className="text-center space-y-1">
                <div className="text-3xl md:text-5xl font-bold font-montserrat text-main-black">
                  IDR {MEMBERSHIP_PRICE_FORMATTED.replace('Rp ', '')}
                </div>
              </div>

              {/* What's Included */}
              <div className="w-full max-w-2xl space-y-6">
                <h3 className="text-xl md:text-2xl font-bold font-montserrat text-main-black">
                  What&apos;s Included:
                </h3>
                <ul className="space-y-4">
                  {[
                    '5 Days Of Live, Instructor-Led Sessions',
                    'Full Breakdown Of The StockUs Framework: Business, Industry, Valuation, And Portfolio Construction',
                    'Live Case Study On A Real Global Stock',
                    'Course Materials, Slides, And Templates',
                    'Investment Checklist, Valuation Template, And Journal Template (SOON!)',
                    'Access To Member Discussion Channels During The Cohort',
                    'Limited-Time Access To Session Recordings (T&C Applied)',
                  ].map((item, index) => (
                    <li key={index} className="flex gap-4 text-slate-600 text-base md:text-lg font-light leading-snug font-montserrat">
                      <span className="flex-shrink-0 mt-2.5 w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="w-full pt-4 text-center space-y-4">
                <Button
                  asChild
                  className="bg-brand hover:bg-[#e06300] text-white rounded-[20px] py-8 px-12 text-xl md:text-2xl font-bold font-montserrat shadow-xl transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] w-full max-w-md"
                >
                  <Link href="/auth/register">Join StockUs Now</Link>
                </Button>
                <p className="text-slate-400 text-sm md:text-base font-montserrat font-light">
                  Limited Seats Per Cohort To Keep Sessions Interactive
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
      <section className="relative w-full py-24 md:py-48 overflow-hidden min-h-[700px] 2xl:min-h-[900px] flex items-center">
        {/* Background Image and Blending Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.png"
            alt="Advanced Investing Background"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div
            className="absolute inset-0 z-0 h-1/2"
            style={{
              background: 'linear-gradient(180deg, #F96E00 19.19%, rgba(249, 110, 0, 0) 100%)'
            }}
          />
        </div>

        {/* Instructor Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-full z-0 pointer-events-none hidden lg:block pt-10 ">
          <div className="relative w-full h-full max-w-7xl mx-auto">
            <div className="absolute bottom-20 left-[5%] w-[60%] h-[90%] 2xl:h-full 2xl:scale-150 2xl:bottom-[-20%] 2xl:left-0">
              <Image
                src="/imageonly.png"
                alt="Instructors"
                fill
                className="object-contain object-left-bottom"
                priority
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row justify-end items-center">
          {/* CTA Card */}
          <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 lg:p-14 max-w-xl w-full space-y-6 transition-all duration-300 hover:scale-[1.01] border border-slate-50 border-opacity-50">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-bold font-montserrat text-brand tracking-tight leading-tight">
                Ready For More?
              </h2>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-montserrat text-main-black tracking-tight">
                Advanced Investing Course
              </h3>
            </div>

            <p className="text-slate-500 text-base md:text-lg lg:text-xl font-montserrat font-light leading-relaxed">
              We offer an Advanced course covering complex valuation, sector specialization, and portfolio construction for graduates ready for the next level.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand/5 rounded-full py-7 px-8 text-base md:text-lg font-bold font-montserrat flex-1 shadow-sm transition-all duration-300 hover:scale-105"
              >
                Talk To Our Team
              </Button>
              <Button
                className="bg-brand hover:bg-[#e06300] text-white rounded-full py-7 px-8 text-base md:text-lg font-bold font-montserrat flex-1 shadow-md transition-all duration-300 hover:scale-105"
              >
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </section>
      <FAQ />
    </>
  )
}
