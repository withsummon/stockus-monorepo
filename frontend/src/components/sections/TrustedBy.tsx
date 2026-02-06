'use client'

import Image from "next/image"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function TrustedBy() {
    return (
        <div className="bg-main-black py-8 sm:py-12 xl:py-20 space-y-8 text-xl font-montserrat text-brand font-semibold text-center overflow-hidden">
            <ScrollReveal variant="fadeUp" delay={0.1}>
                <h2>Trusted by Stock Company & Popular Universities</h2>
            </ScrollReveal>

            {/* Infinite Marquee using CSS animation for reliable auto-scroll */}
            <div className="relative w-full overflow-hidden">
                {/* Gradient overlays for smooth fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-main-black to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-main-black to-transparent z-10 pointer-events-none" />

                <div className="flex gap-8 items-center animate-marquee">
                    {/* First set of logos */}
                    <Image
                        src="/maskgroup.svg"
                        alt="Trusted partners"
                        width={1920}
                        height={1080}
                        className='w-auto h-16 sm:h-20 lg:h-24 flex-shrink-0'
                    />
                    {/* Duplicate for seamless loop */}
                    <Image
                        src="/maskgroup.svg"
                        alt="Trusted partners"
                        width={1920}
                        height={1080}
                        className='w-auto h-16 sm:h-20 lg:h-24 flex-shrink-0'
                    />
                </div>
            </div>
        </div>
    )
}
