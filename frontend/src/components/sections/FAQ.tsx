'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'

const faqs = [
  {
    question: 'What is included in the membership?',
    answer: `Access to all courses, research reports, investment templates, and community features. You'll also receive priority access to workshops and cohort programs.`,
  },
  {
    question: 'How much does membership cost?',
    answer: `Membership is ${MEMBERSHIP_PRICE_FORMATTED} per year. This one-time payment gives you full access to all platform features for 12 months.`,
  },
  {
    question: 'Are the courses suitable for beginners?',
    answer:
      'Our courses cater to different experience levels. While some foundational knowledge of investing is helpful, we provide resources for beginners and advanced investors alike.',
  },
  {
    question: 'Can I access content from mobile devices?',
    answer:
      'Yes, the platform is fully responsive and works on all devices. You can access courses, research reports, and community discussions from your phone, tablet, or computer.',
  },
  {
    question: 'How often is new research published?',
    answer:
      'We publish new research reports regularly, typically 2-4 times per month. Members receive email notifications when new reports are available.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'We offer a 14-day money-back guarantee. If you're not satisfied with the platform within the first 14 days of membership, contact us for a full refund.',
  },
]

export function FAQ() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to know about StockUs membership.
            </p>
          </div>
          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
