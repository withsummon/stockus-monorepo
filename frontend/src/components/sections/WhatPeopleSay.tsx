import React from 'react'
import Image from 'next/image'

const testimonials = [
    {
        name: 'Sarah Gibson',
        role: 'Moderate Investor',
        quote: 'The Mentors And Members Are Very Supportive. Every Question I Asked Was Answered Patiently And Clearly.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    },
    {
        name: 'Sarah Gibson',
        role: 'Moderate Investor',
        quote: 'The Mentors And Members Are Very Supportive. Every Question I Asked Was Answered Patiently And Clearly.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    },
    {
        name: 'Sarah Gibson',
        role: 'Moderate Investor',
        quote: 'The Mentors And Members Are Very Supportive. Every Question I Asked Was Answered Patiently And Clearly.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    },
]

export function WhatPeopleSay() {
    return (
        <section className="bg-main-black py-12 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto container">
                {/* Header */}
                <div className="text-center mb-16 md:mb-24 space-y-4">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat text-white leading-tight">
                        <span className="text-brand">What's</span> People Say?
                    </h2>
                    <p className="text-slate-400 font-montserrat text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        Discover what our satisfied have to say about their experiences with our products
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-[20px] p-4 md:px-8 md:py-6 flex flex-col items-start text-left space-y-6 shadow-lg"
                        >
                            {/* Avatar */}
                            <div className="relative w-12 h-12 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
                                <Image
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className='space-y-16'>
                                {/* Info */}
                                <div className="space-y-1">
                                    <h3 className="text-2xl md:text-3xl font-bold font-montserrat text-brand">
                                        {testimonial.name}
                                    </h3>
                                    <p className="text-slate-400 font-montserrat text-lg font-normal">
                                        {testimonial.role}
                                    </p>
                                </div>

                                {/* Quote */}
                                <p className="text-main-black font-montserrat text-lg md:text-lgl font-medium leading-relaxed">
                                    {testimonial.quote}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
