'use client'

import React from 'react'
import Link from 'next/link'
import { Check, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function CommunityFeatures() {
  const { t } = useTranslation()

  const features = [
    {
      title: t('communityFeatures.f1.title'),
      description: t('communityFeatures.f1.desc'),
      isPremium: false,
    },
    {
      title: t('communityFeatures.f2.title'),
      description: t('communityFeatures.f2.desc'),
      isPremium: false,
    },
    {
      title: t('communityFeatures.f3.title'),
      description: t('communityFeatures.f3.desc'),
      isPremium: false,
    },
    {
      title: t('communityFeatures.f4.title'),
      description: t('communityFeatures.f4.desc'),
      isPremium: true,
    },
    {
      title: t('communityFeatures.f5.title'),
      description: t('communityFeatures.f5.desc'),
      isPremium: false,
    },
    {
      title: t('communityFeatures.f6.title'),
      description: t('communityFeatures.f6.desc'),
      isPremium: true,
    },
  ]

  return (
    <section className="bg-main-black py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto container">
        {/* Header */}
        <div className="text-center space-y-8 mb-16 md:mb-24">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat text-white">
              {t('communityFeatures.title')}
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fadeIn" delay={0.2}>
            <div className="w-full h-[1px] bg-white/20"></div>
          </ScrollReveal>
        </div>

        {/* Features Grid */}
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 md:gap-y-16">
          {features.map((feature, index) => (
            <StaggerItem key={index} variant="fadeUp">
              <div className="flex gap-6 items-start group transition-transform duration-300 hover:translate-x-2">
                <div className={cn(
                  "flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110",
                  feature.isPremium ? "text-brand" : "text-white"
                )}>
                  <Check className="w-8 h-8 md:w-10 md:h-10 border-2 rounded-full p-1 border-current" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className={cn(
                      "text-xl md:text-2xl font-bold font-montserrat",
                      feature.isPremium ? "text-brand" : "text-white"
                    )}>
                      {feature.title}
                    </h3>
                    {feature.isPremium && (
                      <Crown className="w-5 h-5 text-brand fill-brand" />
                    )}
                  </div>
                  <p className="text-slate-300 font-montserrat text-base md:text-lg font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom Button */}
        <ScrollReveal variant="fadeUp" delay={0.4}>
          <div className="mt-20 md:mt-32 flex justify-center">
            <Button
              variant="outline"
              className="w-full border-brand bg-transparent py-8 text-2xl font-montserrat font-semibold text-brand border-2 rounded-[30px] transition-all duration-300 hover:bg-brand hover:text-white hover:scale-[1.02]"
              asChild
            >
              <Link href="/community">{t('communityFeatures.learnMore')}</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
