'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(1) // Defaulting to the 2nd one as per screenshot

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
  ]

  return (
    <section className="bg-main-white py-12 md:py-24 xl:py-32 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto container">
        <ScrollReveal variant="scale">
          <div className="bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-16 xl:p-24 flex flex-col lg:flex-row gap-12 lg:gap-20 xl:gap-32 items-center">
            {/* Left Column: Title */}
            <ScrollReveal variant="fadeRight" className="w-full lg:w-5/12 xl:w-5/12">
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-[80px] font-bold font-montserrat text-main-black leading-[1.1]">
                <span className="text-brand">{t('faq.title1')}</span> <br />
                {t('faq.title2')} <br />
                {t('faq.title3')}
              </h2>
            </ScrollReveal>

            {/* Right Column: Accordion */}
            <StaggerContainer staggerDelay={0.1} className="w-full lg:w-7/12 xl:w-7/12 space-y-4">
              {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <StaggerItem key={index} variant="fadeUp">
                  <div
                    className={cn(
                      "rounded-[20px] transition-all duration-300 overflow-hidden",
                      isOpen ? "bg-brand text-white shadow-xl" : "bg-white text-slate-600"
                    )}
                  >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-8 py-6 md:py-8 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className={cn(
                      "text-lg md:text-xl font-bold font-montserrat pr-8",
                      isOpen ? "text-white" : "text-slate-600"
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
                </StaggerItem>
              )
            })}
            </StaggerContainer>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
