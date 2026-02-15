'use client'

import Image from 'next/image'
import { SITE_NAME } from '@/lib/constants'
import { Image as ImageIcon } from 'lucide-react'
import { OpenCommunity } from '@/components/sections/OpenCommunity'
import { PremiumCommunity } from '@/components/sections/PremiumCommunity'
import { CommunityGuidelines } from '@/components/sections/CommunityGuidelines'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export default function CommunityPage() {
  const { t } = useTranslation()

  const differences = [
    {
      title: t('communityPage.diff1.title'),
      description: t('communityPage.diff1.desc'),
    },
    {
      title: t('communityPage.diff2.title'),
      description: t('communityPage.diff2.desc'),
    },
    {
      title: t('communityPage.diff3.title'),
      description: t('communityPage.diff3.desc'),
    },
  ]

  return (
    <main className="bg-main-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <ScrollReveal variant="fadeUp">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-main-black tracking-tight leading-tight">
              {t('communityPage.title')}
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.15}>
            <p className="text-lg md:text-2xl text-slate-500 font-montserrat font-light leading-relaxed max-w-3xl mx-auto">
              {t('communityPage.subtitle')} <br className="hidden md:block" />
              {t('communityPage.subtitle2')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Visual Section */}
      <ScrollReveal variant="scale">
        <section className="w-full">
          <div className="relative w-full aspect-[21/9] md:aspect-[3/1] lg:aspect-[2.5/1] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/community.jpg"
                alt="StockUs Community"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            {/* Subtle blue accent line as per screenshot */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#007AFF]"></div>
          </div>
        </section>
      </ScrollReveal>

      {/* Difference Section */}
      <section className="bg-brand py-24 md:py-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center text-white space-y-6">
            <ScrollReveal variant="fadeUp">
              <h2 className="text-4xl md:text-5xl font-normal font-montserrat tracking-tight leading-tight">
                {t('communityPage.differenceTitle')} <span className="font-extrabold">{t('communityPage.differenceTitleBold')}</span> {t('communityPage.differenceTitleEnd')}
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.15}>
              <p className="text-lg md:text-2xl font-montserrat font-light  mx-auto opacity-90 leading-relaxed">
                {t('communityPage.differenceSubtitle')} <br className="hidden md:block" />
                {t('communityPage.differenceSubtitle2')}
              </p>
            </ScrollReveal>
          </div>

          <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {differences.map((diff, index) => (
              <StaggerItem key={index} variant="fadeUp">
                <motion.div
                  className="bg-white rounded-[20px] p-8 flex flex-col items-center text-center space-y-10 shadow-2xl h-full"
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-[30px] flex items-center justify-center overflow-hidden border border-slate-100">
                    <ImageIcon className="w-16 h-16 text-slate-200" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/20 to-transparent"></div>
                  </div>
                  {/* Spacer as requested */}
                  <div className="h-4"></div>
                  <div className="space-y-4 pb-4">
                    <h3 className="text-2xl md:text-2xl font-bold font-montserrat text-main-black">
                      {diff.title}
                    </h3>
                    <p className="text-slate-500 font-montserrat text-lg md:text-xl font-light leading-relaxed">
                      {diff.description}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <OpenCommunity />
      <PremiumCommunity />
      <CommunityGuidelines />
    </main>
  )
}
