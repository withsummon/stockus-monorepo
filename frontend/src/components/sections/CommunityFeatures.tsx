import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileText, TrendingUp, Users } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Cohort-Based Courses',
    description:
      'Learn with peers in structured programs led by experienced investors. Engage in discussions, case studies, and practical exercises.',
  },
  {
    icon: FileText,
    title: 'Professional Research',
    description:
      'Access in-depth research reports on global equities, sectors, and market trends to inform your investment decisions.',
  },
  {
    icon: Users,
    title: 'Vibrant Community',
    description:
      'Connect with fellow Indonesian investors, share insights, and learn from each other's experiences in a supportive environment.',
  },
  {
    icon: TrendingUp,
    title: 'Investment Templates',
    description:
      'Download practical templates for financial analysis, portfolio tracking, and investment planning to streamline your workflow.',
  },
]

export function CommunityFeatures() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A comprehensive platform for serious investors who want to improve
            their global equity investing skills.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
