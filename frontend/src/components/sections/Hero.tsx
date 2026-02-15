'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/LanguageContext'

export function Hero() {
  const { t } = useTranslation()
  return (
    <section data-hero className="relative overflow-hidden bg-main-black pt-8 sm:pt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-montserrat text-2xl sm:text-5xl font-semibold leading-none text-white"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-6 text-sm sm:text-lg text-main-white opacity-75 font-light"
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row font-montserrat font-semibold"
          >
            <Button size="lg" variant="brand-outline" className="rounded-[15px] p-7 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/courses" className='font-semibold'>
                {t('hero.viewCurriculum')}
              </Link>
            </Button>
            <Button size="lg" variant="brand" className="rounded-[15px] p-7 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/pricing" className='font-semibold'>
                {t('hero.joinCohort')}
              </Link>
            </Button>
          </motion.div>

        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className='container mx-auto px-4 sm:px-6 lg:px-8 relative'
      >
        {/* Orange glow behind laptop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80%] h-[80%] rounded-full bg-[#C47A2A]/40 blur-[100px]" />
        </div>
        <div className="relative z-10">
          {/* VISA Coin - Top Left */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[5%] left-[2%] w-24 md:w-40 z-20"
          >
            <Image src="/VISA.png" alt="VISA" width={200} height={200} className="w-full h-auto drop-shadow-2xl" />
          </motion.div>

          {/* Amazon Coin - Mid Left */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[35%] -left-6 md:-left-10 w-18 md:w-28 z-20"
          >
            <Image src="/Amazon.png" alt="Amazon" width={120} height={120} className="w-full h-auto drop-shadow-2xl" />
          </motion.div>

          {/* Apple Coin - Bottom Left */}
          <motion.div
            animate={{ y: [0, -25, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[58%] -left-6 md:-left-10 w-24 md:w-40 z-20"
          >
            <Image src="/apple.png" alt="Apple" width={180} height={180} className="w-full h-auto drop-shadow-2xl" />
          </motion.div>

          {/* Microsoft Coin - Top Right */}
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[3%] right-[2%] w-20 md:w-32 z-20"
          >
            <Image src="/microsoft.png" alt="Microsoft" width={200} height={200} className="w-full h-auto drop-shadow-2xl" />
          </motion.div>

          {/* Meta Coin - Mid Right */}
          <motion.div
            animate={{ y: [0, -22, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[32%] -right-6 md:-right-10 w-16 md:w-28 z-20"
          >
            <Image src="/meta.png" alt="Meta" width={120} height={120} className="w-full h-auto drop-shadow-2xl" />
          </motion.div>

          {/* Netflix Coin - Bottom Right */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-[58%] -right-6 md:-right-10 w-24 md:w-40 z-20"
          >
            <Image src="/netflix.png" alt="Netflix" width={180} height={180} className="w-full h-auto drop-shadow-2xl" />
          </motion.div>

          <div className="relative z-10 h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] 2xl:h-[550px] overflow-hidden">
            <Image src="/laptop.svg" alt="Hero" width={1920} height={1080} className='w-full h-auto' />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
