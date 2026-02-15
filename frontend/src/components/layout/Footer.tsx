'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Instagram } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

// Custom SVGs for Discord and WhatsApp for better design match
const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152c-.0766.1364-.1626.3197-.2237.464a18.21 18.21 0 00-5.4164 0 12.3 12.3 0 00-.2237-.464 19.7821 19.7821 0 00-4.8851 1.5152C1.6521 8.3582.909 12.235 1.157 16.0354a19.721 19.721 0 005.9961 3.033c.478-.6545.9038-1.3534 1.258-2.0944a13.313 13.313 0 01-1.9213-.913c.1593-.1165.3151-.2397.464-.37 3.896 1.7946 8.1636 1.7946 12 0 .1489.1303.3047.2535.464.37a13.256 13.256 0 01-1.9212.913c.3541.741.7779 1.44 1.258 2.0944a19.73 19.73 0 005.9961-3.033c.3047-4.416-.5493-8.25-2.3168-11.6656zM8.02 14.156c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.095 2.1568 2.419 0 1.3332-.9554 2.419-2.1569 2.419zm7.974 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.095 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.099-.47-.15-.668.149-.198.298-.767.971-.94 1.169-.173.198-.347.222-.648.072-1.281-.64-2.13-1.06-3.038-1.616-.76-.467-1.488-.933-2.175-1.558-.291-.264-.474-.53-.298-.718a38.4 38.4 0 00.34-.408l.196-.245c.195-.246.26-.41.385-.683.065-.137.033-.257-.016-.356-.05-.099-.47-1.132-.644-1.55-.169-.408-.34-.352-.47-.358-.124-.006-.264-.007-.403-.007-.139 0-.365.052-.556.26-.191.208-.73.712-.73 1.737 0 1.025.746 2.016.85 2.156.104.14 1.467 2.24 3.553 3.14 1.954.842 2.35 1.01 3.18 1.091.83.082 1.62-.05 2.22-.138.6-.088 2.446-1.025 2.541-1.246.096-.22.096-.408.067-.447-.028-.039-.105-.06-.406-.21zM12 21.3a9.3 9.3 0 01-4.75-1.3l-.338-.2-.34.2-.34-.2a22.5 22.5 0 00-.338-.2 9.3 9.3 0 01-4.75 1.3 9.3 9.3 0 01-9.3-9.3 9.3 9.3 0 019.3-9.3 9.3 9.3 0 019.3 9.3 9.3 9.3 0 01-9.3 9.3zm0-10a12.8 12.8 0 000 25.6 12.8 12.8 0 0011.08-19.2c.16-.32.32-.64.48-.96a12.8 12.8 0 00-11.56-5.44z" />
  </svg>
)

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-black text-white py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto container">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-24 mb-16 md:mb-32">
          {/* Logo & Disclaimer */}
          <ScrollReveal variant="fadeRight" className="w-full md:w-7/12 space-y-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/stockus.webp"
                alt="StockUs Logo"
                width={120}
                height={40}
                className="brightness-0 invert"
              />
            </Link>
            <div className="space-y-4 max-w-2xl">
              <p className="text-white font-montserrat text-sm md:text-base leading-relaxed">
                {t('footer.desc')}
              </p>
              <p className="text-white font-montserrat text-sm md:text-base leading-relaxed">
                {t('footer.disclaimer')}
              </p>
            </div>
          </ScrollReveal>

          {/* Contact Info */}
          <ScrollReveal variant="fadeLeft" delay={0.2} className="w-full md:w-4/12 flex flex-col items-start md:items-end">
            <div className="space-y-6">
              <h3 className="text-lg md:text-xl font-bold font-montserrat text-white md:text-right">
                {t('footer.contactInfo')}
              </h3>
              <div className="flex items-center gap-6">
                <Link href="mailto:hello@stockus.id" className="text-white hover:text-brand transition-all duration-300 hover:scale-110">
                  <Mail className="w-6 h-6" />
                </Link>
                <Link href="https://discord.gg/stockus" target="_blank" className="text-white hover:text-brand transition-all duration-300 hover:scale-110">
                  <DiscordIcon />
                </Link>
                <Link href="https://instagram.com/stockus_id" target="_blank" className="text-white hover:text-brand transition-all duration-300 hover:scale-110">
                  <Instagram className="w-6 h-6" />
                </Link>
                <Link href="https://wa.me/something" target="_blank" className="text-white hover:text-brand transition-all duration-300 hover:scale-110">
                  <WhatsAppIcon />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom Bar */}
        <ScrollReveal variant="fadeUp" delay={0.3}>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-slate-400 font-montserrat text-sm border-slate-800">
              <Link href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/disclaimer" className="hover:text-white transition-colors">{t('footer.disclaimerLink')}</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link>
            </div>

            <p className="text-slate-400 font-montserrat text-sm text-center md:text-right">
              &copy; {new Date().getFullYear()} {t('footer.rights')}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
