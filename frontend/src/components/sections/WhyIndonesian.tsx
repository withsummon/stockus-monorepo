'use client'

import React from 'react'
import Image from 'next/image'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function WhyIndonesian() {
    const { t } = useTranslation()
    return (
        <section className="bg-custom-secondary py-16  ">
            <div className="max-w-4xl mx-auto text-center space-y-4 pb-24">
                <ScrollReveal variant="fadeUp">
                    <h2 className="font-montserrat text-4xl md:text-5xl font-semibold leading-tight text-main-black">
                        {t('whyIndonesian.title')} <br></br> <span className="text-brand block sm:inline">{t('whyIndonesian.titleHighlight')}</span>
                    </h2>
                </ScrollReveal>

                <ScrollReveal variant="fadeUp" delay={0.1}>
                    <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
                        {t('whyIndonesian.subtitle')} <span className="text-main-black font-semibold">{t('whyIndonesian.subtitleBold')}</span> {t('whyIndonesian.subtitleEnd')}
                    </p>
                </ScrollReveal>
            </div>
            <ScrollReveal variant="slideUp" delay={0.2}>
                <div className='2xl:container 2xl:mx-auto'>
                    <Image src="/whyus.png" alt="Why Us" className='w-full h-auto relative z-10 ' width={1920} height={1080} />
                </div>
            </ScrollReveal>
        </section>
    )
}
