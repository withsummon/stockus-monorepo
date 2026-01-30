import { Button } from '@/components/ui/button'
import { ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-main-black py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center ">
          <h1 className="font-montserrat text-2xl sm:text-4xl font-semibold leading-none text-white">
            The Bridge Between Indonesian Investors And Global Stock Markets
          </h1>
          <p className="mt-6 text-lg leading-relaxed sm:text-md text-main-white opacity-75 font-light">
          Learn how professionals analyse businesses, value companies, and build portfolios from a team that has helped manage more than $12 billion across global markets.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/courses">
                View Curriculum
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">
                <Users className="mr-2" />
                Join the Next Cohor
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Already a member?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
