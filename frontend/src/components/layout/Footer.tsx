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
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.01a9.865 9.865 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-white font-montserrat text-sm border-slate-800">
              <Link href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/disclaimer" className="hover:text-white transition-colors">{t('footer.disclaimerLink')}</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link>
            </div>

            <p className="text-white font-montserrat text-sm text-center md:text-right">
              &copy; {new Date().getFullYear()} {t('footer.rights')}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
