import { Button } from '@/components/ui/button'
import { ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-main-black py-16 sm:py-24 space-y-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="mx-auto max-w-3xl text-center ">
          <h1 className="font-montserrat text-2xl sm:text-4xl font-semibold leading-none text-white">
            The Bridge Between Indonesian Investors And Global Stock Markets
          </h1>
          <p className="mt-6 text-lg leading-relaxed sm:text-md text-main-white opacity-75 font-light">
            Learn how professionals analyse businesses, value companies, and build portfolios from a team that has helped manage more than $12 billion across global markets.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row font-montserrat font-semibold">
            <Button size="lg" variant="brand-outline" className="rounded-[15px] p-6" asChild>
              <Link href="/courses" className='font-semibold'>
                View Curriculum
              </Link>
            </Button>
            <Button size="lg" variant="brand" className="rounded-[15px] p-6" asChild>
              <Link href="/pricing" className='font-semibold'>
                Join the Next Cohort
              </Link>
            </Button>
          </div>

        </div>
      </div>
      <div className=' container mx-auto px-4 sm:px-6 lg:px-8'>
        <Image src="/laptop.svg" alt="Hero" width={1920} height={1080} className='w-full h-auto' />
      </div>
    </section>
  )
}
