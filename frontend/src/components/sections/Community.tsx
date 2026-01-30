import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Community() {
    return (
        <section className="bg-main-black py-12 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto container">
                <div className="relative w-full min-h-[500px] md:min-h-[600px] rounded-[20px] md:rounded-[40px] overflow-hidden group">
                    {/* Background Image */}
                    <Image
                        src="/community.jpg"
                        alt="Community"
                        fill
                        className="object-cover scale-[1.5] translate-x-[40%]"
                        priority
                    />

                    {/* Gradient Overlay & Content Container */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent md:via-white/100 md:to-transparent/30">
                        <div className="h-full flex flex-col justify-center px-8 md:px-20 max-w-2xl space-y-12 md:space-y-16 relative z-10">
                            <div className="space-y-4 md:space-y-6">
                                <h2 className="text-4xl md:text-3xl lg:text-4xl font-bold font-montserrat leading-tight text-main-black">
                                    <span className="text-brand">More Than A Course.</span> <br />
                                    It's A Community.
                                </h2>

                                <p className="text-main-black font-montserrat text-lg md:text-xl font-light leading-relaxed">
                                    Learning is easier when you're not doing it alone. StockUs members join a community of investors who are serious about improving their process and thinking long term.
                                </p>
                            </div>

                            <Button
                                className="bg-brand hover:bg-brand/90 text-white rounded-full py-6 px-10 text-xl font-bold font-montserrat self-start flex items-center gap-3 transition-transform hover:scale-105"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0951 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0951 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                                </svg>
                                Join Our Channel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
