'use client'

import React from 'react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
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
        <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-main-black">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
                    <div>
                        <ScrollReveal variant="fadeUp">
                            <span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-bold tracking-[0.15em] uppercase font-montserrat mb-6">
                                {t('guidelines.ourPrinciples')}
                            </span>
                        </ScrollReveal>
                        <ScrollReveal variant="fadeUp" delay={0.1}>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat text-white tracking-tight">
                                {t('guidelines.title')}
                            </h2>
                        </ScrollReveal>
                    </div>
                    <ScrollReveal variant="fadeUp" delay={0.15}>
                        <p className="text-base text-white/40 font-montserrat font-light max-w-md lg:text-right leading-relaxed">
                            Simple rules that keep our community focused, respectful, and valuable for everyone.
                        </p>
                    </ScrollReveal>
                </div>

                {/* Principles Grid */}
                <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
                    {principles.map((principle) => (
                        <StaggerItem key={principle.number} variant="fadeUp">
                            <motion.div
                                className="bg-[#111318] p-8 md:p-10 relative group overflow-hidden min-h-[180px] flex flex-col justify-between"
                                whileHover={{ backgroundColor: '#161a21' }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Subtle dot pattern */}
                                <div
                                    className="absolute inset-0 opacity-[0.03]"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                                        backgroundSize: '24px 24px',
                                    }}
                                />
                                {/* Large decorative number */}
                                <span className="absolute top-5 right-6 text-[7rem] md:text-[8rem] font-black font-montserrat leading-none text-white/[0.03] select-none">
                                    {principle.number}
                                </span>
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center mb-6">
                                        <span className="text-sm font-bold font-montserrat text-brand">{principle.number}</span>
                                    </div>
                                    <p className="text-base md:text-lg text-white/80 font-montserrat font-medium leading-relaxed max-w-sm">
                                        {principle.text}
                                    </p>
                                </div>
                                {/* Bottom accent line on hover */}
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand/0 group-hover:bg-brand/30 transition-all duration-500" />
                            </motion.div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    )
}
