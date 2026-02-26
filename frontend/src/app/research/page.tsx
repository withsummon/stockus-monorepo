import { Metadata } from 'next'
import { fetchAPI } from '@/lib/api-client-server'
import { getUser } from '@/lib/auth/dal'
import { SITE_NAME } from '@/lib/constants'
import type { ResearchReport, WatchlistStock, PortfolioHolding } from '@/types'
import { ResearchTabs } from './ResearchTabs'

export const metadata: Metadata = {
  title: `Research & Watchlist - ${SITE_NAME}`,
  description: 'Access stock research reports, watchlist, and the Stockus portfolio.',
}

function CrossMarker({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export default async function ResearchPage() {
  const user = await getUser()

  let reports: ResearchReport[] = []
  let stocks: WatchlistStock[] = []
  let holdings: PortfolioHolding[] = []

  try {
    const [researchData, watchlistData, portfolioData] = await Promise.all([
      fetchAPI<{ reports: ResearchReport[] }>('/research', { revalidate: 300 }).catch(() => ({ reports: [] })),
      fetchAPI<{ stocks: WatchlistStock[] }>('/watchlist', { revalidate: 300 }).catch(() => ({ stocks: [] })),
      fetchAPI<{ holdings: PortfolioHolding[] }>('/portfolio', { revalidate: 300 }).catch(() => ({ holdings: [] })),
    ])
    reports = researchData.reports || []
    stocks = watchlistData.stocks || []
    holdings = portfolioData.holdings || []
  } catch {
    // fallback to empty
  }

  return (
    <div className="bg-custom-secondary min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-main-black pt-24 md:pt-32 pb-14 md:pb-20 px-4 sm:px-6 lg:px-8">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Cross markers */}
        <CrossMarker className="absolute top-6 left-6 text-white/10" />
        <CrossMarker className="absolute top-6 right-6 text-white/10" />
        <CrossMarker className="absolute bottom-6 left-6 text-white/10" />
        <CrossMarker className="absolute bottom-6 right-6 text-white/10" />

        <div className="container mx-auto max-w-6xl relative">
          <span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-bold tracking-[0.15em] uppercase font-montserrat mb-6 animate-[fadeInUp_0.6s_ease-out_both]">
            Research & Watchlist
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold font-montserrat leading-[1.1] tracking-tight text-white max-w-3xl animate-[fadeInUp_0.7s_ease-out_0.12s_both]">
            Stock Research for You
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/50 font-montserrat font-light max-w-2xl leading-relaxed animate-[fadeInUp_0.7s_ease-out_0.25s_both]">
            Helping you spot opportunities and make investment decisions with measured risk management
          </p>
        </div>
      </section>

      {/* Tabs Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-8 relative z-10">
        <ResearchTabs
          reports={reports}
          stocks={stocks}
          holdings={holdings}
          isLoggedIn={!!user}
          isMember={user?.tier === 'member'}
        />
      </div>
    </div>
  )
}
