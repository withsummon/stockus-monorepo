import { Metadata } from 'next'
import Image from 'next/image'
import { SITE_NAME } from '@/lib/constants'
import { Image as ImageIcon } from 'lucide-react'
import { OpenCommunity } from '@/components/sections/OpenCommunity'
import { PremiumCommunity } from '@/components/sections/PremiumCommunity'
import { CommunityGuidelines } from '@/components/sections/CommunityGuidelines'

export const metadata: Metadata = {
  title: `Community | ${SITE_NAME}`,
  description: 'Learn together with serious investors who think long-term. No tips, no signals. Just real investing discussions.',
}

const differences = [
  {
    title: "Learn, Don't Speculate",
    description: "Focus on understanding businesses, not chasing prices",
  },
  {
    title: "Think Long-Term",
    description: "Build conviction through research, not momentum",
  },
  {
    title: "Help Each Other",
    description: "Share knowledge and learn from peers",
  },
]

export default function CommunityPage() {
  return (
    <main className="bg-main-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-montserrat text-main-black tracking-tight leading-tight">
            StockUs Community
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 font-montserrat font-light leading-relaxed max-w-3xl mx-auto">
            Learn together with serious investors who think long-term <br className="hidden md:block" />
            No tips, no signals. Just real investing discussions
          </p>
        </div>
      </section>

      {/* Visual Section */}
      <section className="w-full">
        <div className="relative w-full aspect-[21/9] md:aspect-[3/1] lg:aspect-[2.5/1]">
          <Image
            src="/community.jpg"
            alt="StockUs Community"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle blue accent line as per screenshot */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#007AFF]"></div>
        </div>
      </section>

      {/* Difference Section */}
      <section className="bg-brand py-24 md:py-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-normal font-montserrat tracking-tight leading-tight">
              What Makes <span className="font-extrabold">Our Community</span> Different?
            </h2>
            <p className="text-lg md:text-2xl font-montserrat font-light  mx-auto opacity-90 leading-relaxed">
              Most investment groups are filled with "hot stock tips", hype, and noise. <br className="hidden md:block" />
              StockUs community focuses on education, framework, and long-term thinking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {differences.map((diff, index) => (
              <div key={index} className="bg-white rounded-[20px] p-8 flex flex-col items-center text-center space-y-10 shadow-2xl transition-all duration-300 hover:translate-y-[-8px]">
                <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-[30px] flex items-center justify-center overflow-hidden border border-slate-100">
                  <ImageIcon className="w-16 h-16 text-slate-200" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/20 to-transparent"></div>
                </div>
                {/* Spacer as requested */}
                <div className="h-4"></div>
                <div className="space-y-4 pb-4">
                  <h3 className="text-2xl md:text-2xl font-bold font-montserrat text-main-black">
                    {diff.title}
                  </h3>
                  <p className="text-slate-500 font-montserrat text-lg md:text-xl font-light leading-relaxed">
                    {diff.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OpenCommunity />
      <PremiumCommunity />
      <CommunityGuidelines />
    </main>
  )
}
