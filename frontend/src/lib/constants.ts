export const SITE_NAME = 'StockUs'
export const SITE_DESCRIPTION = 'Learn structured approaches to global equity investing through cohort-based courses, research, and professional community.'
export const SITE_URL = 'https://stockus.id'

export const MEMBERSHIP_PRICE = 2500000 // IDR
export const MEMBERSHIP_PRICE_FORMATTED = 'Rp 2.500.000'

// Colors (also defined in globals.css as Tailwind CSS variables)
export const COLORS = {
  primary: '#F96E00', // Primary Orange - use `text-brand` or `bg-brand` in Tailwind
} as const

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/research', label: 'Research' },
  { href: '/community', label: 'Community' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
]
