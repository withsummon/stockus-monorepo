'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

function CrossMarker({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(1)

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
  ]

  return (
    <section className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#f4f4f5] overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left Column: Title */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-32 lg:self-start">
            <ScrollReveal variant="fadeUp">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 text-brand text-xs font-bold tracking-[0.15em] uppercase font-montserrat">
                <span className="text-brand">&#x2727;</span>
                FAQ
              </span>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold font-montserrat text-main-black leading-[1.1] tracking-tight">
                {t('faq.title1')}{' '}
                {t('faq.title2')}{' '}
                <span className="text-brand">{t('faq.title3')}</span>
              </h2>
            </ScrollReveal>
          </div>

          {/* Right Column: Accordion */}
          <StaggerContainer staggerDelay={0.08} className="w-full lg:w-7/12 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <StaggerItem key={index} variant="fadeUp">
                  <div
                    className={cn(
                      'rounded-2xl border transition-all duration-300 overflow-hidden',
                      isOpen
                        ? 'bg-main-black border-white/[0.06]'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    )}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left focus:outline-none gap-4"
                    >
                      <span
                        className={cn(
                          'text-base md:text-lg font-bold font-montserrat',
                          isOpen ? 'text-white' : 'text-main-black'
                        )}
                      >
                        {faq.question}
                      </span>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300',
                          isOpen ? 'bg-brand/15' : 'bg-slate-100'
                        )}
                      >
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-300',
                            isOpen ? 'rotate-180 text-brand' : 'text-slate-400'
                          )}
                        />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                          }}
                          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                            <p className="text-sm md:text-base text-white/60 font-montserrat font-light leading-relaxed">
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
      </div>
    </section>
  )
}
