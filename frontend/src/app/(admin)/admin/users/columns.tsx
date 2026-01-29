'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { AdminUser } from '@/lib/api/admin'

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'tier',
    header: 'Tier',
    cell: ({ row }) => (
      <Badge variant={row.original.tier === 'member' ? 'default' : 'secondary'}>
        {row.original.tier === 'member' ? 'Member' : 'Free'}
      </Badge>
    ),
  },
  {
    accessorKey: 'isVerified',
    header: 'Verified',
    cell: ({ row }) => (
      row.original.isVerified ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )
    ),
  },
  {
    accessorKey: 'subscriptionStatus',
    header: 'Subscription',
    cell: ({ row }) => {
      const status = row.original.subscriptionStatus
      if (!status) return <span className="text-muted-foreground">None</span>

      const variant = status === 'active' ? 'default' : status === 'expired' ? 'destructive' : 'secondary'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: idLocale }),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/users/${row.original.id}`}>
          <Eye className="h-4 w-4 mr-2" />
          View
        </Link>
      </Button>
    ),
  },
]
