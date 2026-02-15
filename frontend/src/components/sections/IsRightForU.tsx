'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function IsRightForU() {
    const { t } = useTranslation()
    const [activeIndex, setActiveIndex] = useState(0)

    const steps = [
        { id: '01', text: t('isRightForU.step1') },
        { id: '02', text: t('isRightForU.step2') },
        { id: '03', text: t('isRightForU.step3') },
        { id: '04', text: t('isRightForU.step4') },
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % steps.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="bg-custom-secondary py-12 px-4 sm:px-6">
            <ScrollReveal variant="scale">
                <div className="max-w-6xl mx-auto bg-white rounded-[20px] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
                    {/* Left Content */}
                    <div className="w-full md:w-1/2 space-y-6">
                        <ScrollReveal variant="fadeUp" delay={0.1}>
                            <Image
                                src="/stockus_black.png"
                                alt="StockUs"
                                width={120}
                                height={40}
                                className="h-10 w-auto"
                            />
                        </ScrollReveal>

                        <ScrollReveal variant="fadeUp" delay={0.2}>
                            <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-main-black leading-tight">
                                {t('isRightForU.title.is')} <span className="text-brand">{t('isRightForU.title.stockus')}</span> {t('isRightForU.title.rightFor')} <span className="text-brand">{t('isRightForU.title.you')}</span>
                            </h2>
                        </ScrollReveal>

                        <ScrollReveal variant="fadeUp" delay={0.3}>
                            <div className="space-y-4 text-slate-700 font-light leading-relaxed">
                                <p>
                                    {t('isRightForU.desc1')}
                                </p>
                                <p>
                                    {t('isRightForU.desc2')}
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right Content - Steps */}
                    <div className="w-full md:w-1/2 space-y-4">
                    {steps.map((step, index) => {
                        const isActive = index === activeIndex
                        return (
                            <motion.div
                                key={step.id}
                                onClick={() => setActiveIndex(index)}
                                initial={false}
                                animate={{
                                    backgroundColor: isActive ? "var(--brand)" : "rgba(0,0,0,0)",
                                    scale: isActive ? 1.02 : 1,
                                }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className={cn(
                                    "relative cursor-pointer rounded-2xl md:rounded-3xl p-6 overflow-hidden",
                                    isActive ? "shadow-xl" : ""
                                )}
                            >
                                <div className="flex gap-6 items-start relative z-10">
                                    <motion.span
                                        animate={{ color: isActive ? "#ffffff" : "#94a3b8" }}
                                        transition={{ duration: 0.5 }}
                                        className="text-xl font-bold font-montserrat"
                                    >
                                        {step.id}
                                    </motion.span>
                                    <motion.p
                                        animate={{ color: isActive ? "#ffffff" : "#64748b" }}
                                        transition={{ duration: 0.5 }}
                                        className="text-lg font-medium leading-tight"
                                    >
                                        {step.text}
                                    </motion.p>
                                </div>
                            </motion.div>
                        )
                    })}
                    </div>
                </div>
            </ScrollReveal>
        </section>
    )
}
