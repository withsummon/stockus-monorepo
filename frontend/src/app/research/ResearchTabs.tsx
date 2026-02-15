'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Lock, TrendingUp, TrendingDown, Search, BarChart3, Briefcase } from 'lucide-react'
import type { ResearchReport, WatchlistStock, PortfolioHolding } from '@/types'

interface ResearchTabsProps {
  reports: ResearchReport[]
  stocks: WatchlistStock[]
  holdings: PortfolioHolding[]
  isLoggedIn: boolean
  isMember: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  swing: 'Swing',
  short_term: 'Short Term',
  long_term: 'Long Term',
}

const ALLOCATION_COLORS = [
  '#F96E00', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ef4444', '#84cc16', '#ec4899', '#14b8a6',
]

const COIN_LOGOS: Record<string, string> = {
  NVDA: '/nvidia.webp',
  AAPL: '/apple.png',
  AMZN: '/Amazon.png',
  META: '/meta.png',
  MSFT: '/coin-logo/Microsoft-Coin.png',
  NFLX: '/coin-logo/Netflix-Coin.png',
  V: '/coin-logo/VISA-coin.png',
  ADYEN: '/coin-logo/Adyen-Coin.png',
  FWONK: '/coin-logo/F1-Coin.png',
  'BRK.B': '/coin-logo/BH-Coin.png',
}

export function ResearchTabs({ reports, stocks, holdings, isLoggedIn, isMember }: ResearchTabsProps) {
  const [activeTab, setActiveTab] = useState<'research' | 'watchlist' | 'portfolio'>('research')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const tabs = [
    { id: 'research' as const, label: 'Research', icon: FileText },
    { id: 'watchlist' as const, label: 'Watchlist', icon: BarChart3 },
    { id: 'portfolio' as const, label: 'Portfolio', icon: Briefcase },
  ]

  return (
    <div className="font-montserrat">
      {/* Tab Headers */}
      <div className="bg-white rounded-t-[20px] sm:rounded-t-[30px] shadow-sm border border-slate-100 border-b-0 overflow-hidden">
        <div className="flex">
          {tabs.map((tab, tabIndex) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isFirst = tabIndex === 0
            const isLast = tabIndex === tabs.length - 1
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-semibold transition-all duration-300 relative ${
                  isActive
                    ? 'text-brand bg-white'
                    : 'text-slate-400 hover:text-slate-600 bg-slate-50/50'
                } ${isFirst ? 'rounded-tl-[20px] sm:rounded-tl-[30px]' : ''} ${isLast ? 'rounded-tr-[20px] sm:rounded-tr-[30px]' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : ''}`} />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-brand rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-[20px] sm:rounded-b-[30px] shadow-sm border border-slate-100 border-t-0 p-4 sm:p-6 md:p-10 mb-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'research' && (
              <ResearchTab reports={reports} isMember={isMember} isLoggedIn={isLoggedIn} />
            )}
            {activeTab === 'watchlist' && (
              <WatchlistTab
                stocks={stocks}
                isMember={isMember}
                isLoggedIn={isLoggedIn}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}
            {activeTab === 'portfolio' && (
              <PortfolioTab holdings={holdings} isMember={isMember} isLoggedIn={isLoggedIn} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ========== RESEARCH TAB ========== */
function ResearchTab({ reports, isMember, isLoggedIn }: { reports: ResearchReport[]; isMember: boolean; isLoggedIn: boolean }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredReports = reports.filter(report => {
    if (searchQuery === '') return true
    return report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.stockSymbol && report.stockSymbol.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  if (reports.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <FileText className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-slate-500 font-semibold text-lg">Belum ada laporan riset</p>
        <p className="text-slate-400 text-sm mt-2">Laporan riset akan segera tersedia</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-main-black">All Research</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-300"
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 whitespace-nowrap hidden sm:block">
            {filteredReports.length} reports
          </p>
        </div>
      </div>

      <motion.div
        className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {filteredReports.map((report) => (
          <motion.div key={report.id} className="relative group" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}>
            {report.restricted ? (
              <LockedCard>
                <div className="p-5 sm:p-6">
                  <p className="font-semibold text-slate-800 line-clamp-2 mb-2">{report.title}</p>
                  <p className="text-sm text-slate-400 line-clamp-2">{report.summary}</p>
                </div>
              </LockedCard>
            ) : (
              <Link href={isLoggedIn ? `/research/${report.slug}` : `/login?redirect=/research/${report.slug}`}>
                <div className="bg-white rounded-[20px] border border-slate-100 hover:border-brand/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 h-full">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      {report.stockSymbol && COIN_LOGOS[report.stockSymbol] ? (
                        <Image src={COIN_LOGOS[report.stockSymbol]} alt={report.stockSymbol} width={36} height={36} className="rounded-full object-contain" />
                      ) : report.stockSymbol ? (
                        <span className="bg-brand/10 text-brand text-xs font-bold px-2.5 py-1 rounded-[8px]">
                          {report.stockSymbol}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Open</span>
                  </div>
                  <p className="font-bold text-main-black line-clamp-2 mb-2">{report.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-5 font-light">{report.summary}</p>
                  {report.publishedAt && (
                    <p className="text-xs text-slate-400">
                      {new Date(report.publishedAt).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </Link>
            )}
          </motion.div>
        ))}
      </motion.div>

      {!isMember && (
        <UpgradeBanner
          title="Unlock All Research Reports"
          description="Become a member to access all premium stock analysis reports"
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  )
}

/* ========== WATCHLIST TAB ========== */
function WatchlistTab({
  stocks, isMember, isLoggedIn, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
}: {
  stocks: WatchlistStock[]; isMember: boolean; isLoggedIn: boolean
  searchQuery: string; setSearchQuery: (v: string) => void
  selectedCategory: string; setSelectedCategory: (v: string) => void
}) {
  const categories = ['all', ...new Set(stocks.filter(s => !s.restricted).map(s => s.category))]

  const filteredStocks = stocks.filter(stock => {
    if (stock.restricted) return true
    const matchesCategory = selectedCategory === 'all' || stock.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      stock.stockSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.stockName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (stocks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <BarChart3 className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-slate-500 font-semibold text-lg">No watchlist yet</p>
        <p className="text-slate-400 text-sm mt-2">Watchlist stocks will be available soon</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-main-black">All Watchlist</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Showing {stocks.filter(s => !s.restricted).length} of {stocks.length} stocks
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3 mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock name or ticker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-300"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <motion.div
        className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {filteredStocks.map((stock) => (
          <motion.div key={stock.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}>
            {stock.restricted ? (
              <LockedCard>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-[12px] bg-slate-200" />
                    <div>
                      <div className="h-4 bg-slate-200 rounded-md w-16 mb-1.5" />
                      <div className="h-3 bg-slate-100 rounded-md w-24" />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-3 bg-slate-200 rounded-md w-full" />
                    <div className="h-3 bg-slate-200 rounded-md w-3/4" />
                  </div>
                </div>
              </LockedCard>
            ) : (
              <div className="bg-white rounded-[20px] border border-slate-100 p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div className="flex items-center gap-3">
                    {stock.logoUrl ? (
                      <Image src={stock.logoUrl} alt={stock.stockName} width={44} height={44} className="rounded-[12px]" />
                    ) : COIN_LOGOS[stock.stockSymbol] ? (
                      <Image src={COIN_LOGOS[stock.stockSymbol]} alt={stock.stockSymbol} width={44} height={44} className="rounded-[12px] object-contain" />
                    ) : (
                      <div className="w-11 h-11 rounded-[12px] bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">
                        {stock.stockSymbol.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-main-black">{stock.stockSymbol}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 font-light">{stock.stockName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                    {CATEGORY_LABELS[stock.category] || stock.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  {stock.entryPrice !== null && (
                    <div className="bg-slate-50 rounded-[10px] p-3">
                      <p className="text-slate-400 text-xs mb-0.5">Entry Price</p>
                      <p className="font-bold text-main-black">${stock.entryPrice.toLocaleString('en-US')}</p>
                    </div>
                  )}
                  {stock.targetPrice !== null && (
                    <div className="bg-emerald-50 rounded-[10px] p-3">
                      <p className="text-slate-400 text-xs mb-0.5">Target Price</p>
                      <p className="font-bold text-emerald-600">${stock.targetPrice.toLocaleString('en-US')}</p>
                    </div>
                  )}
                  {stock.currentPrice !== null && (
                    <div className="bg-slate-50 rounded-[10px] p-3">
                      <p className="text-slate-400 text-xs mb-0.5">Current Price</p>
                      <p className="font-bold text-main-black">${stock.currentPrice.toLocaleString('en-US')}</p>
                    </div>
                  )}
                  {stock.stopLoss !== null && (
                    <div className="bg-red-50 rounded-[10px] p-3">
                      <p className="text-slate-400 text-xs mb-0.5">Stop Loss</p>
                      <p className="font-bold text-red-500">${stock.stopLoss.toLocaleString('en-US')}</p>
                    </div>
                  )}
                </div>

                {stock.analystRating && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <RatingBadge rating={stock.analystRating} />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {!isMember && (
        <UpgradeBanner
          title="View All Watchlist"
          description="Become a member to see all stock recommendations"
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  )
}

/* ========== PORTFOLIO TAB ========== */
const RESTRICTED_COLORS = ['#475569', '#556578', '#3d4d5c', '#5e7282', '#4a5e6d']

function PortfolioTab({ holdings, isMember, isLoggedIn }: { holdings: PortfolioHolding[]; isMember: boolean; isLoggedIn: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (holdings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <Briefcase className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-slate-500 font-semibold text-lg">No portfolio data yet</p>
        <p className="text-slate-400 text-sm mt-2">Portfolio data will be available soon</p>
      </div>
    )
  }

  const visibleHoldings = holdings.filter(h => !h.restricted)

  function getHoldingColor(holding: PortfolioHolding, index: number) {
    if (holding.restricted) {
      let restrictedIdx = 0
      for (let i = 0; i < index; i++) {
        if (holdings[i].restricted) restrictedIdx++
      }
      return RESTRICTED_COLORS[restrictedIdx % RESTRICTED_COLORS.length]
    }
    let visibleIdx = 0
    for (let i = 0; i < index; i++) {
      if (!holdings[i].restricted) visibleIdx++
    }
    return ALLOCATION_COLORS[visibleIdx % ALLOCATION_COLORS.length]
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-main-black">Stockus Portfolio</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Showing {visibleHoldings.length} of {holdings.length} stocks
        </p>
      </div>

      {/* Portfolio Allocation Chart — on top */}
      {holdings.length > 0 && (
        <div className="bg-main-black rounded-[20px] sm:rounded-[30px] p-6 sm:p-8 md:p-10 mb-8 sm:mb-10 relative overflow-hidden">
          {/* Isometric grid mesh background — fills bottom of card */}
          <IsometricGridBackground />

          <h3 className="text-white font-bold text-lg sm:text-xl mb-6 sm:mb-8 relative z-10">Portfolio Allocation</h3>
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-10 relative z-10">
            {/* 3D Donut Chart */}
            <div className="relative w-72 h-56 sm:w-80 sm:h-64 md:w-[400px] md:h-72">
              <DonutChart3D holdings={holdings} getColor={getHoldingColor} hoveredIdx={hoveredIdx} onHover={setHoveredIdx} />
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1 sm:space-y-1.5 w-full">
              {holdings.map((holding, idx) => {
                const color = getHoldingColor(holding, idx)
                const isHovered = hoveredIdx === idx
                return (
                  <div
                    key={holding.id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 -mx-3 transition-all duration-200 cursor-pointer ${
                      isHovered ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-[4px] flex-shrink-0 transition-transform duration-200"
                      style={{ backgroundColor: color, transform: isHovered ? 'scale(1.3)' : 'scale(1)' }}
                    />
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {holding.restricted ? (
                        <div className="w-6 h-6 rounded-[6px] bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-3 h-3 text-slate-400" />
                        </div>
                      ) : holding.logoUrl ? (
                        <Image src={holding.logoUrl} alt={holding.stockName} width={24} height={24} className="rounded-[6px]" />
                      ) : COIN_LOGOS[holding.stockSymbol] ? (
                        <Image src={COIN_LOGOS[holding.stockSymbol]} alt={holding.stockSymbol} width={24} height={24} className="rounded-[6px] object-contain" />
                      ) : (
                        <div className="w-6 h-6 rounded-[6px] bg-white/10 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                          {holding.stockSymbol.slice(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {holding.restricted ? (
                          <>
                            <span className="text-slate-400 text-sm font-semibold">????</span>
                            <span className="text-slate-500 text-xs ml-2 hidden sm:inline font-light">Members Only</span>
                          </>
                        ) : (
                          <>
                            <span className="text-white text-sm font-semibold">{holding.stockSymbol}</span>
                            <span className="text-slate-400 text-xs ml-2 hidden sm:inline font-light">{holding.stockName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`font-bold text-sm flex-shrink-0 transition-colors duration-200 ${isHovered ? 'text-white' : 'text-brand'}`}>
                      {holding.allocationPercent}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto mb-10">
        <table className="w-full">
          <thead>
            <tr className="bg-main-black text-white text-sm">
              <th className="text-left py-4 px-5 rounded-l-[12px] font-semibold">Stocks</th>
              <th className="text-right py-4 px-5 font-semibold">Avg Buy</th>
              <th className="text-right py-4 px-5 font-semibold">Current</th>
              <th className="text-right py-4 px-5 font-semibold">Return</th>
              <th className="text-right py-4 px-5 rounded-r-[12px] font-semibold">Allocation</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              if (holding.restricted) {
                return (
                  <tr key={holding.id} className="border-b border-slate-100">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-slate-200 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 text-sm">????</p>
                          <p className="text-xs text-slate-300 font-light">Members Only</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-5 text-sm text-slate-300">—</td>
                    <td className="text-right py-4 px-5 text-sm text-slate-300">—</td>
                    <td className="text-right py-4 px-5 text-sm text-slate-300">—</td>
                    <td className="text-right py-4 px-5 text-sm font-semibold text-main-black">
                      {holding.allocationPercent}%
                    </td>
                  </tr>
                )
              }

              const avgBuy = parseFloat(holding.avgBuyPrice || '0')
              const current = parseFloat(holding.currentPrice || '0')
              const returnPct = avgBuy > 0 ? ((current - avgBuy) / avgBuy * 100) : 0
              const isPositive = returnPct >= 0

              return (
                <tr key={holding.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {holding.logoUrl ? (
                        <Image src={holding.logoUrl} alt={holding.stockName} width={36} height={36} className="rounded-[10px]" />
                      ) : COIN_LOGOS[holding.stockSymbol] ? (
                        <Image src={COIN_LOGOS[holding.stockSymbol]} alt={holding.stockSymbol} width={36} height={36} className="rounded-[10px] object-contain" />
                      ) : (
                        <div className="w-9 h-9 rounded-[10px] bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                          {holding.stockSymbol.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-main-black text-sm">{holding.stockSymbol}</p>
                        <p className="text-xs text-slate-400 font-light">{holding.stockName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-5 text-sm text-slate-600">
                    ${avgBuy.toLocaleString('en-US')}
                  </td>
                  <td className="text-right py-4 px-5 text-sm text-slate-600">
                    ${current.toLocaleString('en-US')}
                  </td>
                  <td className="text-right py-4 px-5">
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    </span>
                  </td>
                  <td className="text-right py-4 px-5 text-sm font-semibold text-main-black">
                    {holding.allocationPercent}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3 mb-8">
        {holdings.map((holding) => {
          if (holding.restricted) {
            return (
              <div key={holding.id} className="bg-white rounded-[16px] border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] bg-slate-200 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-400 text-sm">????</p>
                      <p className="text-xs text-slate-300 font-light">Members Only</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-[8px] p-2.5">
                    <p className="text-slate-400 mb-0.5">Avg Buy</p>
                    <p className="font-bold text-slate-300">—</p>
                  </div>
                  <div className="bg-slate-50 rounded-[8px] p-2.5">
                    <p className="text-slate-400 mb-0.5">Current</p>
                    <p className="font-bold text-slate-300">—</p>
                  </div>
                  <div className="bg-slate-50 rounded-[8px] p-2.5 text-right">
                    <p className="text-slate-400 mb-0.5">Allocation</p>
                    <p className="font-bold text-main-black">{holding.allocationPercent}%</p>
                  </div>
                </div>
              </div>
            )
          }

          const avgBuy = parseFloat(holding.avgBuyPrice || '0')
          const current = parseFloat(holding.currentPrice || '0')
          const returnPct = avgBuy > 0 ? ((current - avgBuy) / avgBuy * 100) : 0
          const isPositive = returnPct >= 0

          return (
            <div key={holding.id} className="bg-white rounded-[16px] border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {holding.logoUrl ? (
                    <Image src={holding.logoUrl} alt={holding.stockName} width={36} height={36} className="rounded-[10px]" />
                  ) : COIN_LOGOS[holding.stockSymbol] ? (
                    <Image src={COIN_LOGOS[holding.stockSymbol]} alt={holding.stockSymbol} width={36} height={36} className="rounded-[10px] object-contain" />
                  ) : (
                    <div className="w-9 h-9 rounded-[10px] bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                      {holding.stockSymbol.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-main-black text-sm">{holding.stockSymbol}</p>
                    <p className="text-xs text-slate-400 font-light">{holding.stockName}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 rounded-[8px] p-2.5">
                  <p className="text-slate-400 mb-0.5">Avg Buy</p>
                  <p className="font-bold text-main-black">${avgBuy.toLocaleString('en-US')}</p>
                </div>
                <div className="bg-slate-50 rounded-[8px] p-2.5">
                  <p className="text-slate-400 mb-0.5">Current</p>
                  <p className="font-bold text-main-black">${current.toLocaleString('en-US')}</p>
                </div>
                <div className="bg-slate-50 rounded-[8px] p-2.5 text-right">
                  <p className="text-slate-400 mb-0.5">Allocation</p>
                  <p className="font-bold text-main-black">{holding.allocationPercent}%</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!isMember && (
        <UpgradeBanner
          title="View Full Portfolio"
          description="Become a member to see all holdings and Stockus portfolio allocation"
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  )
}

/* ========== SHARED COMPONENTS ========== */

function LockedCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[20px] border border-slate-100 overflow-hidden h-full">
      <div className="blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2.5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand/10 flex items-center justify-center">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">Locked</p>
      </div>
    </div>
  )
}

function UpgradeBanner({ title, description, isLoggedIn }: { title: string; description: string; isLoggedIn: boolean }) {
  return (
    <div className="mt-8 sm:mt-10 bg-brand rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8 relative overflow-hidden">
      {/* SVG dot pattern background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
        <pattern id="dotPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.15" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
      </svg>

      {/* Stockus logo card — tilted */}
      <div className="relative flex-shrink-0 hidden sm:block">
        <div className="w-24 h-28 bg-white rounded-[14px] shadow-xl flex items-center justify-center transform -rotate-6 border-4 border-brand/30">
          <Image src="/stockus_black.png" alt="Stockus" width={56} height={56} className="object-contain" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center sm:text-left relative flex-1 min-w-0">
        <h3 className="text-white font-bold text-lg sm:text-xl">{title}</h3>
        <p className="text-white/70 text-xs sm:text-sm mt-1.5 font-light">{description}</p>
      </div>

      {/* CTA button */}
      <Link
        href={isLoggedIn ? '/pricing' : '/signup'}
        className="relative flex items-center gap-2 bg-white/0 border-2 border-white text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full hover:bg-white hover:text-brand transition-all duration-300 text-sm whitespace-nowrap"
      >
        {isLoggedIn ? 'Upgrade Now' : 'Join Member'}
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </div>
  )
}

function RatingBadge({ rating }: { rating: string }) {
  const lowerRating = rating.toLowerCase()
  const isPositive = lowerRating.includes('buy') || lowerRating.includes('strong')
  const isNeutral = lowerRating.includes('hold') || lowerRating.includes('neutral')

  let colorClass = 'bg-emerald-50 text-emerald-700'
  if (isNeutral) colorClass = 'bg-amber-50 text-amber-700'
  if (!isPositive && !isNeutral) colorClass = 'bg-red-50 text-red-700'

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${colorClass}`}>
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {!isPositive && !isNeutral && <TrendingDown className="w-3 h-3" />}
      {rating}
    </span>
  )
}

function IsometricGridBackground() {
  // Use a large viewBox so lines cover the entire card
  const vw = 2000, vh = 1000
  const spacing = 32
  const lines: string[] = []

  for (let i = -80; i <= 80; i++) {
    const x = vw / 2 + i * spacing
    lines.push(`M${x - vh * 1.2},0 L${x + vh * 1.2},${vh}`)
    lines.push(`M${x + vh * 1.2},0 L${x - vh * 1.2},${vh}`)
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
      style={{ opacity: 0.08 }}
    >
      <defs>
        {/* Vertical fade: hidden at top, visible from middle down */}
        <linearGradient id="meshFadeV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="20%" stopColor="white" stopOpacity="0.2" />
          <stop offset="45%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="white" stopOpacity="0.5" />
        </linearGradient>
        {/* Horizontal fade: full on left, fades out on right half */}
        <linearGradient id="meshFadeH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="40%" stopColor="white" stopOpacity="1" />
          <stop offset="70%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="meshMaskV">
          <rect width={vw} height={vh} fill="url(#meshFadeV)" />
        </mask>
        <mask id="meshMaskH">
          <rect width={vw} height={vh} fill="url(#meshFadeH)" />
        </mask>
      </defs>
      <g mask="url(#meshMaskV)">
        <g mask="url(#meshMaskH)">
          {lines.map((d, i) => (
            <path key={i} d={d} stroke="white" strokeWidth="1.2" fill="none" />
          ))}
        </g>
      </g>
    </svg>
  )
}

function DonutChart3D({
  holdings, getColor, hoveredIdx, onHover,
}: {
  holdings: PortfolioHolding[]
  getColor: (h: PortfolioHolding, i: number) => string
  hoveredIdx: number | null
  onHover: (idx: number | null) => void
}) {
  const total = holdings.reduce((sum, h) => sum + parseFloat(h.allocationPercent || '0'), 0)

  const cx = 200, cy = 115
  const rx = 148, ry = 76
  const irx = 74, iry = 38
  const depth = 52

  // Side wall layers — [yOffsetStart, yOffsetEnd, darkenAmount]
  // Simulates a rounded torus cross-section with highlight band in the middle
  const BANDS: [number, number, number][] = [
    [0, depth * 0.15, 35],     // top lip — slightly dark
    [depth * 0.15, depth * 0.35, 28],  // upper curve — lighter
    [depth * 0.35, depth * 0.55, 22],  // middle — lightest (highlight band)
    [depth * 0.55, depth * 0.75, 35],  // lower curve — darkening
    [depth * 0.75, depth, 55],         // bottom lip — darkest
  ]

  let cumAngle = -Math.PI / 2
  const segments = holdings.map((h, i) => {
    const frac = total > 0 ? parseFloat(h.allocationPercent || '0') / total : 0
    const start = cumAngle
    const sweep = frac * Math.PI * 2
    cumAngle += sweep
    return { start, end: start + sweep, color: getColor(h, i), idx: i }
  })

  function darken(hex: string, amt: number): string {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt)
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt)
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  function lighten(hex: string, amt: number): string {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt)
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt)
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  function ep(r: number, ery: number, a: number, dy = 0): string {
    return `${cx + r * Math.cos(a)},${cy + ery * Math.sin(a) + dy}`
  }

  function ringPath(s: number, e: number, oR: number, oRy: number, iR: number, iRy: number, dy = 0): string {
    const large = e - s > Math.PI ? 1 : 0
    return `M${ep(oR, oRy, s, dy)} A${oR},${oRy} 0 ${large} 1 ${ep(oR, oRy, e, dy)} L${ep(iR, iRy, e, dy)} A${iR},${iRy} 0 ${large} 0 ${ep(iR, iRy, s, dy)} Z`
  }

  // Outer side wall band — front-facing only
  function outerBandPath(s: number, e: number, yTop: number, yBot: number): string | null {
    const cs = Math.max(s, 0), ce = Math.min(e, Math.PI)
    if (cs >= ce) return null
    const large = ce - cs > Math.PI ? 1 : 0
    return `M${ep(rx, ry, cs, yTop)} A${rx},${ry} 0 ${large} 1 ${ep(rx, ry, ce, yTop)} L${ep(rx, ry, ce, yBot)} A${rx},${ry} 0 ${large} 0 ${ep(rx, ry, cs, yBot)} Z`
  }

  // Inner side wall — back-facing portion visible through hole
  function innerWallPath(s: number, e: number, yTop: number, yBot: number): string | null {
    const ranges: [number, number][] = [[-Math.PI / 2, 0], [Math.PI, 3 * Math.PI / 2]]
    const paths: string[] = []
    for (const [rs, re] of ranges) {
      const cs = Math.max(s, rs), ce = Math.min(e, re)
      if (cs >= ce) continue
      const large = ce - cs > Math.PI ? 1 : 0
      paths.push(`M${ep(irx, iry, cs, yTop)} A${irx},${iry} 0 ${large} 1 ${ep(irx, iry, ce, yTop)} L${ep(irx, iry, ce, yBot)} A${irx},${iry} 0 ${large} 0 ${ep(irx, iry, cs, yBot)} Z`)
    }
    return paths.length > 0 ? paths.join(' ') : null
  }

  function hoverOffset(seg: typeof segments[0]): string {
    if (hoveredIdx !== seg.idx) return ''
    const mid = (seg.start + seg.end) / 2
    const d = 8
    return `translate(${d * Math.cos(mid)},${d * Math.sin(mid) * (ry / rx)})`
  }

  return (
    <svg viewBox="-50 0 500 320" className="w-full h-full">
      <defs>
        <filter id="donutShadow"><feGaussianBlur in="SourceGraphic" stdDeviation="10" /></filter>
      </defs>

      {/* Shadow */}
      <ellipse cx={cx} cy={cy + depth + 20} rx={rx * 0.85} ry={ry * 0.5} fill="black" opacity="0.3" filter="url(#donutShadow)" />

      {/* Bottom ring */}
      {segments.map(seg => (
        <path key={`b-${seg.idx}`} d={ringPath(seg.start, seg.end, rx, ry, irx, iry, depth)} fill={darken(seg.color, 70)} transform={hoverOffset(seg)} className="transition-transform duration-200" />
      ))}

      {/* Inner side walls — layered bands */}
      {BANDS.map(([yTop, yBot, darkAmt], bIdx) =>
        segments.map(seg => {
          const p = innerWallPath(seg.start, seg.end, yTop, yBot)
          if (!p) return null
          return <path key={`iw-${seg.idx}-${bIdx}`} d={p} fill={darken(seg.color, darkAmt + 15)} transform={hoverOffset(seg)} className="transition-transform duration-200" />
        })
      )}

      {/* Outer side walls — layered bands for rounded look */}
      {BANDS.map(([yTop, yBot, darkAmt], bIdx) =>
        segments.map(seg => {
          const p = outerBandPath(seg.start, seg.end, yTop, yBot)
          if (!p) return null
          const hovered = hoveredIdx === seg.idx
          const baseDark = hovered ? Math.max(0, darkAmt - 15) : darkAmt
          return (
            <path
              key={`ow-${seg.idx}-${bIdx}`}
              d={p}
              fill={darken(seg.color, baseDark)}
              transform={hoverOffset(seg)}
              onMouseEnter={() => onHover(seg.idx)}
              onMouseLeave={() => onHover(null)}
              className="transition-all duration-200 cursor-pointer"
            />
          )
        })
      )}

      {/* Top ring faces */}
      {segments.map(seg => {
        const hovered = hoveredIdx === seg.idx
        return (
          <path
            key={`t-${seg.idx}`}
            d={ringPath(seg.start, seg.end, rx, ry, irx, iry, 0)}
            fill={hovered ? lighten(seg.color, 25) : seg.color}
            stroke={hovered ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}
            strokeWidth={hovered ? 2 : 0.5}
            transform={hoverOffset(seg)}
            onMouseEnter={() => onHover(seg.idx)}
            onMouseLeave={() => onHover(null)}
            className="transition-all duration-200 cursor-pointer"
          />
        )
      })}
    </svg>
  )
}
