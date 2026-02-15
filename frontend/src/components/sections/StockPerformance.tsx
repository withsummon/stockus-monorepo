'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const stocks = [
    { ticker: 'V', name: 'Visa Inc.', gain: '+85.0%', buyPrice: '$176.70', currentPrice: '$327.00', icon: '/coin-logo/VISA-coin.png' },
    { ticker: 'FWONK', name: 'Formula One Group', gain: '+171.9%', buyPrice: '$31.50', currentPrice: '$85.80', icon: '/coin-logo/F1-Coin.png' },
    { ticker: 'ADYEN', name: 'Adyen N.V.', gain: '+106.6%', buyPrice: '$646.90', currentPrice: '$1,336.60', icon: '/coin-logo/Adyen-Coin.png' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', gain: '+141.6%', buyPrice: '$199.70', currentPrice: '$482.60', icon: '/coin-logo/Microsoft-Coin.png' },
    { ticker: 'NFLX', name: 'Netflix Inc.', gain: '+117.2%', buyPrice: '$47.50', currentPrice: '$103.20', icon: '/coin-logo/Netflix-Coin.png' },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway', gain: '+291.7%', buyPrice: '$128.50', currentPrice: '$503.20', icon: '/coin-logo/BH-Coin.png' },
]

const VISIBLE_DESKTOP = 3
const totalPages = Math.ceil(stocks.length / VISIBLE_DESKTOP)

function MiniChart({ id }: { id: string }) {
    return (
        <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`chartGradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d="M0,50 Q20,48 35,42 T70,35 T100,25 T130,28 T160,15 T200,8"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
            />
            <path
                d="M0,50 Q20,48 35,42 T70,35 T100,25 T130,28 T160,15 T200,8 V60 H0 Z"
                fill={`url(#chartGradient-${id})`}
            />
        </svg>
    )
}

function StockCard({ stock }: { stock: typeof stocks[0] }) {
    return (
        <div className="relative bg-white rounded-2xl border border-green-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-white z-0" />
            <div className="relative z-10 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-md flex-shrink-0 border border-slate-100">
                        <Image
                            src={stock.icon}
                            alt={stock.ticker}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain p-1"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold font-montserrat text-main-black">{stock.ticker}</span>
                            <span className="text-xl font-bold font-montserrat text-green-500">{stock.gain}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-montserrat truncate">{stock.name}</p>
                    </div>
                </div>
                <div className="h-16">
                    <MiniChart id={stock.ticker} />
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-montserrat">Avg Buy Price</span>
                        <span className="text-sm font-montserrat font-medium text-slate-600">{stock.buyPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-montserrat">Current Price</span>
                        <span className="text-sm font-montserrat font-semibold text-main-black">{stock.currentPrice}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-montserrat">Total Return</span>
                        <div className="flex items-center gap-1.5 text-green-600">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-sm font-montserrat font-bold">{stock.gain}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Build pages: each page is an array of stocks
const pages = Array.from({ length: totalPages }, (_, i) =>
    stocks.slice(i * VISIBLE_DESKTOP, (i + 1) * VISIBLE_DESKTOP)
)

// For infinite loop: [clone-last, ...real pages, clone-first]
// Track layout uses index 0 = clone of last page, 1..N = real, N+1 = clone of first
const trackPages = [pages[pages.length - 1], ...pages, pages[0]]

function PageSlide({ pageStocks, prefix }: { pageStocks: typeof stocks; prefix: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full flex-shrink-0">
            {pageStocks.map((stock) => (
                <StockCard key={`${prefix}-${stock.ticker}`} stock={stock} />
            ))}
        </div>
    )
}

export function StockPerformance() {
    const { t } = useTranslation()
    // trackIndex: 0 = clone-last, 1 = page0, 2 = page1, 3 = clone-first
    const [trackIndex, setTrackIndex] = useState(1)
    const [isTransitioning, setIsTransitioning] = useState(true)
    const trackRef = useRef<HTMLDivElement>(null)

    const realPage = ((trackIndex - 1) % totalPages + totalPages) % totalPages

    const handleTransitionEnd = useCallback(() => {
        // If we landed on a clone, snap to the real page instantly
        if (trackIndex === 0) {
            setIsTransitioning(false)
            setTrackIndex(totalPages) // snap to last real page
            // Force reflow then re-enable transitions
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsTransitioning(true))
            })
        } else if (trackIndex === totalPages + 1) {
            setIsTransitioning(false)
            setTrackIndex(1) // snap to first real page
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsTransitioning(true))
            })
        }
    }, [trackIndex])

    const next = () => setTrackIndex((i) => i + 1)
    const prev = () => setTrackIndex((i) => i - 1)

    const goToPage = (pageIdx: number) => {
        setTrackIndex(pageIdx + 1)
    }

    return (
        <section className="bg-main-black py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16 space-y-4">
                    <ScrollReveal variant="fadeUp">
                        <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-white leading-tight">
                            {t('stockPerformance.title')} <span className="text-brand">{t('stockPerformance.titleHighlight')}</span>
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeUp" delay={0.1}>
                        <p className="text-lg md:text-xl text-white/60 font-montserrat font-light max-w-2xl mx-auto">
                            {t('stockPerformance.subtitle')}
                        </p>
                    </ScrollReveal>
                </div>

                {/* Cards Carousel */}
                <ScrollReveal variant="fadeUp" delay={0.2}>
                    <div className="relative max-w-6xl mx-auto">
                        {/* Nav Buttons */}
                        <button
                            onClick={prev}
                            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-main-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-main-black flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Sliding track */}
                        <div className="overflow-hidden">
                            <div
                                ref={trackRef}
                                className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]' : ''}`}
                                style={{ transform: `translateX(-${trackIndex * 100}%)` }}
                                onTransitionEnd={handleTransitionEnd}
                            >
                                {trackPages.map((pageStocks, idx) => (
                                    <PageSlide key={idx} pageStocks={pageStocks} prefix={`p${idx}`} />
                                ))}
                            </div>
                        </div>

                        {/* Dots indicator */}
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {pages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToPage(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        index === realPage ? 'bg-brand w-6' : 'bg-white/30 w-2'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
