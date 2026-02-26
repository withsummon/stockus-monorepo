'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const team = [
  {
    name: 'Jefta Ongkodiputra',
    role: '10+ years experiences as Investment Analyst',
    description: `A seasoned investor with over a decade of experience in hedge funds and global equities. Focused on deep fundamental research and long term quality compounding.

Coupled with university level teaching experience, Jefta brings a combination of years of real world investing and a way to distill complex information into actionable ideas and skills.`,
    image: '/jo.webp',
  },
  {
    name: 'Yosua Kho',
    role: '10+ years experiences as Investment Analyst',
    description: `A seasoned investor with over a decade of experience in hedge funds and global equities. Focused on deep fundamental research and long term quality compounding.

Coupled with university level teaching experience, Yosua brings a combination of years of real world investing and a way to distill complex information into actionable ideas and skills.`,
    image: '/jo2.webp',
  },
]

function CrossMarker({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen font-montserrat">
      {/* ── Section 1: Hero (dark) ── */}
      <section className="relative overflow-hidden bg-main-black pt-24 md:pt-32 pb-14 md:pb-20 px-4 sm:px-6 lg:px-8">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Cross markers */}
        <CrossMarker className="absolute top-6 left-6 text-white/10" />
        <CrossMarker className="absolute top-6 right-6 text-white/10" />
        <CrossMarker className="absolute bottom-6 left-6 text-white/10" />
        <CrossMarker className="absolute bottom-6 right-6 text-white/10" />

        <div className="container mx-auto max-w-6xl relative">
          <ScrollReveal variant="fadeUp">
            <span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-bold tracking-[0.15em] uppercase font-montserrat mb-6">
              {t('about.heroTag')}
            </span>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold font-montserrat leading-[1.1] tracking-tight text-white max-w-3xl">
              {t('about.heroTitle')}
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="mt-6 text-base md:text-lg text-white/50 font-montserrat font-light max-w-2xl leading-relaxed">
              {t('about.heroDescription')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section 2: Team (light) ── */}
      <section className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#f4f4f5] overflow-hidden">

        <div className="container mx-auto max-w-6xl relative">
          <ScrollReveal variant="fadeUp">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 text-brand text-xs font-bold tracking-[0.15em] uppercase font-montserrat">
              <span className="text-brand">&#x2727;</span>
              {t('about.teamTitle')}
            </span>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat text-main-black tracking-tight mb-12 md:mb-16">
              {t('about.teamSubtitle')}
            </h2>
          </ScrollReveal>

          <div className="space-y-6 md:space-y-8">
            {team.map((member, index) => {
              const isReversed = index % 2 !== 0
              return (
                <ScrollReveal key={index} variant="fadeUp" delay={index * 0.1}>
                  <motion.div
                    className="group relative bg-[#111318] rounded-2xl border border-white/[0.06] overflow-hidden"
                    whileHover={{ backgroundColor: '#161a21' }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Dot pattern inside card */}
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                    {/* Cross markers */}
                    <CrossMarker className="absolute top-3 left-3 text-white/10" />
                    <CrossMarker className="absolute top-3 right-3 text-white/10" />
                    <CrossMarker className="absolute bottom-3 right-3 text-white/10" />

                    <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                      {/* Text side */}
                      <div className="relative w-full lg:w-1/2 p-8 md:p-10 lg:p-14 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase font-montserrat">
                            {t('about.getToKnow')}
                          </span>
                          <div className="mt-5 space-y-4">
                            {member.description.split('\n\n').map((para, i) => (
                              <p key={i} className="text-white/60 text-sm sm:text-base leading-relaxed font-light font-montserrat">
                                {para.trim()}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="mt-8 lg:mt-10 pt-6 border-t border-white/[0.08]">
                          <h3 className="text-2xl sm:text-3xl font-bold text-white font-montserrat">
                            {member.name}
                          </h3>
                          <p className="text-brand text-sm sm:text-base mt-1.5 font-medium font-montserrat">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      {/* Image side */}
                      <div className="w-full lg:w-1/2 relative min-h-[350px] sm:min-h-[420px] lg:min-h-0">
                        <div className="absolute inset-0 lg:inset-4 lg:my-4 rounded-none lg:rounded-[16px] overflow-hidden bg-[#1a1d24]">
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                            priority
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hover accent line at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand/0 group-hover:bg-brand/30 transition-all duration-500" />
                  </motion.div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: CTA (dark) ── */}
      <section className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-main-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container mx-auto max-w-6xl text-center relative">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat text-white tracking-tight">
              {t('about.ctaTitle')}
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <p className="mt-4 text-base sm:text-lg text-white/50 font-montserrat font-light max-w-xl mx-auto leading-relaxed">
              {t('about.ctaText')}
            </p>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <Link
              href="/community"
              className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-brand text-white font-bold font-montserrat text-sm tracking-wide hover:bg-brand/90 transition-colors duration-200"
            >
              {t('about.ctaButton')}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
