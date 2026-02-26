'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FaDiscord } from 'react-icons/fa'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'

function IconCheck({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

export function OpenCommunity() {
    const { t } = useTranslation()

    const inclusions = [
        t('openCommunity.inclusion1'),
        t('openCommunity.inclusion2'),
        t('openCommunity.inclusion3'),
    ]

    const steps = [
        { number: 1, text: t('openCommunity.step1') },
        { number: 2, text: t('openCommunity.step2') },
        { number: 3, text: t('openCommunity.step3') },
    ]

    return (
        <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#f4f4f5]">
            <div className="container mx-auto max-w-6xl">
                {/* Section label */}
                <ScrollReveal variant="fadeUp">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 text-brand text-xs font-bold tracking-[0.15em] uppercase font-montserrat mb-6">
                        {t('openCommunity.badge')}
                    </span>
                </ScrollReveal>
                <ScrollReveal variant="fadeUp" delay={0.1}>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat text-main-black tracking-tight mb-3">
                        {t('openCommunity.title')}
                    </h2>
                </ScrollReveal>
                <ScrollReveal variant="fadeUp" delay={0.15}>
                    <p className="text-base md:text-lg text-slate-500 font-montserrat font-light max-w-xl mb-10">
                        {t('openCommunity.subtitle')}
                    </p>
                </ScrollReveal>

                {/* Bento-style card */}
                <ScrollReveal variant="fadeUp" delay={0.2}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* Left — Discord preview (takes 3 cols) */}
                        <motion.div
                            className="lg:col-span-3 relative rounded-3xl overflow-hidden bg-main-black min-h-[320px] lg:min-h-[420px] group"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Image
                                src="/community.webp"
                                alt="Discord Community Preview"
                                fill
                                className="object-cover object-center opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                loading="lazy"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <Button
                                    variant="brand"
                                    className="rounded-full py-5 px-6 text-sm font-bold font-montserrat inline-flex items-center gap-2.5 shadow-xl"
                                >
                                    <FaDiscord className="w-4 h-4" />
                                    {t('openCommunity.joinChannel')}
                                </Button>
                            </div>
                        </motion.div>

                        {/* Right — info stack (takes 2 cols) */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {/* What's Included card */}
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 flex-1">
                                <h3 className="text-sm font-bold font-montserrat text-main-black uppercase tracking-wider mb-4">{t('openCommunity.whatsIncluded')}</h3>
                                <StaggerContainer staggerDelay={0.06} className="space-y-3">
                                    {inclusions.map((item, idx) => (
                                        <StaggerItem key={idx} variant="fadeLeft">
                                            <li className="flex items-start gap-2.5 font-montserrat text-[15px] text-slate-600 font-light list-none">
                                                <span className="mt-0.5 w-5 h-5 rounded-md bg-brand/10 flex items-center justify-center flex-shrink-0">
                                                    <IconCheck className="w-3 h-3 text-brand" />
                                                </span>
                                                {item}
                                            </li>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </div>

                            {/* How to Join card */}
                            <div className="bg-main-black rounded-2xl p-6 flex-1">
                                <h3 className="text-sm font-bold font-montserrat text-white uppercase tracking-wider mb-4">{t('openCommunity.howToJoin')}</h3>
                                <StaggerContainer staggerDelay={0.08} className="space-y-3.5">
                                    {steps.map((step) => (
                                        <StaggerItem key={step.number} variant="fadeUp">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center font-bold font-montserrat text-[11px] flex-shrink-0 mt-0.5">
                                                    {step.number}
                                                </div>
                                                <span className="text-[15px] text-white/75 font-montserrat font-light leading-snug">
                                                    {step.text.includes('"') ? (
                                                        <>
                                                            {step.text.split('"')[0]}
                                                            <span className="font-semibold text-white">&ldquo;{step.text.split('"')[1]}&rdquo;</span>
                                                            {step.text.split('"')[2]}
                                                        </>
                                                    ) : step.text}
                                                </span>
                                            </div>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
