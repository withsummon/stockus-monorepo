import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function PremiumCommunity() {
    const features = [
        {
            title: 'Advanced Discussions',
            items: [
                'Deep-dive investment thesis discussions with vetted members',
                'Share research and analysis',
            ],
        },
        {
            title: 'Direct Instructor Access',
            items: [
                'Ask question directly to Jefta and Yosua',
                'Get feedback on your analysis',
            ],
        },
        {
            title: 'Portfolio Reviews',
            items: [
                'Share your portfolio for constructive feedbacks',
                'Learn from others approaches',
            ],
        },
        {
            title: 'Exclusive Events',
            items: [
                'Live market analysis sessions',
                'Guest speaker Q&A&apos;s',
                'Member-only workshops',
            ],
        },
        {
            title: 'Networking',
            items: [
                'Connect with serious investors industry professionals',
                'Founders and operators',
            ],
        },
        {
            title: 'Early Access',
            items: [
                'New research first',
                'Beta features and tools',
                'Priority support',
            ],
        },
    ]

    return (
        <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-main-white">
            <div
                className="container mx-auto rounded-[40px] overflow-hidden shadow-2xl p-8 md:p-16 flex flex-col items-center space-y-12"
                style={{
                    background: 'linear-gradient(0deg, #222831 0%, #F96E00 98.15%)'
                }}
            >
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-[#F96E00] font-montserrat font-bold text-sm tracking-widest uppercase shadow-sm">
                        STOCKUS MEMBER <Image src="/crown.svg" alt="Crown" width={20} height={18} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-white tracking-tight">
                        Premium Community
                    </h2>
                    <p className="text-lg md:text-xl text-white/80 font-montserrat font-light max-w-2xl mx-auto">
                        Exclusive access for enrolled students and inactive members
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-[20px] p-8 space-y-4 shadow-lg transition-all duration-300 hover:translate-y-[-4px] flex flex-col"
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
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="w-full pt-8">
                    <Button
                        className="bg-brand hover:bg-[#e06300] text-white rounded-[40px] py-8 text-2xl md:text-3xl font-bold font-montserrat shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                    >
                        Become A Member
                    </Button>
                </div>
            </div>
        </section>
    )
}
