import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Portfolio Manager',
    quote:
      'The cohort-based courses gave me a structured approach to analyzing global equities. The community discussions added valuable perspectives I never considered.',
    avatar: '/avatars/budi.jpg',
  },
  {
    name: 'Sarah Wijaya',
    role: 'Independent Investor',
    quote:
      'StockUs research reports are thorough and actionable. The templates save me hours every week. Best investment education platform I've used.',
    avatar: '/avatars/sarah.jpg',
  },
  {
    name: 'Ahmad Rahman',
    role: 'Financial Analyst',
    quote:
      'Being part of this community transformed my investment approach. Learning from experienced investors and peers accelerated my growth significantly.',
    avatar: '/avatars/ahmad.jpg',
  },
]

export function Testimonials() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by Indonesian Investors
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Join hundreds of members who've elevated their investing skills with
            StockUs.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="relative">
              <CardContent className="pt-6">
                <Quote className="mb-4 h-8 w-8 text-blue-600 opacity-50" />
                <p className="text-sm leading-relaxed text-slate-700">
                  "{testimonial.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                    <span className="text-sm font-semibold text-slate-700">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
