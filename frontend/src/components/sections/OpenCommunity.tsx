'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FaDiscord } from 'react-icons/fa'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'

export function OpenCommunity() {
    const inclusions = [
        'General investing discussion',
        'Market update notifications',
        'Basic Q&A with community',
    ]

    const steps = [
        { number: 1, text: 'Click "Join Free Community"' },
        { number: 2, text: 'Accept Discord Invite' },
        { number: 3, text: 'Read Community Guidelines' },
    ]

    return (
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-main-white">
            <div className="container mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <ScrollReveal variant="fadeUp">
                        <div className="inline-block px-6 py-2 rounded-full border border-[#F96E00] text-[#F96E00] font-montserrat font-bold text-sm tracking-widest uppercase">
                            Free to Join
                        </div>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.1}>
                        <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-main-black tracking-tight text-wrap-balance">
                            Open Community
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.2}>
                        <p className="text-lg md:text-xl text-slate-600 font-montserrat font-light max-w-2xl mx-auto">
                            Anyone can join our open Discord Community
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
                                    <h3 className="text-xl font-bold font-montserrat">What&apos;s Included:</h3>
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
                                    <h3 className="text-2xl font-bold font-montserrat text-main-black">How to Join?</h3>
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
                                <div className='max-w-sm'>
                                    <Button
                                        className="bg-[#F96E00]  hover:bg-[#e06300] text-white rounded-[40px] py-8 px-10 text-xl font-bold font-montserrat shadow-lg transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] flex items-center gap-3 w-full "
                                    >
                                        <FaDiscord className="w-6 h-6" />
                                        Join Our Channel
                                    </Button>
                                </div>
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
