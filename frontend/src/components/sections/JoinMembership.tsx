'use client'

import React from 'react'
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

                {/* Membership Card */}
                <ScrollReveal variant="scale" delay={0.2}>
                    <div className="bg-brand max-w-7xl mx-auto rounded-[20px] md:rounded-[20px] p-8 md:p-16 lg:py-10 lg:px-10 flex flex-col lg:flex-row gap-12 lg:gap-24 relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
                        {/* Left Column */}
                        <div className="w-full lg:w-5/12 space-y-8 md:space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-3xl md:text-4xl lg:text-2xl font-bold font-montserrat text-white leading-tight">
                                    {t('joinMembership.cardTitle')}
                                </h3>
                                <p className="text-white/90 font-montserrat text-lg md:text-xl lg:text-lg font-light leading-relaxed max-w-xl">
                                    {t('joinMembership.cardDesc')}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-white text-xl md:text-2xl lg:text-lg font-bold font-montserrat">
                                    {t('joinMembership.investment')}
                                </p>
                                <p className="text-white text-3xl md:text-5xl lg:text-4xl font-bold font-montserrat">
                                    IDR {MEMBERSHIP_PRICE_FORMATTED.replace('Rp ', '')}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <Button
                                    className="bg-white hover:bg-white/90 text-brand rounded-2xl py-6 md:py-8 px-10 md:px-12 text-xl md:text-2xl lg:text-lg font-bold font-montserrat w-full md:w-auto shadow-xl transition-transform hover:scale-105"
                                >
                                    {t('joinMembership.joinNow')}
                                </Button>

                                <p className="text-white text-xl lg:text-lg font-medium font-montserrat text-center md:text-left cursor-pointer hover:underline">
                                    {t('joinMembership.talkToTeam')}
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-full lg:w-7/12 space-y-6 md:space-y-8">
                            <h4 className="text-2xl md:text-3xl lg:text-xl font-bold font-montserrat text-white mb-8">
                                {t('joinMembership.whatsIncluded')}
                            </h4>
                            <StaggerContainer staggerDelay={0.08} className="space-y-4 md:space-y-1">
                                {inclusions.map((item, index) => (
                                    <StaggerItem key={index} variant="fadeLeft">
                                        <li className="flex gap-4 text-white text-lg md:text-xl lg:text-lg font-light leading-snug font-montserrat list-none">
                                            <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-white rounded-full"></span>
                                            {item}
                                        </li>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
