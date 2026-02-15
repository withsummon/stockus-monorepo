'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

// Decorative SVG background patterns per tab
function DecorativeBackground({ variant }: { variant: number }) {
    const patterns = [
        // Tab 1: Ascending bars / growth
        <svg key={0} className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <rect x="680" y="320" width="40" height="120" rx="6" fill="#F96E00" opacity="0.06" />
            <rect x="620" y="360" width="40" height="80" rx="6" fill="#F96E00" opacity="0.05" />
            <rect x="740" y="280" width="40" height="160" rx="6" fill="#F96E00" opacity="0.04" />
            <circle cx="100" cy="80" r="60" fill="#F96E00" opacity="0.03" />
            <circle cx="700" cy="100" r="120" fill="#F96E00" opacity="0.03" />
            <path d="M0 450 Q200 380 400 420 T800 350" stroke="#F96E00" strokeWidth="1.5" opacity="0.06" fill="none" />
            <path d="M0 480 Q200 410 400 450 T800 380" stroke="#F96E00" strokeWidth="1" opacity="0.04" fill="none" />
        </svg>,
        // Tab 2: Academic / grid dots
        <svg key={1} className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 12 }).map((_, col) => (
                    <circle key={`${row}-${col}`} cx={70 + col * 65} cy={50 + row * 60} r="2" fill="#F96E00" opacity="0.07" />
                ))
            )}
            <rect x="600" y="30" width="160" height="200" rx="12" fill="none" stroke="#F96E00" strokeWidth="1" opacity="0.06" />
            <rect x="620" y="50" width="120" height="8" rx="4" fill="#F96E00" opacity="0.04" />
            <rect x="620" y="70" width="100" height="8" rx="4" fill="#F96E00" opacity="0.03" />
            <rect x="620" y="90" width="80" height="8" rx="4" fill="#F96E00" opacity="0.03" />
        </svg>,
        // Tab 3: Data analytics / dashboard
        <svg key={2} className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            {/* Large gradient circle bottom-left */}
            <circle cx="80" cy="520" r="180" fill="#F96E00" opacity="0.04" />
            <circle cx="80" cy="520" r="130" fill="#F96E00" opacity="0.03" />
            {/* Top-right gradient circle */}
            <circle cx="720" cy="60" r="140" fill="#3366FF" opacity="0.03" />
            <circle cx="720" cy="60" r="90" fill="#3366FF" opacity="0.02" />
            {/* Analytics chart lines */}
            <path d="M50 420 Q150 380 250 390 T450 340 T650 280 T780 240" stroke="#3366FF" strokeWidth="2" opacity="0.08" fill="none" strokeLinecap="round" />
            <path d="M50 450 Q150 420 250 430 T450 390 T650 340 T780 310" stroke="#F96E00" strokeWidth="1.5" opacity="0.06" fill="none" strokeLinecap="round" />
            <path d="M50 480 Q200 460 350 470 T650 420 T780 380" stroke="#3366FF" strokeWidth="1" opacity="0.04" fill="none" strokeLinecap="round" />
            {/* Bar chart right side */}
            <rect x="620" y="350" width="28" height="90" rx="4" fill="#3366FF" opacity="0.06" />
            <rect x="660" y="310" width="28" height="130" rx="4" fill="#F96E00" opacity="0.06" />
            <rect x="700" y="280" width="28" height="160" rx="4" fill="#3366FF" opacity="0.07" />
            <rect x="740" y="250" width="28" height="190" rx="4" fill="#F96E00" opacity="0.05" />
            {/* Data points on chart */}
            <circle cx="250" cy="390" r="4" fill="#3366FF" opacity="0.12" />
            <circle cx="450" cy="340" r="4" fill="#3366FF" opacity="0.12" />
            <circle cx="650" cy="280" r="4" fill="#3366FF" opacity="0.12" />
            {/* Floating dashboard elements */}
            <rect x="50" y="60" width="140" height="80" rx="10" fill="#3366FF" fillOpacity="0.03" stroke="#3366FF" strokeWidth="0.8" strokeOpacity="0.05" />
            <rect x="65" y="80" width="60" height="6" rx="3" fill="#3366FF" opacity="0.06" />
            <rect x="65" y="95" width="90" height="6" rx="3" fill="#3366FF" opacity="0.04" />
            <rect x="65" y="110" width="45" height="6" rx="3" fill="#F96E00" opacity="0.06" />
        </svg>,
        // Tab 4: Podium / presentation
        <svg key={3} className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <rect x="620" y="300" width="60" height="140" rx="8" fill="#F96E00" opacity="0.05" />
            <rect x="700" y="260" width="60" height="180" rx="8" fill="#F96E00" opacity="0.06" />
            <rect x="540" y="340" width="60" height="100" rx="8" fill="#F96E00" opacity="0.04" />
            <path d="M60 60 L100 60 L100 100" stroke="#F96E00" strokeWidth="2" opacity="0.06" fill="none" />
            <path d="M60 60 L60 100" stroke="#F96E00" strokeWidth="2" opacity="0.06" fill="none" />
            <circle cx="200" cy="400" r="100" fill="#F96E00" opacity="0.02" />
        </svg>,
    ]
    return patterns[variant] || null
}

// Logo item with icon + name
function LogoItem({ src, name, iconOnly }: { src: string; name: string; iconOnly?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 p-1.5">
                <Image src={src} alt={name} width={24} height={24} className="w-full h-full object-contain" />
            </div>
            {!iconOnly && (
                <span className="text-sm md:text-base font-montserrat font-semibold text-main-black/80">{name}</span>
            )}
        </div>
    )
}

// Logo grid for Pre-IPO and Keynote tabs
function CompanyLogos({ companies }: { companies: { src: string; name: string }[] }) {
    return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:gap-x-8 md:gap-y-6">
            {companies.map((c, idx) => (
                <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + idx * 0.05, duration: 0.35 }}
                >
                    <LogoItem src={c.src} name={c.name} />
                </motion.div>
            ))}
        </div>
    )
}

export function WhyIndonesian() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState(0)

    const preIpoCompanies = [
        { src: '/logos/anthropic.svg', name: 'Anthropic' },
        { src: '/logos/anduril.svg', name: 'Anduril' },
        { src: '/logos/databricks.svg', name: 'Databricks' },
        { src: '/logos/spacex.svg', name: 'SpaceX' },
        { src: '/logos/openai.svg', name: 'OpenAI' },
        { src: '/logos/stripe.svg', name: 'Stripe' },
        { src: '/logos/perplexity.svg', name: 'Perplexity' },
        { src: '/logos/revolut.svg', name: 'Revolut' },
    ]

    const keynoteCompanies = [
        { src: '/logos/jp-morgan.svg', name: 'J.P. Morgan' },
        { src: '/logos/goldman-sachs.svg', name: 'Goldman Sachs' },
        { src: '/logos/cvc-capital.svg', name: 'CVC Capital' },
        { src: '/logos/lazard.svg', name: 'Lazard' },
        { src: '/logos/franklin-templeton.svg', name: 'Franklin Templeton' },
        { src: '/logos/bank-of-america.svg', name: 'Bank of America' },
        { src: '/logos/hm-capital.svg', name: 'HM Capital' },
        { src: '/logos/morgan-stanley.svg', name: 'Morgan Stanley' },
    ]

    const tabs = [
        {
            title: t('whyIndonesian.tab1.title'),
            content: (
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                    <div className="w-full lg:w-1/2 space-y-5">
                        <div className="inline-block px-3 py-1 bg-brand/10 rounded-full">
                            <span className="text-xs font-montserrat font-semibold text-brand uppercase tracking-wider">{t('wyg.preipo.forMembers')}</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-extrabold font-montserrat text-main-black leading-[1.1]">
                            {t('wyg.preipo.title')} <span className="text-brand">{t('wyg.preipo.subtitle')}</span>
                        </h3>
                        <div className="space-y-4 text-slate-500 font-montserrat text-[15px] leading-relaxed">
                            <p>{t('wyg.preipo.desc1')}</p>
                            <p>{t('wyg.preipo.desc2')}</p>
                            <p>
                                {t('wyg.preipo.desc3').split('exclusively to eligible members').map((part, i) =>
                                    i === 0 ? (
                                        <React.Fragment key={i}>{part}<strong className="text-main-black font-semibold">exclusively to eligible members</strong></React.Fragment>
                                    ) : (
                                        <React.Fragment key={i}>{part}</React.Fragment>
                                    )
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-6 md:p-8 w-full">
                            <p className="text-xs font-montserrat font-semibold text-slate-400 uppercase tracking-wider mb-5">Past & Present Deal Flow</p>
                            <CompanyLogos companies={preIpoCompanies} />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: t('whyIndonesian.tab2.title'),
            content: (
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                    <div className="w-full lg:w-1/2 space-y-5">
                        <h3 className="text-3xl md:text-4xl font-extrabold font-montserrat text-main-black leading-[1.1]">
                            {t('wyg.university.title')}
                        </h3>
                        <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-6 flex items-center justify-center">
                            <Image
                                src="/logos/monash-university.svg"
                                alt="Monash University"
                                width={220}
                                height={90}
                                className="max-h-24 md:max-h-28 w-auto object-contain"
                            />
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex items-center">
                        <div className="space-y-5">
                            {[
                                t('wyg.university.desc1'),
                                t('wyg.university.desc2'),
                                t('wyg.university.desc3'),
                                t('wyg.university.desc4'),
                                t('wyg.university.desc5'),
                            ].map((desc, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 + idx * 0.06, duration: 0.35 }}
                                    className="flex gap-3 items-start"
                                >
                                    <div className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-brand rounded-full" />
                                    <p className="text-slate-500 font-montserrat text-[15px] leading-relaxed">{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: t('whyIndonesian.tab3.title'),
            content: (
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                    <div className="w-full lg:w-1/2 space-y-5">
                        <h3 className="text-3xl md:text-4xl font-extrabold font-montserrat text-main-black leading-[1.1]">
                            {t('wyg.info.title')}
                        </h3>
                        <p className="text-slate-500 font-montserrat text-[15px] leading-relaxed">
                            {t('wyg.info.desc')}
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <div className="flex flex-col gap-6 w-full">
                            {[
                                { src: '/logos/alphasense.svg', name: 'AlphaSense', desc: 'AI-powered market intelligence' },
                                { src: '/logos/factset.svg', name: 'FactSet', desc: 'Financial data & analytics' },
                            ].map((tool, idx) => (
                                <motion.div
                                    key={tool.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.1, duration: 0.4 }}
                                    className="bg-slate-50/80 rounded-2xl border border-slate-100 p-6 flex items-center gap-5"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 p-2">
                                        <Image src={tool.src} alt={tool.name} width={40} height={40} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-montserrat font-bold text-main-black text-lg">{tool.name}</p>
                                        <p className="font-montserrat text-slate-400 text-sm">{tool.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: t('whyIndonesian.tab4.title'),
            content: (
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
                    <div className="w-full lg:w-1/2 space-y-5">
                        <h3 className="text-3xl md:text-4xl font-extrabold font-montserrat text-main-black leading-[1.1]">
                            {t('wyg.keynote.title')}
                        </h3>
                        <ul className="space-y-3">
                            {[
                                t('wyg.keynote.desc1'),
                                t('wyg.keynote.desc2'),
                                t('wyg.keynote.desc3'),
                                t('wyg.keynote.desc4'),
                                t('wyg.keynote.desc5'),
                            ].map((desc, idx) => (
                                <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 + idx * 0.06, duration: 0.35 }}
                                    className="flex gap-3 items-start"
                                >
                                    <div className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-brand rounded-full" />
                                    <p className="text-slate-500 font-montserrat text-[15px] leading-relaxed">{desc}</p>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-6 md:p-8 w-full">
                            <p className="text-xs font-montserrat font-semibold text-slate-400 uppercase tracking-wider mb-5">Speaker Backgrounds</p>
                            <CompanyLogos companies={keynoteCompanies} />
                        </div>
                    </div>
                </div>
            ),
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
                    <div className="bg-white rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden relative">
                        {/* Decorative background */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`bg-${activeTab}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full h-full"
                                >
                                    <DecorativeBackground variant={activeTab} />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-200 px-4 md:px-8 relative z-10">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
                                {tabs.map((tab, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTab(index)}
                                        className={cn(
                                            "px-4 py-5 md:py-6 text-sm md:text-base font-montserrat font-semibold text-center transition-all duration-300 relative",
                                            activeTab === index
                                                ? "text-brand"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {tab.title}
                                        {activeTab === index && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-2 right-2 h-[3px] bg-brand rounded-full"
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="relative z-10 min-h-[700px] md:min-h-[520px]">
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="absolute inset-0 p-8 md:p-12 lg:p-16"
                                >
                                    {active.content}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    )
}
