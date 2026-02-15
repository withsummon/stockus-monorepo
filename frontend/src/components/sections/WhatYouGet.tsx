'use client'

import React from 'react'
import Image from 'next/image'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface ResourceItemProps {
    title: string
    description: string
}

function ResourceItem({ title, description }: ResourceItemProps) {
    return (
        <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 mt-1">
                <Image src="/files.svg" alt="File icon" width={24} height={24} className="w-6 h-auto" />
            </div>
            <div className="space-y-2 md:space-y-3">
                <h4 className="text-lg md:text-xl font-bold text-main-black font-montserrat leading-tight">
                    {title}
                </h4>
                <p className="text-slate-600 font-light text-sm md:text-base leading-snug font-montserrat">
                    {description}
                </p>
            </div>
        </div>
    )
}

interface ResourceCardProps {
    title: string
    items: ResourceItemProps[]
    delay?: number
}

function ResourceCard({ title, items, delay = 0 }: ResourceCardProps) {
    return (
        <ScrollReveal variant="fadeUp" delay={delay}>
            <div className="bg-white rounded-[25px] md:rounded-[40px] p-6 md:p-12 shadow-sm border border-slate-100 h-full flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="bg-brand text-white text-center py-3 md:py-4 px-6 md:px-8 rounded-full text-lg md:text-2xl font-bold font-montserrat mb-6 md:mb-10 inline-block self-center w-full">
                    {title}
                </div>
                <StaggerContainer staggerDelay={0.1} className="space-y-6 md:space-y-8 flex-grow">
                    {items.map((item, index) => (
                        <StaggerItem key={index} variant="fadeUp">
                            <ResourceItem title={item.title} description={item.description} />
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </ScrollReveal>
    )
}

export function WhatYouGet() {
    const { t } = useTranslation()

    const toolsAndTemplates = [
        { title: t('whatYouGet.tools.item1.title'), description: t('whatYouGet.tools.item1.desc') },
        { title: t('whatYouGet.tools.item2.title'), description: t('whatYouGet.tools.item2.desc') },
        { title: t('whatYouGet.tools.item3.title'), description: t('whatYouGet.tools.item3.desc') },
        { title: t('whatYouGet.tools.item4.title'), description: t('whatYouGet.tools.item4.desc') },
        { title: t('whatYouGet.tools.item5.title'), description: t('whatYouGet.tools.item5.desc') },
    ]

    const digitalLibrary = [
        { title: t('whatYouGet.library.item1.title'), description: t('whatYouGet.library.item1.desc') },
        { title: t('whatYouGet.library.item2.title'), description: t('whatYouGet.library.item2.desc') },
        { title: t('whatYouGet.library.item3.title'), description: t('whatYouGet.library.item3.desc') },
        { title: t('whatYouGet.library.item4.title'), description: t('whatYouGet.library.item4.desc') },
        { title: t('whatYouGet.library.item5.title'), description: t('whatYouGet.library.item5.desc') },
    ]

    return (
        <section className="bg-custom-secondary py-12 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto container">
                {/* Section Header */}
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <ScrollReveal variant="fadeUp">
                        <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-main-black leading-tight">
                            <span className="text-brand">{t('whatYouGet.titleHighlight')}</span> <br />
                            {t('whatYouGet.titleEnd')}
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.1}>
                        <p className="text-main-black font-normal text-lg md:text-xl max-w-3xl mx-auto container font-montserrat">
                            {t('whatYouGet.subtitle')}
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    <ResourceCard title={t('whatYouGet.toolsTitle')} items={toolsAndTemplates} delay={0} />
                    <ResourceCard title={t('whatYouGet.libraryTitle')} items={digitalLibrary} delay={0.2} />
                </div>
            </div>
        </section>
    )
}
