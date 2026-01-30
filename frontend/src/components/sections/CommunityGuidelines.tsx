import React from 'react'

export function CommunityGuidelines() {
    const principles = [
        {
            number: 1,
            text: 'Be respectful and constructive in all discussions',
        },
        {
            number: 2,
            text: 'Share knowledge freely, but don&apos;t pressure others to buy/sell',
        },
        {
            number: 3,
            text: 'Focus on learning and frameworks, not &ldquo;hot tips&rdquo;',
        },
        {
            number: 4,
            text: 'Support fellow members on their investing journey',
        },
    ]

    return (
        <section className="pb-32 px-4 sm:px-6 lg:px-8 bg-main-white">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-32 items-start">
                    {/* Left Column */}
                    <div className="w-full lg:w-1/3">
                        <h2 className="text-4xl md:text-5xl lg:text-3xl font-bold font-montserrat text-main-black leading-tight text-wrap-balance">
                            Community<br />
                            Guidelines
                        </h2>
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        <h3 className="text-2xl font-bold font-montserrat text-main-black italic">
                            Our Principles
                        </h3>
                        <div className="space-y-6">
                            {principles.map((principle) => (
                                <div key={principle.number} className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-[#F96E00] text-white flex items-center justify-center font-bold font-montserrat text-lg flex-shrink-0">
                                        {principle.number}
                                    </div>
                                    <p
                                        className="text-lg md:text-xl text-main-black font-montserrat font-medium"

                                    >
                                        {principle.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
