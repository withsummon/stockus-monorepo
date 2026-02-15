import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResearchTabs } from './ResearchTabs'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

const mockReports = [
  { id: 1, title: 'AAPL Analysis', slug: 'aapl-analysis', summary: 'Apple Inc report', requiredTier: 'free' as const, isFreePreview: true, restricted: false, publishedAt: '2024-01-01', stockSymbol: 'AAPL', stockName: 'Apple Inc' },
  { id: 2, title: 'NVDA Analysis', slug: 'nvda-analysis', summary: 'NVIDIA report', requiredTier: 'member' as const, isFreePreview: false, restricted: true, publishedAt: '2024-01-02', stockSymbol: 'NVDA', stockName: 'NVIDIA Corporation' },
]

const mockStocks = [
  { id: '1', stockSymbol: 'AAPL', stockName: 'Apple Inc', logoUrl: null, category: 'swing' as const, entryPrice: 180, targetPrice: 220, stopLoss: 165, currentPrice: 195, analystRating: 'Buy', notes: null, sortOrder: 0, restricted: false, createdAt: '2024-01-01' },
  { id: '2', stockSymbol: 'NVDA', stockName: 'NVIDIA Corporation', logoUrl: null, category: 'long_term' as const, entryPrice: null, targetPrice: null, stopLoss: null, currentPrice: null, analystRating: null, notes: null, sortOrder: 1, restricted: true, createdAt: '2024-01-01' },
]

const mockHoldings = [
  { id: '1', stockSymbol: 'AAPL', stockName: 'Apple Inc', logoUrl: null, avgBuyPrice: '150', currentPrice: '195', totalShares: 100, allocationPercent: '60', sortOrder: 0, restricted: false, createdAt: '2024-01-01' },
  { id: '2', stockSymbol: 'NVDA', stockName: 'NVIDIA Corporation', logoUrl: null, avgBuyPrice: null, currentPrice: null, totalShares: null, allocationPercent: null, sortOrder: 1, restricted: true, createdAt: '2024-01-01' },
]

describe('ResearchTabs', () => {
  it('renders three tabs', () => {
    render(
      <ResearchTabs reports={mockReports} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={false} isMember={false} />
    )

    expect(screen.getByText('Research')).toBeInTheDocument()
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('shows research tab by default with reports', () => {
    render(
      <ResearchTabs reports={mockReports} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={false} isMember={false} />
    )

    expect(screen.getByText('AAPL Analysis')).toBeInTheDocument()
    expect(screen.getByText('All Research')).toBeInTheDocument()
  })

  it('shows locked state for restricted reports', () => {
    render(
      <ResearchTabs reports={mockReports} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={false} isMember={false} />
    )

    // Should show "Locked" for restricted content
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('switches to watchlist tab when clicked', () => {
    render(
      <ResearchTabs reports={mockReports} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={false} isMember={false} />
    )

    fireEvent.click(screen.getByText('Watchlist'))
    expect(screen.getByText('All Watchlist')).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('switches to portfolio tab when clicked', () => {
    render(
      <ResearchTabs reports={mockReports} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={false} isMember={false} />
    )

    fireEvent.click(screen.getByText('Portfolio'))
    expect(screen.getByText('Stockus Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Allocation')).toBeInTheDocument()
  })

  it('shows upgrade banner for non-members', () => {
    render(
      <ResearchTabs reports={mockReports} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={false} isMember={false} />
    )

    expect(screen.getByText('Join Member')).toBeInTheDocument()
  })

  it('does not show upgrade banner for members', () => {
    render(
      <ResearchTabs reports={mockReports} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={true} isMember={true} />
    )

    expect(screen.queryByText('Upgrade Now')).not.toBeInTheDocument()
    expect(screen.queryByText('Join Member')).not.toBeInTheDocument()
  })

  it('shows empty state when no reports', () => {
    render(
      <ResearchTabs reports={[]} stocks={mockStocks} holdings={mockHoldings} isLoggedIn={false} isMember={false} />
    )

    expect(screen.getByText('Belum ada laporan riset')).toBeInTheDocument()
  })
})
