import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        {icon || <BookOpen className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
