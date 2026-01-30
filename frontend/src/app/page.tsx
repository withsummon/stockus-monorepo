import { Hero } from '@/components/sections/Hero'
import { CoursesShowcase } from '@/components/sections/CoursesShowcase'
import { CommunityFeatures } from '@/components/sections/CommunityFeatures'
import { WhatPeopleSay } from '@/components/sections/WhatPeopleSay'
import { WhosBehind } from '@/components/sections/WhosBehind'
import { JoinMembership } from '@/components/sections/JoinMembership'
import { FAQ } from '@/components/sections/FAQ'
import { fetchAPI } from '@/lib/api'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'
import type { Course } from '@/types'
import { TrustedBy } from '@/components/sections/TrustedBy'
import { WhyIndonesian } from '@/components/sections/WhyIndonesian'
import { IsRightForU } from '@/components/sections/IsRightForU'
import { Fundamentals } from '@/components/sections/fundamentals'
import { WhatYouGet } from '@/components/sections/WhatYouGet'
import { Community } from '@/components/sections/Community'

async function getCourses(): Promise<Course[]> {
  try {
    const data = await fetchAPI<{ courses: Course[] }>('/courses', {
      revalidate: 300, // Cache for 5 minutes
    })
    return data.courses
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    return []
  }
}

export default async function HomePage() {
  const courses = await getCourses()

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/stockus_id',
      'https://linkedin.com/company/stockus',
      'https://instagram.com/stockus_id',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@stockus.id',
      availableLanguage: ['Indonesian', 'English'],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Hero />
      <TrustedBy />
      <IsRightForU />
      <WhyIndonesian />
      <Fundamentals />
      <WhatYouGet />
      <Community />
      <CommunityFeatures />
      <WhatPeopleSay />
      <WhosBehind />
      <JoinMembership />
      <CoursesShowcase courses={courses} />
      <FAQ />
    </>
  )
}
