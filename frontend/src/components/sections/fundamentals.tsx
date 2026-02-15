'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

function DayCard({ day, title, desc, isActive, onClick }: {
    day: string,
    title: string,
    desc: string,
    isActive: boolean,
    onClick: () => void
}) {
    const { t } = useTranslation()
    const [isHovered, setIsHovered] = useState(false)

    return (
        <motion.div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={false}
            animate={{
                scale: isHovered ? 1.05 : (isActive ? 1.02 : 0.95),
                opacity: isActive ? 1 : 1,
                backgroundColor: "#ffffff",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "flex-shrink-0 w-[300px] md:w-[400px] min-h-[450px] rounded-[20px] p-8 cursor-pointer flex flex-col ",
                isActive ? "" : "backdrop-blur-sm"
            )}
        >
            <div className="bg-brand text-white font-montserrat font-bold py-2 px-6 rounded-lg self-start text-xl mb-6">
                {day}
            </div>

            {/* Image Placeholder */}
            <div className="w-full h-40 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 opacity-50 flex items-center justify-center">
                    {/* <span className="text-slate-400 font-montserrat text-xs uppercase tracking-widest">Illustration Placeholder</span> */}
                </div>
            </div>

            <div className="mb-6">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(isActive ? "text-main-black" : "text-main-black")}>
                    <path d="M20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 20H35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 5C23.75 9 26 14.5 26 20C26 25.5 23.75 31 20 35C16.25 31 14 25.5 14 20C14 14.5 16.25 9 20 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 15H22M18 25H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <h3 className={cn(
                "text-lg md:text-xl font-bold mb-4 leading-tight font-montserrat",
                isActive ? "text-main-black" : "text-main-black"
            )}>
                {title}
            </h3>

            <p className={cn(
                "text-md mb-8 font-light flex-grow font-montserrat",
                isActive ? "text-slate-600" : "text-main-black/80"
            )}>
                {desc}
            </p>

            <Link
                href="/pricing"
                className={cn(
                    "font-semibold text-lg hover:underline text-left",
                    isActive ? "text-brand" : "text-main-black"
                )}
            >
                {t('fundamentals.learnMore')}
            </Link>
        </motion.div>
    )
}

export function Fundamentals() {
    const { t } = useTranslation()
    const [activeIndex, setActiveIndex] = useState(1) // Default to Day 2 as in image

    const dayContent = [
        { day: "Day 1", title: t('fundamentals.day1.title'), desc: t('fundamentals.day1.desc') },
        { day: "Day 2", title: t('fundamentals.day2.title'), desc: t('fundamentals.day2.desc') },
        { day: "Day 3", title: t('fundamentals.day3.title'), desc: t('fundamentals.day3.desc') },
        { day: "Day 4", title: t('fundamentals.day4.title'), desc: t('fundamentals.day4.desc') },
        { day: "Day 5", title: t('fundamentals.day5.title'), desc: t('fundamentals.day5.desc') },
    ]

    return (
        <section className="bg-brand">
            <div className="py-12 md:py-20 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                        {/* Heading Side */}
                        <ScrollReveal variant="fadeRight" className="w-full">
                            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-white leading-tight">
                                {t('fundamentals.title')} <br></br>of <span className="font-thin font-montserrat">{t('fundamentals.titleThin')}</span>
                            </h2>
                        </ScrollReveal>

                        {/* Description Side */}
                        <ScrollReveal variant="fadeLeft" delay={0.2} className="w-full">
                            <p className="text-white text-lg md:text-xl font-light leading-relaxed  font-montserrat max-w-lg leading-[1px]">
                                {t('fundamentals.subtitle')}
                            </p>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            {/* Day Cards Scrollable List */}
            <div className="w-full pb-10 overflow-hidden ">
                <div className="flex overflow-x-auto gap-8 px-4 sm:px-8 md:px-16 pb-12 no-scrollbar snap-x items-center min-h-[550px]">
                    <div className="flex-shrink-0 w-[5vw] hidden md:block"></div> {/* Spacer for centering leading card */}
                    {dayContent.map((content, index) => (
                        <div key={index} className="snap-center py-8 ">
                            <DayCard
                                day={content.day}
                                title={content.title}
                                desc={content.desc}
                                isActive={index === activeIndex}
                                onClick={() => setActiveIndex(index)}
                            />
                        </div>
                    ))}
                    <div className="flex-shrink-0 w-[5vw] hidden md:block"></div> {/* Spacer for ending */}
                </div>
            </div>
        </section>
    )
}
