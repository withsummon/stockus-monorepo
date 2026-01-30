'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { MobileNav } from './MobileNav'
import Image from 'next/image'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-3">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-slate-900">
            <Image
              src="/stockus.webp"
              alt="Logo"
              width={100}
              height={100}
            />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-slate-900 ${isActive ? 'text-brand' : 'text-slate-600'
                  }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="lg" className="hidden md:inline-flex rounded-[20px] text-brand border border-brand" asChild>
            <Link href="/login" className='font-montserrat font-light'>Login</Link>
          </Button>
          <Button size="lg" variant="brand" className="hidden md:inline-flex rounded-[20px]" asChild>
            <Link href="/pricing" className='font-montserrat font-light'>Signup</Link>
          </Button>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
