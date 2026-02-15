'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Globe, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NAV_LINKS, SITE_NAME } from '@/lib/constants'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import type { Locale } from '@/lib/i18n/translations'

export function MobileNav({ scrolled = true, user }: { scrolled?: boolean; user?: { name: string; email: string } | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { t, locale, setLocale } = useTranslation()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={`lg:hidden ${scrolled ? 'text-main-black' : 'text-white'}`}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>{SITE_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-lg font-medium transition-colors hover:text-slate-900 ${
                  isActive ? 'text-brand' : 'text-slate-600'
                }`}
              >
                {t(link.labelKey)}
              </Link>
            )
          })}

          {/* Language Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <Globe className="h-4 w-4 text-slate-500" />
            {(['en', 'id'] as Locale[]).map((code) => (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  locale === code
                    ? 'bg-brand text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <Button asChild>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="gap-2">
                  <User className="w-4 h-4" />
                  {user.name.split(' ')[0]}
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>{t('mobileNav.login')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/pricing" onClick={() => setOpen(false)}>{t('mobileNav.signup')}</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
