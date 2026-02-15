import { db } from './index.js'
import {
  users,
  admins,
  courses,
  courseSessions,
  researchReports,
  templates,
  promoCodes,
  cohorts,
  cohortSessions,
  referrals,
  watchlistStocks,
  portfolioHoldings,
} from './schema/index.js'
import { ulid } from 'ulid'
import argon2 from 'argon2'

async function seed() {
  console.log('Starting database seed...')

  // Create admin user
  const adminPasswordHash = await argon2.hash('admin123')
  const adminUserId = ulid()

  await db.insert(users).values({
    id: adminUserId,
    email: 'admin@stockus.id',
    name: 'Admin StockUs',
    passwordHash: adminPasswordHash,
    isVerified: true,
    tier: 'member',
  }).onConflictDoNothing()

  await db.insert(admins).values({
    userId: adminUserId,
  }).onConflictDoNothing()

  console.log('Admin created: admin@stockus.id / admin123')

  // Create sample member user
  const memberPasswordHash = await argon2.hash('member123')
  const memberUserId = ulid()

  await db.insert(users).values({
    id: memberUserId,
    email: 'member@stockus.id',
    name: 'Member Demo',
    passwordHash: memberPasswordHash,
    isVerified: true,
    tier: 'member',
  }).onConflictDoNothing()

  console.log('Member created: member@stockus.id / member123')

  // Create sample free user
  const freePasswordHash = await argon2.hash('free123')
  const freeUserId = ulid()

  await db.insert(users).values({
    id: freeUserId,
    email: 'free@stockus.id',
    name: 'Free User Demo',
    passwordHash: freePasswordHash,
    isVerified: true,
    tier: 'free',
  }).onConflictDoNothing()

  console.log('Free user created: free@stockus.id / free123')

  // Create courses
  const course1Id = ulid()
  const course2Id = ulid()
  const course3Id = ulid()

  await db.insert(courses).values([
    {
      id: course1Id,
      title: 'Fundamental Analysis Mastery',
      slug: 'fundamental-analysis-mastery',
      description: 'Pelajari cara menganalisis laporan keuangan perusahaan dan menemukan saham undervalued.',
      content: `<h2>Selamat datang di kursus Fundamental Analysis</h2>
<p>Dalam kursus ini, Anda akan mempelajari:</p>
<ul>
  <li>Membaca laporan keuangan</li>
  <li>Rasio-rasio penting (PE, PBV, ROE)</li>
  <li>Valuasi saham</li>
  <li>Competitive moat analysis</li>
</ul>`,
      thumbnailUrl: 'https://placehold.co/600x400/1f2937/ffffff?text=Fundamental+Analysis',
      status: 'published',
      isFreePreview: false,
    },
    {
      id: course2Id,
      title: 'Technical Analysis untuk Pemula',
      slug: 'technical-analysis-pemula',
      description: 'Dasar-dasar membaca chart dan pattern untuk timing entry dan exit yang tepat.',
      content: `<h2>Technical Analysis 101</h2>
<p>Topik yang dibahas:</p>
<ul>
  <li>Support dan Resistance</li>
  <li>Trend lines</li>
  <li>Candlestick patterns</li>
  <li>Moving averages</li>
</ul>`,
      thumbnailUrl: 'https://placehold.co/600x400/1f2937/ffffff?text=Technical+Analysis',
      status: 'published',
      isFreePreview: true,
    },
    {
      id: course3Id,
      title: 'Portfolio Management',
      slug: 'portfolio-management',
      description: 'Strategi diversifikasi dan manajemen risiko untuk portfolio saham Anda.',
      content: `<h2>Membangun Portfolio yang Sehat</h2>
<p>Yang akan Anda pelajari:</p>
<ul>
  <li>Asset allocation</li>
  <li>Position sizing</li>
  <li>Risk management</li>
  <li>Rebalancing strategies</li>
</ul>`,
      thumbnailUrl: 'https://placehold.co/600x400/1f2937/ffffff?text=Portfolio+Management',
      status: 'published',
      isFreePreview: false,
    },
  ]).onConflictDoNothing()

  console.log('Courses created')

  // Create course sessions
  await db.insert(courseSessions).values([
    // Fundamental Analysis sessions
    { courseId: course1Id, title: 'Pengenalan Analisis Fundamental', description: 'Memahami apa itu analisis fundamental', sessionOrder: 1, durationMinutes: 45 },
    { courseId: course1Id, title: 'Membaca Laporan Keuangan', description: 'Balance sheet, income statement, cash flow', sessionOrder: 2, durationMinutes: 60 },
    { courseId: course1Id, title: 'Rasio Valuasi', description: 'PE, PBV, EV/EBITDA, dan lainnya', sessionOrder: 3, durationMinutes: 50 },
    { courseId: course1Id, title: 'Studi Kasus: Analisis Saham Blue Chip', description: 'Praktik langsung menganalisis saham', sessionOrder: 4, durationMinutes: 90 },

    // Technical Analysis sessions
    { courseId: course2Id, title: 'Dasar-dasar Chart', description: 'Jenis chart dan cara membacanya', sessionOrder: 1, durationMinutes: 30 },
    { courseId: course2Id, title: 'Support dan Resistance', description: 'Menemukan level kunci', sessionOrder: 2, durationMinutes: 45 },
    { courseId: course2Id, title: 'Candlestick Patterns', description: 'Pattern penting yang harus diketahui', sessionOrder: 3, durationMinutes: 55 },

    // Portfolio Management sessions
    { courseId: course3Id, title: 'Prinsip Diversifikasi', description: 'Kenapa diversifikasi penting', sessionOrder: 1, durationMinutes: 40 },
    { courseId: course3Id, title: 'Position Sizing', description: 'Berapa banyak modal per saham', sessionOrder: 2, durationMinutes: 50 },
    { courseId: course3Id, title: 'Rebalancing Portfolio', description: 'Kapan dan bagaimana rebalancing', sessionOrder: 3, durationMinutes: 45 },
  ]).onConflictDoNothing()

  console.log('Course sessions created')

  // Create research reports (US Stocks)
  await db.insert(researchReports).values([
    {
      title: 'AAPL: Apple Deep Dive Analysis',
      slug: 'aapl-apple-deep-dive',
      summary: 'Comprehensive analysis of Apple Inc - hardware ecosystem, services growth, and AI integration outlook.',
      content: `<h2>Apple Inc (AAPL)</h2>
<p>Apple remains the most valuable company globally with a dominant hardware-software ecosystem.</p>
<h3>Key Financials</h3>
<ul>
  <li>Revenue: $383B (TTM)</li>
  <li>Gross Margin: 46%</li>
  <li>Services Revenue: $96B growing 15% YoY</li>
  <li>Free Cash Flow: $110B</li>
</ul>
<h3>Thesis</h3>
<p>Apple's services segment continues to drive margin expansion while AI features create upgrade cycles.</p>`,
      stockSymbol: 'AAPL',
      stockName: 'Apple Inc',
      analystRating: 'Buy',
      targetPrice: 250,
      status: 'published',
      isFreePreview: true,
    },
    {
      title: 'NVDA: The AI Infrastructure King',
      slug: 'nvda-ai-infrastructure-king',
      summary: 'Why NVIDIA dominates the AI chip market and the sustainability of its growth trajectory.',
      content: `<h2>NVIDIA (NVDA)</h2>
<p>NVIDIA holds 80%+ market share in AI training chips with Blackwell architecture ramping.</p>
<h3>Growth Drivers</h3>
<ul>
  <li>Data center revenue up 200%+ YoY</li>
  <li>Blackwell GPU demand exceeding supply</li>
  <li>Expanding TAM into sovereign AI</li>
</ul>`,
      stockSymbol: 'NVDA',
      stockName: 'NVIDIA Corp',
      analystRating: 'Strong Buy',
      targetPrice: 180,
      status: 'published',
      isFreePreview: false,
    },
    {
      title: 'MSFT vs GOOGL: Cloud Wars 2026',
      slug: 'msft-vs-googl-cloud-wars',
      summary: 'Head-to-head comparison of Microsoft Azure and Google Cloud in the enterprise AI race.',
      content: `<h2>Cloud Wars: Azure vs GCP</h2>
<p>Microsoft and Google are in a fierce battle for enterprise AI workloads.</p>
<h3>Microsoft (MSFT)</h3>
<ul>
  <li>Azure growing 30%+ YoY</li>
  <li>OpenAI partnership advantage</li>
  <li>Copilot monetization ramping</li>
</ul>
<h3>Alphabet (GOOGL)</h3>
<ul>
  <li>Gemini AI integration across products</li>
  <li>GCP gaining enterprise share</li>
  <li>YouTube ad revenue resilient</li>
</ul>`,
      stockSymbol: 'MSFT',
      stockName: 'Microsoft Corp',
      analystRating: 'Buy',
      targetPrice: 500,
      status: 'published',
      isFreePreview: false,
    },
    {
      title: 'AMZN: Beyond E-commerce',
      slug: 'amzn-beyond-ecommerce',
      summary: 'Amazon\'s transformation from e-commerce to cloud, advertising, and AI powerhouse.',
      content: '<h2>Amazon (AMZN)</h2><p>AWS and advertising are driving margin expansion beyond retail.</p>',
      stockSymbol: 'AMZN',
      stockName: 'Amazon.com Inc',
      analystRating: 'Buy',
      targetPrice: 240,
      status: 'published',
      isFreePreview: false,
    },
    {
      title: 'TSLA: Robotaxi and Energy Storage',
      slug: 'tsla-robotaxi-energy-storage',
      summary: 'Tesla\'s pivot from automaker to autonomous driving and energy infrastructure company.',
      content: '<h2>Tesla (TSLA)</h2><p>FSD progress and Megapack demand reshaping the investment thesis.</p>',
      stockSymbol: 'TSLA',
      stockName: 'Tesla Inc',
      analystRating: 'Hold',
      targetPrice: 350,
      status: 'published',
      isFreePreview: false,
    },
    {
      title: 'META: Social Media to AI Platform',
      slug: 'meta-social-media-ai',
      summary: 'Meta\'s massive AI investment and its impact on ad targeting, Reels monetization, and the metaverse.',
      content: '<h2>Meta Platforms (META)</h2><p>Llama AI models and Reality Labs creating long-term optionality.</p>',
      stockSymbol: 'META',
      stockName: 'Meta Platforms Inc',
      analystRating: 'Buy',
      targetPrice: 680,
      status: 'published',
      isFreePreview: false,
    },
  ]).onConflictDoNothing()

  console.log('Research reports created')

  // Create templates
  await db.insert(templates).values([
    {
      title: 'Stock Screener Template',
      description: 'Template Excel untuk screening saham berdasarkan fundamental.',
      originalFilename: 'stock-screener.xlsx',
      filename: 'stock-screener-template.xlsx',
      filepath: '/templates/stock-screener-template.xlsx',
      fileSize: 125000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      isFreePreview: true,
      uploadedBy: adminUserId,
    },
    {
      title: 'Portfolio Tracker',
      description: 'Track portfolio Anda dengan kalkulasi otomatis profit/loss.',
      originalFilename: 'portfolio-tracker.xlsx',
      filename: 'portfolio-tracker-template.xlsx',
      filepath: '/templates/portfolio-tracker-template.xlsx',
      fileSize: 98000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      isFreePreview: false,
      uploadedBy: adminUserId,
    },
    {
      title: 'DCF Valuation Model',
      description: 'Model Discounted Cash Flow untuk valuasi saham.',
      originalFilename: 'dcf-model.xlsx',
      filename: 'dcf-valuation-model.xlsx',
      filepath: '/templates/dcf-valuation-model.xlsx',
      fileSize: 156000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      isFreePreview: false,
      uploadedBy: adminUserId,
    },
  ]).onConflictDoNothing()

  console.log('Templates created')

  // Create promo codes
  const now = new Date()
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

  await db.insert(promoCodes).values([
    {
      code: 'WELCOME20',
      description: 'Diskon 20% untuk member baru',
      discountPercent: 20,
      maxUses: 100,
      currentUses: 0,
      validFrom: now,
      expiresAt: nextYear,
      isActive: true,
    },
    {
      code: 'EARLYBIRD',
      description: 'Early bird discount 30%',
      discountPercent: 30,
      maxUses: 50,
      currentUses: 0,
      validFrom: now,
      expiresAt: nextYear,
      isActive: true,
    },
    {
      code: 'VIP50',
      description: 'VIP discount 50% (limited)',
      discountPercent: 50,
      maxUses: 10,
      currentUses: 0,
      validFrom: now,
      expiresAt: nextYear,
      isActive: true,
    },
  ]).onConflictDoNothing()

  console.log('Promo codes created')

  // Create cohorts (workshops)
  const cohort1Id = ulid()
  const cohort2Id = ulid()

  const workshopStart = new Date()
  workshopStart.setMonth(workshopStart.getMonth() + 1)

  const workshopEnd = new Date(workshopStart)
  workshopEnd.setDate(workshopEnd.getDate() + 14)

  await db.insert(cohorts).values([
    {
      id: cohort1Id,
      courseId: course1Id,
      name: 'Fundamental Analysis Batch 1',
      startDate: workshopStart,
      endDate: workshopEnd,
      enrollmentOpenDate: now,
      enrollmentCloseDate: workshopStart,
      status: 'open',
      maxParticipants: 30,
      price: 500000, // IDR 500,000
    },
    {
      id: cohort2Id,
      courseId: course2Id,
      name: 'Technical Analysis Batch 1',
      startDate: workshopStart,
      endDate: workshopEnd,
      enrollmentOpenDate: now,
      enrollmentCloseDate: workshopStart,
      status: 'open',
      maxParticipants: 25,
      price: 350000, // IDR 350,000
    },
  ]).onConflictDoNothing()

  console.log('Cohorts (workshops) created')

  // Create cohort sessions
  const session1Date = new Date(workshopStart)
  const session2Date = new Date(workshopStart)
  session2Date.setDate(session2Date.getDate() + 7)

  await db.insert(cohortSessions).values([
    {
      cohortId: cohort1Id,
      title: 'Live Session 1: Intro & Q&A',
      scheduledAt: session1Date,
      zoomLink: 'https://zoom.us/j/example1',
      sessionOrder: 1,
    },
    {
      cohortId: cohort1Id,
      title: 'Live Session 2: Case Study',
      scheduledAt: session2Date,
      zoomLink: 'https://zoom.us/j/example2',
      sessionOrder: 2,
    },
    {
      cohortId: cohort2Id,
      title: 'Live Session 1: Chart Reading',
      scheduledAt: session1Date,
      zoomLink: 'https://zoom.us/j/example3',
      sessionOrder: 1,
    },
    {
      cohortId: cohort2Id,
      title: 'Live Session 2: Live Trading Demo',
      scheduledAt: session2Date,
      zoomLink: 'https://zoom.us/j/example4',
      sessionOrder: 2,
    },
  ]).onConflictDoNothing()

  console.log('Cohort sessions created')

  // Create watchlist stocks (US Stocks)
  await db.insert(watchlistStocks).values([
    {
      stockSymbol: 'NVDA',
      stockName: 'NVIDIA Corp',
      category: 'swing',
      entryPrice: 120,
      targetPrice: 180,
      stopLoss: 105,
      currentPrice: 142,
      analystRating: 'Strong Buy',
      notes: 'AI chip leader, Blackwell ramp',
      sortOrder: 0,
    },
    {
      stockSymbol: 'AAPL',
      stockName: 'Apple Inc',
      category: 'long_term',
      entryPrice: 195,
      targetPrice: 250,
      stopLoss: 180,
      currentPrice: 228,
      analystRating: 'Buy',
      notes: 'Services growth, AI features driving upgrades',
      sortOrder: 1,
    },
    {
      stockSymbol: 'MSFT',
      stockName: 'Microsoft Corp',
      category: 'long_term',
      entryPrice: 380,
      targetPrice: 500,
      stopLoss: 350,
      currentPrice: 425,
      analystRating: 'Buy',
      notes: 'Azure + Copilot monetization',
      sortOrder: 2,
    },
    {
      stockSymbol: 'AMZN',
      stockName: 'Amazon.com Inc',
      category: 'swing',
      entryPrice: 178,
      targetPrice: 240,
      stopLoss: 165,
      currentPrice: 205,
      analystRating: 'Buy',
      notes: 'AWS margin expansion, ad revenue growth',
      sortOrder: 3,
    },
    {
      stockSymbol: 'TSLA',
      stockName: 'Tesla Inc',
      category: 'short_term',
      entryPrice: 280,
      targetPrice: 350,
      stopLoss: 250,
      currentPrice: 310,
      analystRating: 'Hold',
      notes: 'Robotaxi catalyst, energy storage growth',
      sortOrder: 4,
    },
    {
      stockSymbol: 'META',
      stockName: 'Meta Platforms Inc',
      category: 'short_term',
      entryPrice: 520,
      targetPrice: 680,
      stopLoss: 480,
      currentPrice: 590,
      analystRating: 'Buy',
      notes: 'AI-driven ad targeting, Reels monetization',
      sortOrder: 5,
    },
    {
      stockSymbol: 'GOOGL',
      stockName: 'Alphabet Inc',
      category: 'swing',
      entryPrice: 155,
      targetPrice: 200,
      stopLoss: 140,
      currentPrice: 175,
      analystRating: 'Buy',
      notes: 'Search + Cloud + YouTube trifecta',
      sortOrder: 6,
    },
    {
      stockSymbol: 'AVGO',
      stockName: 'Broadcom Inc',
      category: 'long_term',
      entryPrice: 165,
      targetPrice: 220,
      stopLoss: 150,
      currentPrice: 195,
      analystRating: 'Buy',
      notes: 'Custom AI chips, VMware integration',
      sortOrder: 7,
    },
  ]).onConflictDoNothing()

  console.log('Watchlist stocks created')

  // Create portfolio holdings (US Stocks)
  await db.insert(portfolioHoldings).values([
    {
      stockSymbol: 'AAPL',
      stockName: 'Apple Inc',
      avgBuyPrice: '195.00',
      currentPrice: '228.00',
      totalShares: 50,
      allocationPercent: '28.00',
      sortOrder: 0,
    },
    {
      stockSymbol: 'NVDA',
      stockName: 'NVIDIA Corp',
      avgBuyPrice: '120.00',
      currentPrice: '142.00',
      totalShares: 40,
      allocationPercent: '22.00',
      sortOrder: 1,
    },
    {
      stockSymbol: 'MSFT',
      stockName: 'Microsoft Corp',
      avgBuyPrice: '380.00',
      currentPrice: '425.00',
      totalShares: 15,
      allocationPercent: '20.00',
      sortOrder: 2,
    },
    {
      stockSymbol: 'AMZN',
      stockName: 'Amazon.com Inc',
      avgBuyPrice: '178.00',
      currentPrice: '205.00',
      totalShares: 20,
      allocationPercent: '15.00',
      sortOrder: 3,
    },
    {
      stockSymbol: 'META',
      stockName: 'Meta Platforms Inc',
      avgBuyPrice: '520.00',
      currentPrice: '590.00',
      totalShares: 8,
      allocationPercent: '10.00',
      sortOrder: 4,
    },
    {
      stockSymbol: 'GOOGL',
      stockName: 'Alphabet Inc',
      avgBuyPrice: '155.00',
      currentPrice: '175.00',
      totalShares: 15,
      allocationPercent: '5.00',
      sortOrder: 5,
    },
  ]).onConflictDoNothing()

  console.log('Portfolio holdings created')

  // Create referral code for member
  await db.insert(referrals).values({
    userId: memberUserId,
    code: 'MEMBER2026',
    totalUses: 0,
    rewardsEarned: 0,
  }).onConflictDoNothing()

  console.log('Referral code created for member')

  console.log('\n=== Seed completed ===')
  console.log('\nTest accounts:')
  console.log('  Admin:  admin@stockus.id / admin123')
  console.log('  Member: member@stockus.id / member123')
  console.log('  Free:   free@stockus.id / free123')
  console.log('\nPromo codes: WELCOME20, EARLYBIRD, VIP50')
  console.log('Referral code: MEMBER2026')
}

seed()
  .then(() => {
    console.log('\nSeed finished successfully!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
