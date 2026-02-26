'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'

/* Custom inline SVG icons for each feature */
function IconChart({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    )
}

function IconBook({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

function IconPeople({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function IconBolt({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}

function IconShield({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    )
}

function IconTarget({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}

const featureIcons = [IconChart, IconBook, IconPeople, IconBolt, IconShield, IconTarget]

/* Corner "+" marker for the bento grid */
function CrossMarker({ className }: { className?: string }) {
    return (
        <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        </svg>
    )
}

export function PremiumCommunity() {
    const { t } = useTranslation()

    const features = [
        {
            title: t('premiumCommunity.f1.title'),
            items: [t('premiumCommunity.f1.item1'), t('premiumCommunity.f1.item2')],
        },
        {
            title: t('premiumCommunity.f2.title'),
            items: [t('premiumCommunity.f2.item1'), t('premiumCommunity.f2.item2')],
        },
        {
            title: t('premiumCommunity.f3.title'),
            items: [t('premiumCommunity.f3.item1'), t('premiumCommunity.f3.item2')],
        },
        {
            title: t('premiumCommunity.f4.title'),
            items: [t('premiumCommunity.f4.item1'), t('premiumCommunity.f4.item2'), t('premiumCommunity.f4.item3')],
        },
        {
            title: t('premiumCommunity.f5.title'),
            items: [t('premiumCommunity.f5.item1'), t('premiumCommunity.f5.item2')],
        },
        {
            title: t('premiumCommunity.f6.title'),
            items: [t('premiumCommunity.f6.item1'), t('premiumCommunity.f6.item2'), t('premiumCommunity.f6.item3')],
        },
    ]

    /* Grid layout: asymmetric bento (12-col for better ratios) */
    const gridCells = [
        { span: 'md:col-span-7', featureIdx: 0, markers: ['top-left', 'top-right'] },
        { span: 'md:col-span-5', featureIdx: 1, markers: ['top-right'] },
        { span: 'md:col-span-5', featureIdx: 2, markers: ['bottom-left'] },
        { span: 'md:col-span-7', featureIdx: 3, markers: ['bottom-left', 'bottom-right'] },
        { span: 'md:col-span-4', featureIdx: 4, markers: ['bottom-left'] },
        { span: 'md:col-span-4', featureIdx: 5, markers: [] },
    ]

    const markerPositions: Record<string, string> = {
        'top-left': 'top-3 left-3',
        'top-right': 'top-3 right-3',
        'bottom-left': 'bottom-3 left-3',
        'bottom-right': 'bottom-3 right-3',
    }

    return (
        <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-main-black">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <ScrollReveal variant="fadeUp">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/40 bg-brand/10 text-brand text-xs font-bold tracking-[0.15em] uppercase font-montserrat mb-6">
                        {t('premiumCommunity.badge')} <Image src="/crown.svg" alt="Crown" width={16} height={14} />
                    </span>
                </ScrollReveal>
                <ScrollReveal variant="fadeUp" delay={0.1}>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat text-white tracking-tight mb-3">
                        {t('premiumCommunity.title')}
                    </h2>
                </ScrollReveal>
                <ScrollReveal variant="fadeUp" delay={0.15}>
                    <p className="text-base md:text-lg text-white/50 font-montserrat font-light max-w-xl mb-14">
                        {t('premiumCommunity.subtitle')}
                    </p>
                </ScrollReveal>

                {/* Bento Grid */}
                <ScrollReveal variant="fadeUp" delay={0.2}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-[1px] bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
                        {gridCells.map((cell, i) => {
                            const feature = features[cell.featureIdx]
                            const Icon = featureIcons[cell.featureIdx]
                            return (
                                <motion.div
                                    key={i}
                                    className={`${cell.span} bg-[#111318] p-8 md:p-10 relative group overflow-hidden`}
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
                                    {cell.markers.map((m) => (
                                        <CrossMarker key={m} className={`absolute ${markerPositions[m]} text-white/10`} />
                                    ))}
                                    {/* Decorative ornament for Exclusive Events cell */}
                                    {cell.featureIdx === 3 && (
                                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 opacity-[0.15]">
                                            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                                                <circle cx="90" cy="90" r="86" stroke="#F96E00" strokeWidth="1" />
                                                <circle cx="90" cy="90" r="65" stroke="#F96E00" strokeWidth="1" />
                                                <circle cx="90" cy="90" r="44" stroke="#F96E00" strokeWidth="1" />
                                                <circle cx="90" cy="90" r="23" stroke="#F96E00" strokeWidth="1.5" />
                                                <line x1="90" y1="0" x2="90" y2="180" stroke="#F96E00" strokeWidth="0.5" />
                                                <line x1="0" y1="90" x2="180" y2="90" stroke="#F96E00" strokeWidth="0.5" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="relative">
                                        <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-6">
                                            <Icon className="w-5 h-5 text-brand" />
                                        </div>
                                        <h3 className="text-xl font-bold font-montserrat text-white mb-3">{feature.title}</h3>
                                        <ul className="space-y-1.5">
                                            {feature.items.map((item, idx) => (
                                                <li key={idx} className="text-sm text-white/45 font-montserrat font-light leading-relaxed">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )
                        })}

                        {/* Statement cell */}
                        <div className="md:col-span-4 bg-[#111318] p-8 md:p-10 flex flex-col justify-end relative overflow-hidden">
                            {/* Subtle dot pattern */}
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                                    backgroundSize: '24px 24px',
                                }}
                            />
                            <CrossMarker className="absolute bottom-3 right-3 text-white/10" />
                            <p className="relative text-2xl md:text-3xl font-bold font-montserrat text-white leading-tight">
                                Built for <span className="text-brand">conviction.</span><br />
                                Not followers.
                            </p>
                        </div>
                    </div>
                </ScrollReveal>

                {/* CTA */}
                <ScrollReveal variant="fadeUp" delay={0.3}>
                    <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
                        <Button
                            variant="brand"
                            className="rounded-full py-6 px-10 text-base font-bold font-montserrat"
                        >
                            {t('premiumCommunity.becomeAMember')}
                        </Button>
                        <span className="text-sm text-white/30 font-montserrat font-light">Join 500+ members</span>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
