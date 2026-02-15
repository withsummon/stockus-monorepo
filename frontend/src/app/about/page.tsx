'use client'

import { SITE_NAME } from '@/lib/constants'
import Image from 'next/image'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const team = [
  {
    name: 'Jefta Ongkodiputra',
    role: '10+ years experiences as Investment Analyst',
    description: `A seasoned investor with over a decade of experience in hedge funds and global equities. Focused on deep fundamental research and long term quality compounding.

    Coupled with university level teaching experience, Jefta brings a combination of years of real world investing and a way to distill complex information into actionable ideas and skills.`,
    image: '/jo.webp',
    layout: 'text-left'
  },
  {
    name: 'Yosua Kho',
    role: '10+ years experiences as Investment Analyst',
    description: `A seasoned investor with over a decade of experience in hedge funds and global equities. Focused on deep fundamental research and long term quality compounding.

    Coupled with university level teaching experience, Jefta brings a combination of years of real world investing and a way to distill complex information into actionable ideas and skills.`,
    image: '/jo2.webp',
    layout: 'image-left'
  }
]

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <main className="bg-main-white min-h-screen py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {team.map((member, index) => (
          <ScrollReveal key={index} variant={index === 0 ? "fadeRight" : "fadeLeft"} delay={index * 0.2}>
            <motion.div
              className="bg-brand rounded-[30px] md:rounded-[40px] p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {member.layout === 'image-left' ? (
                <>
                  {/* Image Section (Desktop: Left) */}
                  <ScrollReveal variant="scale" delay={0.2} className="w-full lg:w-1/2 flex justify-center">
                    <div className="relative w-full aspect-[4/5] rounded-[20px] md:rounded-[30px] overflow-hidden bg-white/10">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                        priority
                      />
                    </div>
                  </ScrollReveal>
                  {/* Content Section (Desktop: Right) */}
                  <div className="w-full lg:w-1/2 text-white space-y-8">
                    <div className="space-y-4">
                      <ScrollReveal variant="fadeUp" delay={0.3}>
                        <span className="text-sm md:text-base font-medium tracking-widest opacity-80 font-montserrat uppercase">
                          {t('about.getToKnow')}
                        </span>
                      </ScrollReveal>
                      <StaggerContainer staggerDelay={0.1} className="space-y-6">
                        {member.description.split('\n\n').map((para, i) => (
                          <StaggerItem key={i} variant="fadeUp">
                            <p className="text-lg md:text-xl font-normal font-montserrat leading-relaxed">
                              {para.trim()}
                            </p>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </div>
                    <ScrollReveal variant="fadeUp" delay={0.5}>
                      <div className="pt-8">
                        <h2 className="text-3xl md:text-3xl font-bold font-montserrat">
                          {member.name}
                        </h2>
                        <p className="text-lg md:text-xl opacity-80 font-montserrat mt-2">
                          {member.role}
                        </p>
                      </div>
                    </ScrollReveal>
                  </div>
                </>
              ) : (
                <>
                  {/* Content Section (Desktop: Left) */}
                  <div className="w-full lg:w-1/2 text-white space-y-8 order-2 lg:order-1">
                    <div className="space-y-4">
                      <ScrollReveal variant="fadeUp" delay={0.3}>
                        <span className="text-sm md:text-base font-medium tracking-widest opacity-80 font-montserrat uppercase">
                          {t('about.getToKnow')}
                        </span>
                      </ScrollReveal>
                      <StaggerContainer staggerDelay={0.1} className="space-y-6">
                        {member.description.split('\n\n').map((para, i) => (
                          <StaggerItem key={i} variant="fadeUp">
                            <p className="text-lg md:text-xl font-normal font-montserrat leading-relaxed">
                              {para.trim()}
                            </p>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
                    </div>
                    <ScrollReveal variant="fadeUp" delay={0.5}>
                      <div className="pt-8">
                        <h2 className="text-3xl md:text-3xl font-bold font-montserrat">
                          {member.name}
                        </h2>
                        <p className="text-lg md:text-xl opacity-80 font-montserrat mt-2">
                          {member.role}
                        </p>
                      </div>
                    </ScrollReveal>
                  </div>
                  {/* Image Section (Desktop: Right) */}
                  <ScrollReveal variant="scale" delay={0.2} className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
                    <div className="relative w-full aspect-[4/5] rounded-[20px] md:rounded-[30px] overflow-hidden bg-white/10">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                        priority
                      />
                    </div>
                  </ScrollReveal>
                </>
              )}
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </main>
  )
}
