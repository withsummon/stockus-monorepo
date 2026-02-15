'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function WhyIndonesian() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState(0)

    const tabs = [
        {
            title: t('whyIndonesian.tab1.title'),
            bullets: [
                t('whyIndonesian.tab1.bullet1'),
                t('whyIndonesian.tab1.bullet2'),
                t('whyIndonesian.tab1.bullet3'),
                t('whyIndonesian.tab1.bullet4'),
                t('whyIndonesian.tab1.bullet5'),
            ],
            logos: ['/trusted1.webp', '/trusted2.webp'],
        },
        {
            title: t('whyIndonesian.tab2.title'),
            bullets: [
                t('whyIndonesian.tab2.bullet1'),
                t('whyIndonesian.tab2.bullet2'),
                t('whyIndonesian.tab2.bullet3'),
                t('whyIndonesian.tab2.bullet4'),
                t('whyIndonesian.tab2.bullet5'),
            ],
            logos: ['/trusted3.webp', '/trusted4.webp'],
        },
        {
            title: t('whyIndonesian.tab3.title'),
            bullets: [
                t('whyIndonesian.tab3.bullet1'),
                t('whyIndonesian.tab3.bullet2'),
                t('whyIndonesian.tab3.bullet3'),
                t('whyIndonesian.tab3.bullet4'),
                t('whyIndonesian.tab3.bullet5'),
            ],
            logos: ['/trusted5.webp', '/trusted1.webp'],
        },
        {
            title: t('whyIndonesian.tab4.title'),
            bullets: [
                t('whyIndonesian.tab4.bullet1'),
                t('whyIndonesian.tab4.bullet2'),
                t('whyIndonesian.tab4.bullet3'),
                t('whyIndonesian.tab4.bullet4'),
                t('whyIndonesian.tab4.bullet5'),
            ],
            logos: ['/trusted2.webp', '/trusted3.webp'],
        },
    ]

    const active = tabs[activeTab]

    return (
        <section className="bg-custom-secondary py-16">
            <div className="max-w-4xl mx-auto text-center space-y-4 pb-16 px-4">
                <ScrollReveal variant="fadeUp">
                    <h2 className="font-montserrat text-4xl md:text-5xl font-semibold leading-tight text-main-black">
                        {t('whyIndonesian.title')} <br />
                        <span className="text-brand block sm:inline">{t('whyIndonesian.titleHighlight')}</span>
                    </h2>
                </ScrollReveal>

                <ScrollReveal variant="fadeUp" delay={0.1}>
                    <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
                        {t('whyIndonesian.subtitle')} <span className="text-main-black font-semibold">{t('whyIndonesian.subtitleBold')}</span> {t('whyIndonesian.subtitleEnd')}
                    </p>
                </ScrollReveal>
            </div>

            <ScrollReveal variant="fadeUp" delay={0.2}>
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        {/* Tabs */}
                        <div className="border-b border-slate-200">
                            <div className="flex overflow-x-auto scrollbar-hide">
                                {tabs.map((tab, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTab(index)}
                                        className={cn(
                                            "flex-1 min-w-[200px] px-6 py-5 md:py-6 text-sm md:text-base font-montserrat font-semibold text-center transition-all duration-300 relative whitespace-nowrap",
                                            activeTab === index
                                                ? "text-brand"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {tab.title}
                                        {activeTab === index && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-full"
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="p-8 md:p-12 lg:p-16"
                            >
                                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                                    {/* Left: Bullet Points */}
                                    <div className="w-full lg:w-1/2 space-y-5">
                                        {active.bullets.map((bullet, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05, duration: 0.3 }}
                                                className="flex gap-3 items-start"
                                            >
                                                <span className="flex-shrink-0 mt-2 w-2 h-2 bg-brand rounded-full" />
                                                <p className="text-base md:text-lg text-slate-600 font-montserrat font-light leading-relaxed">
                                                    {bullet}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Right: Logos */}
                                    <div className="w-full lg:w-1/2 flex flex-wrap items-center justify-center gap-8">
                                        {active.logos.map((logo, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 + idx * 0.1, duration: 0.4 }}
                                                className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-4"
                                            >
                                                <Image
                                                    src={logo}
                                                    alt="Partner logo"
                                                    fill
                                                    className="object-contain p-4"
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    )
}
