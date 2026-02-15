'use client'

import React from 'react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function CommunityGuidelines() {
    const { t } = useTranslation()

    const principles = [
        { number: 1, text: t('guidelines.p1') },
        { number: 2, text: t('guidelines.p2') },
        { number: 3, text: t('guidelines.p3') },
        { number: 4, text: t('guidelines.p4') },
    ]

    return (
        <section className="pb-32 px-4 sm:px-6 lg:px-8 bg-main-white">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-32 items-start">
                    {/* Left Column */}
                    <ScrollReveal variant="fadeRight" className="w-full lg:w-1/3">
                        <h2 className="text-4xl md:text-5xl lg:text-3xl font-bold font-montserrat text-main-black leading-tight text-wrap-balance">
                            {t('guidelines.title')}
                        </h2>
                    </ScrollReveal>

                    {/* Right Column */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        <ScrollReveal variant="fadeUp">
                            <h3 className="text-2xl font-bold font-montserrat text-main-black italic">
                                {t('guidelines.ourPrinciples')}
                            </h3>
                        </ScrollReveal>
                        <StaggerContainer staggerDelay={0.12} className="space-y-6">
                            {principles.map((principle) => (
                                <StaggerItem key={principle.number} variant="fadeLeft">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-[#F96E00] text-white flex items-center justify-center font-bold font-montserrat text-lg flex-shrink-0">
                                            {principle.number}
                                        </div>
                                        <p className="text-lg md:text-xl text-main-black font-montserrat font-medium">
                                            {principle.text}
                                        </p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </div>
            </div>
        </section>
    )
}
