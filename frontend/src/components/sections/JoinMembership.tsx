'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function JoinMembership() {
    const { t } = useTranslation()

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
        <section className="bg-main-black py-16 md:py-32 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto container">
                {/* Header */}
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <ScrollReveal variant="fadeUp">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-white leading-tight">
                            {t('joinMembership.title')}
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.1}>
                        <p className="text-white text-lg md:text-2xl font-montserrat">
                            {t('joinMembership.subtitle')} <span className="text-brand">{t('joinMembership.subtitleHighlight')}</span>
                        </p>
                    </ScrollReveal>
                </div>

                {/* Membership Card - Horizontal Layout */}
                <ScrollReveal variant="scale" delay={0.2}>
                    <div className="max-w-7xl mx-auto rounded-[20px] border-2 border-brand p-8 md:p-12 lg:p-10 flex flex-col lg:flex-row gap-10 lg:gap-0 relative overflow-hidden bg-main-black">
                        {/* Left: What's Included */}
                        <div className="w-full lg:w-1/2 space-y-6 lg:pr-10 lg:border-r lg:border-white/20">
                            <h4 className="text-2xl md:text-3xl font-bold font-montserrat text-white italic">
                                {t('joinMembership.whatsIncluded')}
                            </h4>
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
                                    {t('joinMembership.investment')}
                                </p>
                                <p className="text-white text-4xl md:text-5xl font-bold font-montserrat">
                                    IDR {MEMBERSHIP_PRICE_FORMATTED.replace('Rp ', '')}
                                </p>
                            </div>

                            <Button
                                className="bg-brand hover:bg-[#e06300] text-white rounded-full py-6 md:py-8 px-12 md:px-16 text-xl md:text-2xl font-bold font-montserrat w-full max-w-sm shadow-xl transition-transform hover:scale-105"
                            >
                                {t('joinMembership.joinNow')}
                            </Button>

                            <p className="text-white/60 text-sm font-montserrat text-center">
                                {t('joinMembership.talkToTeam')}
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
