'use client'

import React from 'react'
import Image from 'next/image'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function WhosBehind() {
    const { t } = useTranslation()
    return (
        <section className="bg-white py-12 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto container">
                {/* Header */}
                <div className="text-center mb-16 md:mb-20">
                    <ScrollReveal variant="fadeUp">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-main-black leading-tight">
                            {t('whosBehind.title')} <br />
                            <span className="text-brand">{t('whosBehind.titleHighlight')}</span>
                        </h2>
                    </ScrollReveal>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    {/* Left: Image Box */}
                    <ScrollReveal variant="fadeRight" className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[600px] aspect-[4/3]">
                            <Image
                                src="/whosbehind.webp"
                                alt="StockUs Team - Yosua Kho and Jefta Ongkodiputra"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </ScrollReveal>

                    {/* Right: Content Box */}
                    <ScrollReveal variant="fadeLeft" delay={0.2} className="w-full lg:w-1/2 space-y-8 md:space-y-12">
                        <div className="space-y-9">
                            <p className="text-main-black font-montserrat text-lg md:text-xl leading-relaxed">
                                <span className="text-brand font-bold">StockUs</span> {t('whosBehind.p1')}
                            </p>

                            <p className="text-slate-600 font-montserrat text-lg md:text-xl font-light leading-relaxed">
                                {t('whosBehind.p2')}
                            </p>

                            <p className="text-slate-600 font-montserrat text-lg md:text-xl font-light leading-relaxed">
                                {t('whosBehind.p3')}
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
