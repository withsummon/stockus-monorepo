import React from 'react'
import { Button } from '@/components/ui/button'
import { MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'

export function JoinMembership() {
    const inclusions = [
        '5 Days Of Live, Instructor-Led Sessions',
        'Full Breakdown Of The StockUs Framework: Business, Industry, Valuation, And Portfolio Construction',
        'Live Case Study On A Real Global Stock',
        'Course Materials, Slides, And Templates',
        'Investment Checklist, Valuation Template, And Journal Template (SOON!)',
        'Access To Member Discussion Channels During The Cohort',
        'Limited-Time Access To Session Recordings (T&C Applied)',
    ]

    return (
        <section className="bg-main-black py-16 md:py-32 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto container">
                {/* Header */}
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-white leading-tight">
                        Join Our Membership
                    </h2>
                    <p className="text-white text-lg md:text-2xl font-montserrat">
                        Get started to learn StockUs <span className="text-brand">Fundamentals Course</span>
                    </p>
                </div>

                {/* Membership Card */}
                <div className="bg-brand max-w-7xl mx-auto rounded-[20px] md:rounded-[20px] p-8 md:p-16 lg:py-10 lg:px-10 flex flex-col lg:flex-row gap-12 lg:gap-24 relative overflow-hidden">
                    {/* Left Column */}
                    <div className="w-full lg:w-5/12 space-y-8 md:space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-3xl md:text-4xl lg:text-2xl font-bold font-montserrat text-white leading-tight">
                                StockUs Fundamentals <br />
                                5-Day Intensive
                            </h3>
                            <p className="text-white/90 font-montserrat text-lg md:text-xl lg:text-lg font-light leading-relaxed max-w-xl">
                                A Concentrated, Institutional-Style Introduction To Global Stock Investing For Indonesian Investors
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-white text-xl md:text-2xl lg:text-lg font-bold font-montserrat">
                                Investment
                            </p>
                            <p className="text-white text-3xl md:text-5xl lg:text-4xl font-bold font-montserrat">
                                IDR {MEMBERSHIP_PRICE_FORMATTED.replace('Rp ', '')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <Button
                                className="bg-white hover:bg-white/90 text-brand rounded-2xl py-6 md:py-8 px-10 md:px-12 text-xl md:text-2xl lg:text-lg font-bold font-montserrat w-full md:w-auto shadow-xl transition-transform hover:scale-105"
                            >
                                Join StockUs Now
                            </Button>

                            <p className="text-white text-xl lg:text-lg font-medium font-montserrat text-center md:text-left cursor-pointer hover:underline">
                                Talk To Our Team
                            </p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-7/12 space-y-6 md:space-y-8">
                        <h4 className="text-2xl md:text-3xl lg:text-xl font-bold font-montserrat text-white mb-8">
                            What's Included:
                        </h4>
                        <ul className="space-y-4 md:space-y-1">
                            {inclusions.map((item, index) => (
                                <li key={index} className="flex gap-4 text-white text-lg md:text-xl lg:text-lg font-light leading-snug font-montserrat">
                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-white rounded-full"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
