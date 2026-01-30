import React from 'react'
import Image from 'next/image'

export function WhyIndonesian() {
    return (
        <section className="bg-custom-secondary py-16  ">
            <div className="max-w-4xl mx-auto text-center space-y-4 pb-24">
                <h2 className="font-montserrat text-4xl md:text-5xl font-semibold leading-tight text-main-black">
                    Why Indonesian Investors <br></br> <span className="text-brand block sm:inline">Choose StockUs</span>
                </h2>

                <p className="text-lg md:text-xl text-slate-500 font-light max-w-3xl mx-auto leading-relaxed">
                    Most investment classes tell you what to buy. StockUs teaches you <span className="text-main-black font-semibold">how to think</span> about global markets and decide with confidence.
                </p>
            </div>
            <div className='2xl:container 2xl:mx-auto'>
                <Image src="/whyus.webp" alt="Why Us" className='w-full h-auto relative z-10 ' width={1920} height={1080} />
            </div>
        </section>
    )
}
