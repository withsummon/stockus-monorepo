'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "Who is StockUs for?",
    answer: "StockUs is for Indonesian investors who want to seriously learn how to invest in global stocks — whether you're just starting or already investing but feel lost and want a proper framework."
  },
  {
    question: "Do you give stock recommendations or signals?",
    answer: "StockUs is for Indonesian investors who want to seriously learn how to invest in global stocks — whether you're just starting or already investing but feel lost and want a proper framework." // Reusing text from screenshot if possible, though it seems they might be placeholders
  },
  {
    question: "I'm a complete beginner. Is this too advanced for me?",
    answer: "The Fundamentals Course is designed to be accessible for everyone, starting from the very basics and building up to institutional-level frameworks."
  },
  {
    question: "Will you cover brokers and tax for Indonesian investors?",
    answer: "Yes, we discuss the practicalities of opening brokerage accounts and the tax implications for Indonesian residents investing globally."
  },
  {
    question: "How long do I get access to the material?",
    answer: "You will have lifetime access to the recorded sessions and all downloadable materials provided during the cohort."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(1) // Defaulting to the 2nd one as per screenshot

  return (
    <section className="bg-main-white py-12 md:py-24 xl:py-32 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto container">
        <div className="bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-16 xl:p-24 flex flex-col lg:flex-row gap-12 lg:gap-20 xl:gap-32 items-center">
          {/* Left Column: Title */}
          <div className="w-full lg:w-5/12 xl:w-5/12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-[80px] font-bold font-montserrat text-main-black leading-[1.1]">
              <span className="text-brand">Frequently</span> <br />
              Asked <br />
              Questions
            </h2>
          </div>

          {/* Right Column: Accordion */}
          <div className="w-full lg:w-7/12 xl:w-7/12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-[20px] transition-all duration-300 overflow-hidden",
                    isOpen ? "bg-brand text-white shadow-xl" : "bg-white text-slate-400"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-8 py-6 md:py-8 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className={cn(
                      "text-lg md:text-xl font-bold font-montserrat pr-8",
                      isOpen ? "text-white" : "text-slate-400"
                    )}>
                      {faq.question}
                    </span>
                    <ChevronDown className={cn(
                      "w-6 h-6 flex-shrink-0 transition-transform duration-300",
                      isOpen ? "rotate-180 text-white" : "text-slate-300"
                    )} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-8 pb-8 md:pb-10">
                          <p className="text-base md:text-lg font-montserrat font-medium leading-relaxed max-w-2xl">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
