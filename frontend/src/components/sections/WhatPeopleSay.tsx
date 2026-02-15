'use client'

import React from 'react'
import Image from 'next/image'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const testimonials = [
    {
        name: 'Sarah Gibson',
        role: 'Moderate Investor',
        quote: 'The Mentors And Members Are Very Supportive. Every Question I Asked Was Answered Patiently And Clearly.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    },
    {
        name: 'Sarah Gibson',
        role: 'Moderate Investor',
        quote: 'The Mentors And Members Are Very Supportive. Every Question I Asked Was Answered Patiently And Clearly.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    },
    {
        name: 'Sarah Gibson',
        role: 'Moderate Investor',
        quote: 'The Mentors And Members Are Very Supportive. Every Question I Asked Was Answered Patiently And Clearly.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    },
]

export function WhatPeopleSay() {
    const { t } = useTranslation()
    return (
        <section className="bg-brand py-12 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto container">
                {/* Header */}
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <ScrollReveal variant="fadeUp">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat text-white leading-tight">
                            {t('whatPeopleSay.title')} {t('whatPeopleSay.titleEnd')}
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.1}>
                        <p className="text-white/80 font-montserrat text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                            {t('whatPeopleSay.subtitle')}
                        </p>
                    </ScrollReveal>
                </div>

                {/* Testimonials Grid */}
                <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <StaggerItem key={index} variant="fadeUp">
                            <div
                                className="bg-white rounded-[20px] p-4 md:px-8 md:py-6 flex flex-col items-start text-left space-y-6 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                            >
                                {/* Avatar */}
                                <div className="relative w-12 h-12 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className='space-y-16'>
                                    {/* Info */}
                                    <div className="space-y-1">
                                        <h3 className="text-2xl md:text-3xl font-bold font-montserrat text-brand">
                                            {testimonial.name}
                                        </h3>
                                        <p className="text-slate-600 font-montserrat text-lg font-normal">
                                            {testimonial.role}
                                        </p>
                                    </div>

                                    {/* Quote */}
                                    <p className="text-main-black font-montserrat text-lg md:text-lgl font-medium leading-relaxed">
                                        {testimonial.quote}
                                    </p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    )
}
