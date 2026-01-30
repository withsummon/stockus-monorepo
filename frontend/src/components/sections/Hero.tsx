'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
export function Hero() {
  return (

    <section className="relative overflow-hidden bg-main-black pt-8 sm:pt-12  sm:max-h-[900px]  lg:max-h-[900px] 2xl:max-h-[990px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-montserrat text-2xl sm:text-5xl font-semibold leading-none text-white">
            The Bridge Between Indonesian Investors And Global Stock Markets
          </h1>
          <p className="mt-6 text-sm sm:text-lg text-main-white opacity-75 font-light">
            Learn how professionals analyse businesses, value companies, and build portfolios from a team that has helped manage more than $12 billion across global markets.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row font-montserrat font-semibold">
            <Button size="lg" variant="brand-outline" className="rounded-[15px] p-7" asChild>
              <Link href="/courses" className='font-semibold'>
                View Curriculum
              </Link>
            </Button>
            <Button size="lg" variant="brand" className="rounded-[15px] p-7" asChild>
              <Link href="/pricing" className='font-semibold'>
                Join the Next Cohort
              </Link>
            </Button>
          </div>

        </div>
      </div>


      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className='container mx-auto px-4 sm:px-6 lg:px-8 relative '
      >
        <div className="relative z-10">
          {/* Nvidia Coin - Top Left */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-4/5 left-[3%] w-24 md:w-32 z-20"
          >
            <Image src="/nvidia.webp" alt="Nvidia" width={200} height={200} className="w-full h-auto drop-shadow-2xl scale-100 md:scale-[2.3]" />
          </motion.div>

          {/* Amazon Coin - Mid Left */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/4 -left-12 md:-left-18 w-20 md:w-30 z-20"
          >
            <Image src="/amazon.webp" alt="Amazon" width={120} height={120} className="w-full h-auto drop-shadow-2xl scale-100 md:scale-[1.5]" />
          </motion.div>

          {/* Apple Coin - Bottom Left */}
          <motion.div
            animate={{ y: [0, -25, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-1/2 -left-0 w-32 md:w-40 z-20"
          >
            <Image src="/apple.webp" alt="Apple" width={180} height={180} className="w-full h-auto drop-shadow-2xl scale-100 md:scale-[1.8]" />
          </motion.div>

          {/* Microsoft Coin - Top Right */}
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-4/5 right-[3%] w-24 md:w-32 z-20"
          >
            <Image src="/microsoft.webp" alt="Microsoft" width={200} height={200} className="w-full h-auto drop-shadow-2xl scale-80 md:scale-[0.8]" />
          </motion.div>

          {/* Meta Coin - Mid Right */}
          <motion.div
            animate={{ y: [0, -22, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-1/4 -right-12 md:-right-18 w-20 md:w-30 z-20"
            style={{ transform: "scale(1.4)" }}
          >
            <Image src="/meta.webp" alt="Meta" width={120} height={120} className="w-full h-auto drop-shadow-2xl scale-80 md:scale-[1.4]" />
          </motion.div>

          {/* Tesla Coin - Bottom Right */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-1/3 -right-0 w-32 md:w-40 z-20"
          >
            <Image src="/tesla.webp" alt="Tesla" width={180} height={180} className="w-full h-auto drop-shadow-2xl scale-70 md:scale-[1]" />
          </motion.div>

          <Image src="/laptop.svg" alt="Hero" width={1920} height={1080} className='w-full h-auto relative z-10' />
        </div>
      </motion.div>

    </section>


  )
}
