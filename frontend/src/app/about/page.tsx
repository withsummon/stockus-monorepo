import { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import Image from 'next/image'

export const metadata: Metadata = {
  title: `About Us | ${SITE_NAME}`,
  description: 'Meet the team behind StockUs and learn about our mission to empower Indonesian investors.',
}

const team = [
  {
    name: 'Jefta Ongkodiputra',
    role: '10+ years experiences as Investment Analyst',
    description: `A seasoned investor with over a decade of experience in hedge funds and global equities. Focused on deep fundamental research and long term quality compounding. 
    
    Coupled with university level teaching experience, Jefta brings a combination of years of real world investing and a way to distill complex information into actionable ideas and skills.`,
    image: '/jo.webp',
    layout: 'text-left'
  },
  {
    name: 'Yosua Kho',
    role: '10+ years experiences as Investment Analyst',
    description: `A seasoned investor with over a decade of experience in hedge funds and global equities. Focused on deep fundamental research and long term quality compounding. 
    
    Coupled with university level teaching experience, Jefta brings a combination of years of real world investing and a way to distill complex information into actionable ideas and skills.`,
    image: '/jo2.webp',
    layout: 'image-left'
  }
]

export default function AboutPage() {
  return (
    <main className="bg-main-white min-h-screen py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {team.map((member, index) => (
          <div
            key={index}
            className="bg-brand rounded-[30px] md:rounded-[40px] p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 shadow-xl"
          >
            {member.layout === 'image-left' ? (
              <>
                {/* Image Section (Desktop: Left) */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="relative w-full aspect-[4/5] rounded-[20px] md:rounded-[30px] overflow-hidden bg-white/10">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                {/* Content Section (Desktop: Right) */}
                <div className="w-full lg:w-1/2 text-white space-y-8">
                  <div className="space-y-4">
                    <span className="text-sm md:text-base font-medium tracking-widest opacity-80 font-montserrat uppercase">
                      GET TO KNOW US
                    </span>
                    <div className="space-y-6">
                      {member.description.split('\n\n').map((para, i) => (
                        <p key={i} className="text-lg md:text-xl font-normal font-montserrat leading-relaxed">
                          {para.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8">
                    <h2 className="text-3xl md:text-3xl font-bold font-montserrat">
                      {member.name}
                    </h2>
                    <p className="text-lg md:text-xl opacity-80 font-montserrat mt-2">
                      {member.role}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Content Section (Desktop: Left) */}
                <div className="w-full lg:w-1/2 text-white space-y-8 order-2 lg:order-1">
                  <div className="space-y-4">
                    <span className="text-sm md:text-base font-medium tracking-widest opacity-80 font-montserrat uppercase">
                      GET TO KNOW US
                    </span>
                    <div className="space-y-6">
                      {member.description.split('\n\n').map((para, i) => (
                        <p key={i} className="text-lg md:text-xl font-normal font-montserrat leading-relaxed">
                          {para.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8">
                    <h2 className="text-3xl md:text-3xl font-bold font-montserrat">
                      {member.name}
                    </h2>
                    <p className="text-lg md:text-xl opacity-80 font-montserrat mt-2">
                      {member.role}
                    </p>
                  </div>
                </div>
                {/* Image Section (Desktop: Right) */}
                <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
                  <div className="relative w-full aspect-[4/5] rounded-[20px] md:rounded-[30px] overflow-hidden bg-white/10">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
