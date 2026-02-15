'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function PremiumCommunity() {
    const { t } = useTranslation()

    const features = [
        {
            title: t('premiumCommunity.f1.title'),
            items: [
                t('premiumCommunity.f1.item1'),
                t('premiumCommunity.f1.item2'),
            ],
        },
        {
            title: t('premiumCommunity.f2.title'),
            items: [
                t('premiumCommunity.f2.item1'),
                t('premiumCommunity.f2.item2'),
            ],
        },
        {
            title: t('premiumCommunity.f3.title'),
            items: [
                t('premiumCommunity.f3.item1'),
                t('premiumCommunity.f3.item2'),
            ],
        },
        {
            title: t('premiumCommunity.f4.title'),
            items: [
                t('premiumCommunity.f4.item1'),
                t('premiumCommunity.f4.item2'),
                t('premiumCommunity.f4.item3'),
            ],
        },
        {
            title: t('premiumCommunity.f5.title'),
            items: [
                t('premiumCommunity.f5.item1'),
                t('premiumCommunity.f5.item2'),
            ],
        },
        {
            title: t('premiumCommunity.f6.title'),
            items: [
                t('premiumCommunity.f6.item1'),
                t('premiumCommunity.f6.item2'),
                t('premiumCommunity.f6.item3'),
            ],
        },
    ]

    return (
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-main-white">
            <ScrollReveal variant="scale">
                <motion.div
                    className="container mx-auto rounded-[40px] overflow-hidden shadow-2xl p-8 md:p-16 flex flex-col items-center space-y-12"
                    style={{
                        background: 'linear-gradient(0deg, #222831 0%, #F96E00 98.15%)'
                    }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Header */}
                    <div className="text-center space-y-6">
                        <ScrollReveal variant="fadeUp" delay={0.1}>
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-[#F96E00] font-montserrat font-bold text-sm tracking-widest uppercase shadow-sm">
                                {t('premiumCommunity.badge')} <Image src="/crown.svg" alt="Crown" width={20} height={18} />
                            </div>
                        </ScrollReveal>
                        <ScrollReveal variant="fadeUp" delay={0.2}>
                            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-white tracking-tight">
                                {t('premiumCommunity.title')}
                            </h2>
                        </ScrollReveal>
                        <ScrollReveal variant="fadeUp" delay={0.3}>
                            <p className="text-lg md:text-xl text-white/80 font-montserrat font-light max-w-2xl mx-auto">
                                {t('premiumCommunity.subtitle')}
                            </p>
                        </ScrollReveal>
                    </div>

                    {/* Grid */}
                    <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {features.map((feature, index) => (
                            <StaggerItem key={index} variant="fadeUp">
                                <motion.div
                                    className="bg-white rounded-[20px] p-8 space-y-4 shadow-lg flex flex-col h-full"
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <h3 className="text-xl md:text-2xl font-bold font-montserrat text-main-black text-center">
                                        {feature.title}
                                    </h3>
                                    <ul className="space-y-3 flex-grow">
                                        {feature.items.map((item, idx) => (
                                            <li key={idx} className="flex gap-3  font-montserrat text-base md:text-lg font-light leading-relaxed">
                                                <span className="flex-shrink-0 mt-2.5 w-1 h-1 bg-slate-400 rounded-full" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>

                    {/* CTA Button */}
                    <ScrollReveal variant="fadeUp" delay={0.5}>
                        <div className="w-full pt-8">
                            <Button
                                className="bg-brand hover:bg-[#e06300] text-white rounded-[40px] py-8 text-2xl md:text-3xl font-bold font-montserrat shadow-xl transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] w-full"
                            >
                                {t('premiumCommunity.becomeAMember')}
                            </Button>
                        </div>
                    </ScrollReveal>
                </motion.div>
            </ScrollReveal>
        </section>
    )
}
