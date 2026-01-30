import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ResourceItemProps {
    title: string
    description: string
}

function ResourceItem({ title, description }: ResourceItemProps) {
    return (
        <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 mt-1">
                <Image src="/files.svg" alt="File icon" width={24} height={24} className="w-6 h-auto" />
            </div>
            <div className="space-y-2 md:space-y-3">
                <h4 className="text-lg md:text-xl font-bold text-main-black font-montserrat leading-tight">
                    {title}
                </h4>
                <p className="text-slate-400 font-light text-sm md:text-base leading-snug font-montserrat">
                    {description}
                </p>
            </div>
        </div>
    )
}

interface ResourceCardProps {
    title: string
    items: ResourceItemProps[]
}

function ResourceCard({ title, items }: ResourceCardProps) {
    return (
        <div className="bg-white rounded-[25px] md:rounded-[40px] p-6 md:p-12 shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="bg-brand text-white text-center py-3 md:py-4 px-6 md:px-8 rounded-full text-lg md:text-2xl font-bold font-montserrat mb-6 md:mb-10 inline-block self-center w-full">
                {title}
            </div>
            <div className="space-y-6 md:space-y-8 flex-grow">
                {items.map((item, index) => (
                    <ResourceItem key={index} title={item.title} description={item.description} />
                ))}
            </div>
        </div>
    )
}

export function WhatYouGet() {
    const toolsAndTemplates = [
        {
            title: "Excel valuation model template",
            description: "A flexible valuation model you can adapt to different companies, with new industry examples uploaded over time.",
        },
        {
            title: "Stock screener framework",
            description: "Criteria and filters you can plug into common screeners to surface better-quality ideas.",
        },
        {
            title: "Investment checklist template",
            description: "A standardised checklist you can use before every investment.",
        },
        {
            title: "Investment report template",
            description: "A clean structure to write up your research and archive your thinking.",
        },
        {
            title: "Investment journal template",
            description: "A simple way to document decisions, track your emotional state, and learn from your own history.",
        },
    ]

    const digitalLibrary = [
        {
            title: "Earnings packs",
            description: "Curated summaries of key global earnings with commentary.",
        },
        {
            title: "Market updates",
            description: "Periodic updates on major moves in global markets.",
        },
        {
            title: "Macro updates",
            description: "Plain-English explanations of macro themes that actually matter to equity investors.",
        },
        {
            title: "Stock deep dives",
            description: "Detailed breakdowns of selected global companies.",
        },
        {
            title: "Industry deep dives",
            description: "Structured looks at sectors and themes, covering both opportunities and risks.",
        },
    ]

    return (
        <section className="bg-custom-secondary py-12 md:py-24 px-4 sm:px-6 lg:px-8 ">
            <div className="max-w-7xl mx-auto container mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-main-black leading-tight">
                        <span className="text-brand">What You Get</span> <br />
                        Beyond The Course
                    </h2>
                    <p className="text-main-black font-normal text-lg md:text-xl max-w-3xl mx-auto  container font-montserrat">
                        Get access to tools, templates, and ongoing content as the community grows so you can stay in the game.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    <ResourceCard title="Tools & Templates" items={toolsAndTemplates} />
                    <ResourceCard title="Digital Content Library" items={digitalLibrary} />
                </div>
            </div>
        </section>
    )
}
