'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const dayContent = [
    {
        day: "Day 1",
        title: "Why do we invest in global equity markets?",
        desc: "Understand the historical returns of different asset classes and why stocks are the best engine for long-term wealth creation.",
    },
    {
        day: "Day 2",
        title: "What do we actually own when we buy a stock?",
        desc: "On Day 2, we move from \"stock\" to business. You learn how to read and understand the engine that drives long-term returns.",
    },
    {
        day: "Day 3",
        title: "Where does this business compete and why can it win?",
        desc: "Learn how to identify businesses with durable competitive advantages (moats) that can survive and thrive in any market.",
    },
    {
        day: "Day 4",
        title: "What is it worth and how much should we own?",
        desc: "Master the art of valuation. Learn how to estimate the intrinsic value of a business and how to think about margin of safety.",
    },
    {
        day: "Day 5",
        title: "How do we build and manage a portfolio?",
        desc: "Pulling it all together. Learn the principles of portfolio construction, diversification, and the psychology of long-term investing.",
    }
]

function DayCard({ day, title, desc, isActive, onClick }: {
    day: string,
    title: string,
    desc: string,
    isActive: boolean,
    onClick: () => void
}) {
    return (
        <motion.div
            onClick={onClick}
            initial={false}
            animate={{
                scale: isActive ? 1.05 : 0.95,
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
                isActive ? "text-slate-500" : "text-main-black/80"
            )}>
                {desc}
            </p>

            <button className={cn(
                "font-semibold text-lg hover:underline text-left",
                isActive ? "text-brand" : "text-main-black"
            )}>
                Learn More..
            </button>
        </motion.div>
    )
}

export function Fundamentals() {
    const [activeIndex, setActiveIndex] = useState(1) // Default to Day 2 as in image

    return (
        <section className="bg-brand">
            <div className="py-12 md:py-20 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                        {/* Heading Side */}
                        <div className="w-full ">
                            <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-white leading-tight">
                                5-Day Fundamentals <br></br>of <span className="font-thin font-montserrat">Global Stock Investing</span>
                            </h2>
                        </div>

                        {/* Description Side */}
                        <div className="w-full">
                            <p className="text-white text-lg md:text-xl font-light leading-relaxed  font-montserrat max-w-lg leading-[1px]">
                                The StockUs Fundamentals Course Is An Intensive, Cohort-Based Program That Compresses Years Of Learning Into Five Focused Days. Each Day Answers One Key Question
                            </p>
                        </div>
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
