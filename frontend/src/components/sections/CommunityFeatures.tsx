import React from 'react'
import { Check, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const features = [
  {
    title: 'Member-only discussion channels',
    description: 'Share ideas, ask questions, and learn from others at different stages of their journey',
    isPremium: false,
  },
  {
    title: 'Networking',
    description: 'Connect with investors, founders, and professionals who share an interest in global markets.',
    isPremium: false,
  },
  {
    title: 'Live events & workshops',
    description: 'Regular sessions where we break down earnings, macro events, and individual stocks.',
    isPremium: false,
  },
  {
    title: 'Private Review Session',
    description: 'Get structured feedback on your portfolio framework and positioning.',
    isPremium: true,
  },
  {
    title: 'Guest speakers',
    description: 'Hear from global fund managers and practitioners who manage real portfolios and navigate markets.',
    isPremium: false,
  },
  {
    title: 'AMA & Q&A sessions',
    description: 'Bring your questions about process, mindset, or specific challenges and get them answered live.',
    isPremium: true,
  },
]

export function CommunityFeatures() {
  return (
    <section className="bg-main-black py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto container">
        {/* Header */}
        <div className="text-center space-y-8 mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat text-white">
            Community Features
          </h2>
          <div className="w-full h-[1px] bg-white/20"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 md:gap-y-16">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-6 items-start group">
              <div className={cn(
                "flex-shrink-0 mt-1",
                feature.isPremium ? "text-brand" : "text-white"
              )}>
                <Check className="w-8 h-8 md:w-10 md:h-10 border-2 rounded-full p-1 border-current" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className={cn(
                    "text-xl md:text-2xl font-bold font-montserrat",
                    feature.isPremium ? "text-brand" : "text-white"
                  )}>
                    {feature.title}
                  </h3>
                  {feature.isPremium && (
                    <Crown className="w-5 h-5 text-brand fill-brand" />
                  )}
                </div>
                <p className="text-slate-400 font-montserrat text-base md:text-lg font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Button */}
        <div className="mt-20 md:mt-32 flex justify-center">
          <Button
            variant="outline"
            className="w-full border-brand bg-transparent py-8 text-2xl font-montserrat font-semibold text-brand border-2 rounded-[30px]"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
