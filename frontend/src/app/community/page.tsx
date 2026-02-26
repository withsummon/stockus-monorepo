'use client'

import Image from 'next/image'
import Link from 'next/link'
import { OpenCommunity } from '@/components/sections/OpenCommunity'
import { PremiumCommunity } from '@/components/sections/PremiumCommunity'
import { CommunityGuidelines } from '@/components/sections/CommunityGuidelines'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { ArrowUpRight } from 'lucide-react'

/* Decorative visual elements for each card — with looping idle animations */
function ResearchCardStack() {
  return (
    <div className="relative w-full h-[140px] md:h-[160px]">
      {/* Back card — gentle float */}
      <motion.div
        className="absolute top-0 left-4 right-8 h-[90px] rounded-xl bg-slate-100 border border-slate-200/60 shadow-sm"
        animate={{ y: [0, -4, 0], rotate: [-2, -1, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Middle card — offset float */}
      <motion.div
        className="absolute top-3 left-2 right-6 h-[90px] rounded-xl bg-white border border-slate-200/80 shadow-sm p-4"
        animate={{ y: [0, -5, 0], rotate: [1, 2, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-2 h-2 rounded-full bg-brand/60" />
          <div className="h-2 w-16 rounded-full bg-slate-200" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-slate-100" />
          <div className="h-1.5 w-3/4 rounded-full bg-slate-100" />
        </div>
      </motion.div>
      {/* Front card — slight bob */}
      <motion.div
        className="absolute top-7 left-0 right-4 h-[90px] rounded-xl bg-white border border-slate-200 shadow-md p-4"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 rounded-md bg-brand/15 flex items-center justify-center">
            <div className="w-2 h-2 rounded-sm bg-brand" />
          </div>
          <div className="h-2.5 w-20 rounded-full bg-slate-800/80" />
          <div className="ml-auto text-[8px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">Thesis</div>
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-slate-100" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
        </div>
      </motion.div>
    </div>
  )
}

function ConvictionChart() {
  const bars = [30, 38, 34, 45, 42, 55, 52, 68, 78, 92]
  return (
    <div className="relative w-full h-[140px] md:h-[160px]">
      {/* Y axis label */}
      <div
        className="absolute top-2 left-0 text-[7px] font-bold text-slate-300 uppercase tracking-widest font-montserrat"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        Conviction
      </div>
      {/* Bar chart with looping pulse */}
      <div className="absolute bottom-3 left-5 right-2 top-4 flex items-end gap-[5px]">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              background: i >= 7
                ? 'linear-gradient(to top, #F96E00, #F96E00dd)'
                : `rgba(249, 110, 0, ${0.12 + i * 0.045})`,
            }}
            animate={{ height: [`${h}%`, `${h + 4}%`, `${h}%`] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
      </div>
      {/* Trend line — marching ants */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 160" fill="none">
        <motion.path
          d="M18 128 C50 115, 70 105, 95 85 S140 48, 185 18"
          stroke="#F96E00"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
          initial={{ strokeDasharray: '5 4', strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: [0, -18] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  )
}

function PeerBubbles() {
  return (
    <div className="relative w-full h-[140px] md:h-[160px]">
      {/* Background bubble — gentle float */}
      <motion.div
        className="absolute top-2 right-2 w-[70%] rounded-2xl rounded-br-md bg-slate-100 border border-slate-200/60 p-3.5 shadow-sm"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-slate-200" />
          <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="w-4 h-4 rounded-full bg-slate-300" />
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>
      </motion.div>
      {/* Front bubble — offset float */}
      <motion.div
        className="absolute bottom-4 left-0 w-[75%] rounded-2xl rounded-bl-md bg-white border border-slate-200 p-3.5 shadow-md"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center">
            <span className="text-[7px] font-bold text-brand">S</span>
          </div>
          <div className="h-2 w-14 rounded-full bg-slate-800/70" />
          <div className="ml-auto text-[7px] text-slate-400">now</div>
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-slate-100" />
          <div className="h-1.5 w-3/5 rounded-full bg-slate-100" />
        </div>
        <div className="flex gap-1 mt-2.5">
          <div className="text-[8px] bg-brand/10 text-brand font-bold px-2 py-0.5 rounded-full">+1</div>
          <div className="text-[8px] bg-slate-100 text-slate-400 font-medium px-2 py-0.5 rounded-full">Reply</div>
        </div>
      </motion.div>
    </div>
  )
}

export default function CommunityPage() {
  const { t } = useTranslation()

  const differences = [
    {
      title: t('communityPage.diff1.title'),
      description: t('communityPage.diff1.desc'),
    },
    {
      title: t('communityPage.diff2.title'),
      description: t('communityPage.diff2.desc'),
    },
    {
      title: t('communityPage.diff3.title'),
      description: t('communityPage.diff3.desc'),
    },
  ]

  return (
    <main className="bg-[#f4f4f5] min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-4 md:pb-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-[fadeInUp_0.6s_ease-out_both]">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 text-brand text-xs font-bold tracking-[0.15em] uppercase font-montserrat">
              <span className="text-brand">&#x2727;</span>
              {t('communityPage.subtitle')}
            </span>
          </div>

          <h1 className="mt-7 text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-montserrat leading-[1.1] tracking-tight text-main-black animate-[fadeInUp_0.7s_ease-out_0.12s_both]">
            {t('communityPage.differenceTitle')}{' '}
            <span className="font-extrabold text-brand">{t('communityPage.differenceTitleBold')}</span>{' '}
            {t('communityPage.differenceTitleEnd')}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-500 font-montserrat font-light max-w-xl leading-relaxed animate-[fadeInUp_0.7s_ease-out_0.25s_both]">
            {t('communityPage.subtitle2')}
          </p>
        </div>
      </section>

      {/* Difference Cards — staggered editorial layout */}
      <section className="px-4 sm:px-6 lg:px-8 pb-14 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { visual: <ResearchCardStack />, idx: 0, delay: 0 },
              { visual: <ConvictionChart />, idx: 1, delay: 0.1 },
              { visual: <PeerBubbles />, idx: 2, delay: 0.2 },
            ].map((card) => (
              <ScrollReveal key={card.idx} variant="fadeUp" delay={card.delay}>
                <motion.div
                  className="group bg-white rounded-[24px] border border-slate-200/80 p-8 md:p-9 flex flex-col h-full min-h-[340px] relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {card.visual}
                  <div className="mt-auto pt-6 space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold font-montserrat text-main-black leading-tight">
                      {differences[card.idx].title}
                    </h3>
                    <p className="text-[15px] text-slate-400 font-montserrat font-light leading-relaxed">
                      {differences[card.idx].description}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <PremiumCommunity />
      <OpenCommunity />
      <CommunityGuidelines />

      {/* CTA Banner */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#f4f4f5]">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal variant="fadeUp">
            <div className="relative overflow-hidden rounded-2xl bg-brand">
              {/* Dot pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10 p-8 md:p-10 lg:p-12">
                {/* Logo card */}
                <div className="flex-shrink-0">
                  <div className="w-[90px] h-[110px] md:w-[100px] md:h-[120px] rounded-2xl bg-white shadow-lg flex items-center justify-center -rotate-6">
                    <Image
                      src="/stockus.webp"
                      alt="StockUs"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold font-montserrat text-white">
                    {t('communityPage.ctaTitle')}
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-white/80 font-montserrat font-light max-w-lg">
                    {t('communityPage.ctaText')}
                  </p>
                </div>

                {/* Button */}
                <div className="flex-shrink-0">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border-2 border-white/80 text-white font-bold font-montserrat text-sm tracking-wide hover:bg-white hover:text-brand transition-colors duration-200"
                  >
                    {t('communityPage.ctaButton')}
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
