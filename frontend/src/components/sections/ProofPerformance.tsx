'use client'

import Image from 'next/image'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function ProofPerformance() {
  const { t } = useTranslation()

  return (
    <section className="relative py-20 md:py-28 bg-main-black overflow-hidden">
      {/* SVG mesh background */}
      <div className="absolute inset-0 z-0 opacity-[0.07]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="proof-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#F96E00" strokeWidth="1" />
            </pattern>
            <pattern id="proof-dots" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1.5" fill="#F96E00" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#proof-grid)" />
          <rect width="100%" height="100%" fill="url(#proof-dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <ScrollReveal variant="fadeUp">
          <p className="text-sm font-semibold text-brand mb-3 tracking-wider uppercase font-montserrat text-center">
            {t('hero.proofLabel')}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" delay={0.15}>
          <div className="relative mt-8">
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/proof.jpeg"
                alt="Real portfolio performance"
                width={1200}
                height={300}
                className="w-full h-auto"
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
