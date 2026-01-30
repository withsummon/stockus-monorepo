import React from 'react'
import Image from 'next/image'

export function WhosBehind() {
    return (
        <section className="bg-white py-12 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto container">
                {/* Header */}
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-main-black leading-tight">
                        Who's Behind <br />
                        <span className="text-brand">StockUs?</span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    {/* Left: Image Box */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[600px] aspect-[4/3]">
                            <Image
                                src="/whosbehind.webp"
                                alt="StockUs Team - Yosua Kho and Jefta Ongkodiputra"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right: Content Box */}
                    <div className="w-full lg:w-1/2 space-y-8 md:space-y-12">
                        <div className="space-y-9">
                            <p className="text-main-black font-montserrat text-lg md:text-xl leading-relaxed">
                                <span className="text-brand font-bold">StockUs</span> Was Created To Close The Gap Between How Professionals Think About Investing And What Retail Investors Usually See On Social Media. Our Goal Is Simple: Give Indonesian Investors A Clear, Honest, And Practical Way To Approach Global Stock Markets.
                            </p>

                            <p className="text-slate-400 font-montserrat text-lg md:text-xl font-light leading-relaxed">
                                The Curriculum Is Led By A Team With 10+ Years Of Hands-On Experience Across The Hedge Fund Industry, Family Offices, Private Equity, Superannuation, Investment Banking, And Crypto Asset Markets. Collectively, We've Been Involved In Managing Over $12 Billion In Funds Across Different Strategies And Market Cycles.
                            </p>

                            <p className="text-slate-400 font-montserrat text-lg md:text-xl font-light leading-relaxed">
                                All Of That Experience Is Boiled Down Into A Process You Can Actually Use As An Individual Investor: How To Think About Businesses, How To Judge Industries, How To Value Companies, And How To Build A Portfolio That Fits Your Goals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
