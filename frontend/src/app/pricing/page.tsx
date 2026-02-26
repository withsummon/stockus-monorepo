'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { SITE_NAME, MEMBERSHIP_PRICE, MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'
import { FAQ } from '@/components/sections/FAQ'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

/* ── Dark-themed hero illustration: compound growth layers ── */

function CompoundGrowth() {
  const columns = [
    { height: 28, label: 'Y1', pct: '+8%', opacity: 0.15 },
    { height: 38, label: 'Y2', pct: '+19%', opacity: 0.22 },
    { height: 52, label: 'Y3', pct: '+34%', opacity: 0.35 },
    { height: 68, label: 'Y4', pct: '+56%', opacity: 0.55 },
    { height: 82, label: 'Y5', pct: '+81%', opacity: 0.75 },
    { height: 100, label: 'Y6', pct: '+124%', opacity: 1 },
  ]

  return (
    <div className="relative w-full h-full flex items-end justify-center gap-[10px] pb-6 pt-4">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          {/* Percentage label */}
          <motion.span
            className="text-[9px] font-bold font-montserrat tracking-wide"
            style={{ color: `rgba(249, 110, 0, ${Math.max(col.opacity, 0.4)})` }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
          >
            {col.pct}
          </motion.span>

          {/* Stacked layers */}
          <motion.div
            className="w-full relative rounded-t-lg overflow-hidden"
            style={{ height: `${col.height}%` }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          >
            {/* Main fill */}
            <div
              className="absolute inset-0 rounded-t-lg"
              style={{
                background: col.opacity >= 0.75
                  ? 'linear-gradient(to top, #F96E00, #F96E00cc)'
                  : `linear-gradient(to top, rgba(249, 110, 0, ${col.opacity}), rgba(249, 110, 0, ${col.opacity * 0.6}))`,
              }}
            />
            {/* Horizontal layer lines */}
            {Array.from({ length: Math.floor(col.height / 18) }).map((_, j) => (
              <div
                key={j}
                className="absolute left-0 right-0 h-[1px] bg-white/[0.08]"
                style={{ bottom: `${(j + 1) * 18}%` }}
              />
            ))}
            {/* Inner glow on top columns */}
            {col.opacity >= 0.55 && (
              <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-transparent to-white/[0.06]" />
            )}
          </motion.div>

          {/* Year label */}
          <span className="text-[8px] font-bold font-montserrat tracking-[0.15em] text-white/25 uppercase">
            {col.label}
          </span>
        </div>
      ))}

      {/* Base line */}
      <div className="absolute bottom-5 left-0 right-0 h-[1px] bg-white/[0.08]" />
    </div>
  )
}

function CrossMarker({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

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

  const memberFeatures = [
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

      <main className="min-h-screen font-montserrat">
        {/* ── Section 1: Hero (dark) ── */}
        <section className="relative overflow-hidden bg-main-black pt-24 md:pt-32 pb-14 md:pb-20 px-4 sm:px-6 lg:px-8">
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Concentric circle ornament — top right */}
          <div className="absolute -right-20 -top-20 md:right-[8%] md:top-20 opacity-[0.05]">
            <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
              <circle cx="160" cy="160" r="156" stroke="#F96E00" strokeWidth="1" />
              <circle cx="160" cy="160" r="120" stroke="#F96E00" strokeWidth="1" />
              <circle cx="160" cy="160" r="84" stroke="#F96E00" strokeWidth="1" />
              <circle cx="160" cy="160" r="48" stroke="#F96E00" strokeWidth="1.5" />
              <line x1="160" y1="0" x2="160" y2="320" stroke="#F96E00" strokeWidth="0.5" />
              <line x1="0" y1="160" x2="320" y2="160" stroke="#F96E00" strokeWidth="0.5" />
            </svg>
          </div>
          <CrossMarker className="absolute top-6 left-6 text-white/10" />
          <CrossMarker className="absolute top-6 right-6 text-white/10" />

          <div className="container mx-auto max-w-6xl relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
              {/* Left: Copy */}
              <div className="lg:max-w-xl relative z-10">
                <ScrollReveal variant="fadeUp">
                  <span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-bold tracking-[0.15em] uppercase font-montserrat mb-6">
                    Membership
                  </span>
                </ScrollReveal>
                <ScrollReveal variant="fadeUp" delay={0.1}>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-montserrat leading-[1.08] tracking-tight text-white">
                    {t('pricing.heroTitle')}{' '}
                    <span className="font-extrabold text-brand">{t('pricing.heroTitleBold')}</span>
                  </h1>
                </ScrollReveal>
                <ScrollReveal variant="fadeUp" delay={0.2}>
                  <p className="mt-5 text-base md:text-lg text-white/45 font-montserrat font-light leading-relaxed max-w-md">
                    {t('pricing.heroSubtitle')}
                  </p>
                </ScrollReveal>
              </div>

              {/* Right: Compound growth illustration (desktop only) */}
              <div className="hidden lg:block relative w-[340px] h-[280px] flex-shrink-0">
                <CompoundGrowth />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Membership Card (light) ── */}
        <section className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#f4f4f5] overflow-hidden">
          {/* Section background textures */}
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Large concentric circles — left */}
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 opacity-[0.04]">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
              <circle cx="200" cy="200" r="196" stroke="#F96E00" strokeWidth="1" />
              <circle cx="200" cy="200" r="150" stroke="#F96E00" strokeWidth="1" />
              <circle cx="200" cy="200" r="104" stroke="#F96E00" strokeWidth="1" />
              <circle cx="200" cy="200" r="58" stroke="#F96E00" strokeWidth="1.5" />
              <line x1="200" y1="0" x2="200" y2="400" stroke="#F96E00" strokeWidth="0.5" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#F96E00" strokeWidth="0.5" />
            </svg>
          </div>
          {/* Small concentric circles — bottom right */}
          <div className="absolute -right-20 -bottom-20 opacity-[0.03]">
            <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
              <circle cx="130" cy="130" r="126" stroke="#F96E00" strokeWidth="1" />
              <circle cx="130" cy="130" r="88" stroke="#F96E00" strokeWidth="1" />
              <circle cx="130" cy="130" r="50" stroke="#F96E00" strokeWidth="1" />
            </svg>
          </div>
          {/* Diagonal accent lines — top right */}
          <svg className="absolute top-0 right-0 w-[300px] h-[300px] opacity-[0.03]" viewBox="0 0 300 300" fill="none">
            <line x1="100" y1="0" x2="300" y2="200" stroke="#F96E00" strokeWidth="1" />
            <line x1="150" y1="0" x2="300" y2="150" stroke="#F96E00" strokeWidth="1" />
            <line x1="200" y1="0" x2="300" y2="100" stroke="#F96E00" strokeWidth="1" />
            <line x1="250" y1="0" x2="300" y2="50" stroke="#F96E00" strokeWidth="1" />
          </svg>
          {/* Cross markers scattered */}
          <CrossMarker className="absolute top-8 left-8 text-slate-300/30" />
          <CrossMarker className="absolute top-8 right-8 text-slate-300/30" />
          <CrossMarker className="absolute bottom-8 left-8 text-slate-300/30" />
          <CrossMarker className="absolute bottom-8 right-8 text-slate-300/30" />
          <CrossMarker className="absolute top-1/3 right-[15%] text-slate-300/20" />
          <CrossMarker className="absolute bottom-1/3 left-[12%] text-slate-300/20" />
          {/* Ghost watermark */}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] md:text-[22rem] font-black font-montserrat leading-none text-slate-400/[0.06] select-none pointer-events-none">
            $
          </span>

          <div className="container mx-auto max-w-4xl relative">
            <ScrollReveal variant="fadeUp">
              <div className="relative bg-main-black rounded-[24px] border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/10">
                {/* Dot pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                {/* Corner markers */}
                <CrossMarker className="absolute top-4 left-4 text-white/10" />
                <CrossMarker className="absolute top-4 right-4 text-white/10" />
                <CrossMarker className="absolute bottom-4 left-4 text-white/10" />
                <CrossMarker className="absolute bottom-4 right-4 text-white/10" />

                {/* Concentric circle ornament — top right */}
                <div className="absolute -right-16 -top-16 opacity-[0.04]">
                  <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
                    <circle cx="120" cy="120" r="116" stroke="#F96E00" strokeWidth="1" />
                    <circle cx="120" cy="120" r="80" stroke="#F96E00" strokeWidth="1" />
                    <circle cx="120" cy="120" r="44" stroke="#F96E00" strokeWidth="1" />
                  </svg>
                </div>

                <div className="relative p-8 md:p-12 lg:p-14">
                  {/* Top: Plan info + Price side by side */}
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                    {/* Left: Plan name & desc */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-3">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-brand text-[11px] font-bold tracking-[0.12em] uppercase font-montserrat">
                          {t('pricing.memberPlan')}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.06] text-white/50 text-[10px] font-bold tracking-[0.1em] uppercase font-montserrat">
                          {t('pricing.memberBadge')}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-white/40 font-montserrat font-light leading-relaxed max-w-md">
                        {t('pricing.memberDesc')}
                      </p>
                    </div>

                    {/* Right: Price */}
                    <div className="flex-shrink-0 md:text-right">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold font-montserrat text-white tracking-tight leading-none">
                          {MEMBERSHIP_PRICE_FORMATTED}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/30 font-montserrat font-light">
                        / {t('pricing.memberPriceNote')} · {t('pricing.limitedSeats')}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] bg-white/[0.06] mb-8" />

                  {/* Features — 2 column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                    {memberFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-brand" />
                        </div>
                        <span className="text-sm text-white/55 font-montserrat font-light leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href="/checkout"
                    className="w-full inline-flex items-center justify-center px-6 py-4 rounded-full bg-brand text-white font-bold font-montserrat text-base tracking-wide hover:bg-brand/90 transition-colors duration-200"
                  >
                    {t('pricing.joinNow')}
                  </Link>
                </div>

                {/* Bottom accent line */}
                <div className="h-[3px] bg-gradient-to-r from-brand/0 via-brand/40 to-brand/0" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Section 3: FAQ (light) ── */}
        <FAQ />
      </main>
    </>
  )
}
