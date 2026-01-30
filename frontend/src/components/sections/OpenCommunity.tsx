import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FaDiscord } from 'react-icons/fa'

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
                    <div className="inline-block px-6 py-2 rounded-full border border-[#F96E00] text-[#F96E00] font-montserrat font-bold text-sm tracking-widest uppercase">
                        Free to Join
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-main-black tracking-tight text-wrap-balance">
                        Open Community
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 font-montserrat font-light max-w-2xl mx-auto">
                        Anyone can join our open Discord Community
                    </p>
                </div>

                {/* Main Card */}
                <div
                    className="rounded-[40px] overflow-hidden shadow-xl flex flex-col lg:flex-row relative min-h-[600px]"
                    style={{
                        background: 'radial-gradient(89.81% 130.7% at 95.86% 105.24%, #F96E00 0%, #FFFFFF 74.69%)'
                    }}
                >
                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center space-y-12 z-10">
                        {/* What's Included */}
                        <div className="bg-[#333C44] rounded-2xl p-8 text-white space-y-6 max-w-md shadow-lg">
                            <h3 className="text-xl font-bold font-montserrat">What&apos;s Included:</h3>
                            <ul className="space-y-4">
                                {inclusions.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 font-montserrat text-lg font-light">
                                        <span className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* How to Join */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold font-montserrat text-main-black">How to Join?</h3>
                            <div className="space-y-4">
                                {steps.map((step) => (
                                    <div key={step.number} className="flex items-center gap-4">
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
                                ))}
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className='max-w-sm'>
                            <Button
                                className="bg-[#F96E00]  hover:bg-[#e06300] text-white rounded-[40px] py-8 px-10 text-xl font-bold font-montserrat shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 w-full "
                            >
                                <FaDiscord className="w-6 h-6" />
                                Join Our Channel
                            </Button>
                        </div>
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
                </div>
            </div>
        </section >
    )
}
