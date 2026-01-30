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

  // Create research reports
  await db.insert(researchReports).values([
    {
      title: 'Analisis BBCA: Bank Terbesar Indonesia',
      slug: 'analisis-bbca-bank-terbesar',
      summary: 'Review mendalam tentang Bank Central Asia, performa keuangan, dan prospek ke depan.',
      content: `<h2>Bank Central Asia (BBCA)</h2>
<p>BBCA adalah bank swasta terbesar di Indonesia dengan kapitalisasi pasar terbesar di sektor perbankan.</p>
<h3>Highlight Keuangan</h3>
<ul>
  <li>ROE: 20%+</li>
  <li>NIM: 5.5%</li>
  <li>NPL: < 2%</li>
</ul>
<h3>Kesimpulan</h3>
<p>BBCA tetap menjadi pilihan utama untuk investasi jangka panjang di sektor perbankan Indonesia.</p>`,
      stockSymbol: 'BBCA',
      stockName: 'Bank Central Asia Tbk',
      analystRating: 'Buy',
      targetPrice: 10500,
      status: 'published',
      isFreePreview: true,
    },
    {
      title: 'Sektor Consumer: Outlook 2026',
      slug: 'sektor-consumer-outlook-2026',
      summary: 'Analisis sektor consumer goods Indonesia dan rekomendasi saham pilihan.',
      content: `<h2>Sektor Consumer Indonesia</h2>
<p>Sektor consumer goods tetap menarik dengan pertumbuhan kelas menengah Indonesia.</p>
<h3>Saham Pilihan</h3>
<ul>
  <li>UNVR - Market leader FMCG</li>
  <li>ICBP - Dominasi mie instan</li>
  <li>MYOR - Diversifikasi produk</li>
</ul>`,
      status: 'published',
      isFreePreview: false,
    },
    {
      title: 'Tech Stocks: GOTO vs BUKA',
      slug: 'tech-stocks-goto-vs-buka',
      summary: 'Perbandingan dua tech giant Indonesia: GoTo dan Bukalapak.',
      content: `<h2>Pertarungan E-commerce</h2>
<p>Analisis komprehensif antara GOTO dan BUKA dalam persaingan e-commerce Indonesia.</p>
<h3>GOTO</h3>
<ul>
  <li>GMV terbesar</li>
  <li>Ekosistem lengkap (Gojek + Tokopedia)</li>
  <li>Path to profitability lebih jelas</li>
</ul>
<h3>BUKA</h3>
<ul>
  <li>Fokus pada UKM</li>
  <li>Cash position kuat</li>
  <li>Valuasi lebih murah</li>
</ul>`,
      stockSymbol: 'GOTO',
      stockName: 'GoTo Gojek Tokopedia Tbk',
      analystRating: 'Hold',
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
