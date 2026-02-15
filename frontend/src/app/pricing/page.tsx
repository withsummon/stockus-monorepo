'use client'

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
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
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
        className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(0deg, #F96E00 0%, #000000 69.13%)'
        }}
      >
        <div className="container mx-auto max-w-7xl">
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

          {/* New Membership Card */}
          <ScrollReveal variant="scale" delay={0.2}>
            <div className="max-w-3xl mx-auto">
              <motion.div
                className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-2 border-brand/20 p-8 md:p-16 flex flex-col items-center space-y-12"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Card Header */}
                <div className="text-center space-y-2">
                  <ScrollReveal variant="fadeUp" delay={0.3}>
                    <h2 className="text-3xl md:text-5xl font-bold font-montserrat text-main-black tracking-tight">
                      {t('pricing.cardTitle')}
                    </h2>
                  </ScrollReveal>
                  <ScrollReveal variant="fadeUp" delay={0.4}>
                    <p className="text-slate-500 text-lg md:text-xl font-montserrat italic font-light">
                      {t('pricing.cardSubtitle')}
                    </p>
                  </ScrollReveal>
                </div>

                {/* Price */}
                <ScrollReveal variant="scale" delay={0.45}>
                  <div className="text-center space-y-1">
                    <div className="text-3xl md:text-5xl font-bold font-montserrat text-main-black">
                      IDR {MEMBERSHIP_PRICE_FORMATTED.replace('Rp ', '')}
                    </div>
                  </div>
                </ScrollReveal>

                {/* What's Included */}
                <div className="w-full max-w-2xl space-y-6">
                  <ScrollReveal variant="fadeUp" delay={0.5}>
                    <h3 className="text-xl md:text-2xl font-bold font-montserrat text-main-black">
                      {t('pricing.whatsIncluded')}
                    </h3>
                  </ScrollReveal>
                  <StaggerContainer staggerDelay={0.08} className="space-y-4">
                    {inclusions.map((item, index) => (
                      <StaggerItem key={index} variant="fadeLeft">
                        <li className="flex gap-4 text-slate-600 text-base md:text-lg font-light leading-snug font-montserrat list-none">
                          <span className="flex-shrink-0 mt-2.5 w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                          <span>{item}</span>
                        </li>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>

                {/* CTA Button */}
                <ScrollReveal variant="fadeUp" delay={0.6}>
                  <div className="w-full pt-4 text-center space-y-4">
                    <Button
                      asChild
                      className="bg-brand hover:bg-[#e06300] text-white rounded-[20px] py-8 px-12 text-xl md:text-2xl font-bold font-montserrat shadow-xl transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] w-full max-w-md"
                    >
                      <Link href="/auth/register">{t('pricing.joinNow')}</Link>
                    </Button>
                    <p className="text-slate-400 text-sm md:text-base font-montserrat font-light">
                      {t('pricing.limitedSeats')}
                    </p>
                  </div>
                </ScrollReveal>
              </motion.div>
            </div>
          </ScrollReveal>
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
          <ScrollReveal variant="fadeLeft">
            <motion.div
              className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 lg:p-14 max-w-xl w-full space-y-6 border border-slate-50 border-opacity-50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-bold font-montserrat text-brand tracking-tight leading-tight">
                  {t('pricing.readyForMore')}
                </h2>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-montserrat text-main-black tracking-tight">
                  {t('pricing.advancedCourse')}
                </h3>
              </div>

              <p className="text-slate-500 text-base md:text-lg lg:text-xl font-montserrat font-light leading-relaxed">
                {t('pricing.advancedDesc')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="outline"
                  className="border-brand text-brand hover:bg-brand/5 rounded-full py-7 px-8 text-base md:text-lg font-bold font-montserrat flex-1 shadow-sm transition-all duration-300 hover:scale-105"
                >
                  {t('pricing.talkToTeam')}
                </Button>
                <Button
                  className="bg-brand hover:bg-[#e06300] text-white rounded-full py-7 px-8 text-base md:text-lg font-bold font-montserrat flex-1 shadow-md transition-all duration-300 hover:scale-105"
                >
                  {t('pricing.emailUs')}
                </Button>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
      <FAQ />
    </>
  )
}
