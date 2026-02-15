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

function ResearchHeroBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      {/* Grid dot pattern — top right */}
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <circle key={`dot-${row}-${col}`} cx={800 + col * 45} cy={40 + row * 45} r="1.5" fill="#F96E00" opacity="0.06" />
        ))
      )}

      {/* Ascending chart line curves */}
      <path d="M0 400 Q150 380 300 350 T600 280 T900 200 T1200 160" stroke="#F96E00" strokeWidth="1.5" opacity="0.05" strokeLinecap="round" />
      <path d="M0 430 Q200 400 400 370 T800 290 T1200 220" stroke="#F96E00" strokeWidth="1" opacity="0.04" strokeLinecap="round" />
      <path d="M0 460 Q250 440 500 410 T1000 330 T1200 280" stroke="#F96E00" strokeWidth="0.8" opacity="0.03" strokeLinecap="round" />

      {/* Candlestick silhouettes — bottom right */}
      {[
        { x: 1020, h: 60, body: 30, y: 380 },
        { x: 1050, h: 50, body: 25, y: 390 },
        { x: 1080, h: 70, body: 35, y: 370 },
        { x: 1110, h: 55, body: 28, y: 385 },
        { x: 1140, h: 80, body: 40, y: 360 },
      ].map((c, i) => (
        <g key={`candle-${i}`}>
          <line x1={c.x + 4} y1={c.y} x2={c.x + 4} y2={c.y + c.h} stroke="#F96E00" strokeWidth="1" opacity="0.04" />
          <rect x={c.x} y={c.y + (c.h - c.body) / 2} width="8" height={c.body} rx="1.5" fill="#F96E00" opacity="0.05" />
        </g>
      ))}

      {/* Bar chart silhouette — left side */}
      <rect x="60" y="340" width="24" height="80" rx="4" fill="#F96E00" opacity="0.04" />
      <rect x="95" y="300" width="24" height="120" rx="4" fill="#F96E00" opacity="0.05" />
      <rect x="130" y="320" width="24" height="100" rx="4" fill="#F96E00" opacity="0.04" />
      <rect x="165" y="270" width="24" height="150" rx="4" fill="#F96E00" opacity="0.06" />
      <rect x="200" y="290" width="24" height="130" rx="4" fill="#F96E00" opacity="0.04" />

      {/* Dashed horizontal grid lines */}
      <line x1="50" y1="200" x2="1150" y2="200" stroke="#F96E00" strokeWidth="0.5" opacity="0.04" strokeDasharray="8 12" />
      <line x1="50" y1="280" x2="1150" y2="280" stroke="#F96E00" strokeWidth="0.5" opacity="0.03" strokeDasharray="8 12" />
      <line x1="50" y1="360" x2="1150" y2="360" stroke="#F96E00" strokeWidth="0.5" opacity="0.03" strokeDasharray="8 12" />

      {/* Large decorative circles for depth */}
      <circle cx="150" cy="100" r="80" fill="#F96E00" opacity="0.03" />
      <circle cx="1050" cy="120" r="120" fill="#F96E00" opacity="0.03" />
      <circle cx="600" cy="450" r="150" fill="#F96E00" opacity="0.02" />
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
      <div className="relative overflow-hidden bg-main-black py-16 md:py-24">
        {/* SVG decorative background */}
        <ResearchHeroBackground />

        {/* Orange glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[60%] rounded-full bg-[#C47A2A]/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative">
          <p className="text-sm font-semibold text-brand mb-4 tracking-wider uppercase font-montserrat">
            Research & Watchlist
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-montserrat leading-tight mb-5 text-white">
            Stock Research for You
          </h1>
          <p className="text-main-white opacity-75 text-base sm:text-lg max-w-2xl leading-relaxed font-light">
            Helping you spot opportunities and make investment decisions with measured risk management
          </p>
        </div>
      </div>

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
