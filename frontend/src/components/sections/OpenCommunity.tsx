'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FaDiscord } from 'react-icons/fa'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'

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
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-main-white">
            <div className="container mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <ScrollReveal variant="fadeUp">
                        <div className="inline-block px-6 py-2 rounded-full border border-[#F96E00] text-[#F96E00] font-montserrat font-bold text-sm tracking-widest uppercase">
                            {t('openCommunity.badge')}
                        </div>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.1}>
                        <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-main-black tracking-tight text-wrap-balance">
                            {t('openCommunity.title')}
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.2}>
                        <p className="text-lg md:text-xl text-slate-600 font-montserrat font-light max-w-2xl mx-auto">
                            {t('openCommunity.subtitle')}
                        </p>
                    </ScrollReveal>
                </div>

                {/* Main Card */}
                <ScrollReveal variant="scale" delay={0.2}>
                    <motion.div
                        className="rounded-[40px] overflow-hidden shadow-xl flex flex-col lg:flex-row relative min-h-[600px]"
                        style={{
                            background: 'radial-gradient(89.81% 130.7% at 95.86% 105.24%, #F96E00 0%, #FFFFFF 74.69%)'
                        }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Left Content */}
                        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center space-y-12 z-10">
                            {/* What's Included */}
                            <ScrollReveal variant="fadeRight" delay={0.3}>
                                <div className="bg-[#333C44] rounded-2xl p-8 text-white space-y-6 max-w-md shadow-lg">
                                    <h3 className="text-xl font-bold font-montserrat">{t('openCommunity.whatsIncluded')}</h3>
                                    <StaggerContainer staggerDelay={0.1} className="space-y-4">
                                        {inclusions.map((item, idx) => (
                                            <StaggerItem key={idx} variant="fadeLeft">
                                                <li className="flex items-center gap-3 font-montserrat text-lg font-light list-none">
                                                    <span className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                                                    {item}
                                                </li>
                                            </StaggerItem>
                                        ))}
                                    </StaggerContainer>
                                </div>
                            </ScrollReveal>

                            {/* How to Join */}
                            <ScrollReveal variant="fadeUp" delay={0.4}>
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-montserrat text-main-black">{t('openCommunity.howToJoin')}</h3>
                                    <StaggerContainer staggerDelay={0.1} className="space-y-4">
                                        {steps.map((step) => (
                                            <StaggerItem key={step.number} variant="fadeUp">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-[#F96E00] text-white flex items-center justify-center font-bold font-montserrat text-sm flex-shrink-0">
                                                        {step.number}
                                                    </div>
                                                    <span className="text-lg md:text-xl text-main-black font-montserrat font-medium">
                                                        {step.text.includes('"') ? (
                                                            <>
                                                                {step.text.split('"')[0]}
                                                                <span className="italic font-bold">&ldquo;{step.text.split('"')[1]}&rdquo;</span>
                                                                {step.text.split('"')[2]}
                                                            </>
                                                        ) : step.text}
                                                    </span>
                                                </div>
                                            </StaggerItem>
                                        ))}
                                    </StaggerContainer>
                                </div>
                            </ScrollReveal>

                            {/* CTA Button */}
                            <ScrollReveal variant="fadeUp" delay={0.5}>
                                <Button
                                    className="bg-[#F96E00] hover:bg-[#e06300] text-white rounded-full py-6 px-8 text-base md:text-lg font-bold font-montserrat shadow-lg transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] inline-flex items-center gap-3"
                                >
                                    <FaDiscord className="w-5 h-5" />
                                    {t('openCommunity.joinChannel')}
                                </Button>
                            </ScrollReveal>
                        </div>

                        {/* Right Image */}
                        <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-full">
                            <div className="absolute inset-0 lg:left-[-10%] z-0 scale-300 2xl:scale-250">
                                <Image
                                    src="/community.webp"
                                    alt="Discord Community Preview"
                                    fill
                                    className="object-contain object-right translate-y-[3%] translate-x-[7%] 2xl:translate-y-[4%]"
                                    sizes="(max-width: 1024px) 100vw, 50vw"

                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </motion.div>
                </ScrollReveal>
            </div>
        </section >
    )
}
