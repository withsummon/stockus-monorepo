'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE_NAME, MEMBERSHIP_PRICE, MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'
import { FAQ } from '@/components/sections/FAQ'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export default function PricingPage() {
  const { t } = useTranslation()

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

  const inclusions = [
    t('joinMembership.inclusion1'),
    t('joinMembership.inclusion2'),
    t('joinMembership.inclusion3'),
    t('joinMembership.inclusion4'),
    t('joinMembership.inclusion5'),
    t('joinMembership.inclusion6'),
    t('joinMembership.inclusion7'),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-main-black"
      >
        {/* SVG Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-[0.07]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#F96E00" strokeWidth="1" />
              </pattern>
              <pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1.5" fill="#F96E00" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        {/* Radial glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-brand/10 blur-[150px] z-0" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand/5 blur-[120px] z-0" />
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Hero Header */}
          <div className="text-center mb-16 space-y-4">
            <ScrollReveal variant="fadeUp">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-white leading-tight tracking-tight text-wrap-balance">
                {t('pricing.title')}
              </h1>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.15}>
              <p className="text-white text-lg md:text-2xl font-montserrat font-light text-wrap-balance">
                {t('pricing.subtitle')} <span className="text-[#F96E00] font-bold">{t('pricing.subtitleHighlight')}</span>
              </p>
            </ScrollReveal>
          </div>

          {/* Membership Card - Horizontal Layout */}
          <ScrollReveal variant="scale" delay={0.2}>
            <div className="max-w-7xl mx-auto rounded-[20px] border-2 border-brand p-8 md:p-12 lg:p-10 flex flex-col lg:flex-row gap-10 lg:gap-0 relative overflow-hidden bg-main-black">
              {/* Left: What's Included */}
              <div className="w-full lg:w-1/2 space-y-6 lg:pr-10 lg:border-r lg:border-white/20">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-white italic">
                    {t('pricing.whatsIncluded')}
                  </h2>
                </div>
                <StaggerContainer staggerDelay={0.08} className="space-y-4">
                  {inclusions.map((item, index) => (
                    <StaggerItem key={index} variant="fadeLeft">
                      <li className="flex gap-3 items-start text-white text-base md:text-lg font-light leading-snug font-montserrat list-none">
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand" />
                        {item}
                      </li>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>

              {/* Right: Pricing & CTA */}
              <div className="w-full lg:w-1/2 lg:pl-10 flex flex-col items-center justify-center space-y-8">
                <div className="text-center space-y-2">
                  <p className="text-white/60 text-lg font-montserrat font-medium">
                    {t('pricing.cardSubtitle')}
                  </p>
                  <p className="text-white text-4xl md:text-5xl font-bold font-montserrat">
                    IDR {MEMBERSHIP_PRICE_FORMATTED.replace('Rp ', '')}
                  </p>
                </div>

                <Button
                  asChild
                  className="bg-brand hover:bg-[#e06300] text-white rounded-full py-6 md:py-8 px-12 md:px-16 text-xl md:text-2xl font-bold font-montserrat w-full max-w-sm shadow-xl transition-transform hover:scale-105"
                >
                  <Link href="/auth/register">{t('pricing.joinNow')}</Link>
                </Button>

                <p className="text-white/60 text-sm font-montserrat text-center">
                  {t('pricing.limitedSeats')}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* Ready For More - CTA Section */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-main-black overflow-hidden">
        {/* SVG Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-[0.05]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#F96E00" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand/10 blur-[200px] z-0" />

        <div className="container mx-auto max-w-4xl relative z-10 text-center space-y-8">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat text-white tracking-tight leading-tight">
              {t('pricing.readyForMore')}
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h3 className="text-2xl md:text-3xl font-bold font-montserrat text-brand tracking-tight">
              {t('pricing.advancedCourse')}
            </h3>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="text-white/70 text-lg md:text-xl font-montserrat font-light leading-relaxed max-w-2xl mx-auto">
              {t('pricing.advancedDesc')}
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent rounded-full py-7 px-10 text-base md:text-lg font-bold font-montserrat shadow-sm transition-all duration-300 hover:scale-105"
              >
                {t('pricing.talkToTeam')}
              </Button>
              <Button
                className="bg-brand hover:bg-[#e06300] text-white rounded-full py-7 px-10 text-base md:text-lg font-bold font-montserrat shadow-md transition-all duration-300 hover:scale-105"
              >
                {t('pricing.emailUs')}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FAQ />
    </>
  )
}
