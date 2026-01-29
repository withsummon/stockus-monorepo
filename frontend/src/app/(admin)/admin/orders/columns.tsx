'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { AdminOrder } from '@/lib/api/admin'

// Status badge variants
function getStatusVariant(status: string) {
  switch (status) {
    case 'settlement':
    case 'capture':
      return 'default' // Success - green/primary
    case 'pending':
      return 'secondary' // Waiting - gray
    case 'deny':
    case 'cancel':
    case 'expire':
      return 'destructive' // Failed - red
    case 'refund':
      return 'outline' // Refunded - outline
    default:
      return 'secondary'
  }
}

// Format amount as IDR
function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const columns: ColumnDef<AdminOrder>[] = [
  {
    accessorKey: 'midtransOrderId',
    header: 'Order ID',
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.midtransOrderId.substring(0, 20)}...
      </span>
    ),
  },
  {
    accessorKey: 'user',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.user.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.user.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.type === 'subscription' ? 'Subscription' : 'Workshop'}
      </Badge>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formatIDR(row.original.amount),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method',
    cell: ({ row }) => row.original.paymentMethod || '-',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy HH:mm', { locale: idLocale }),
  },
]
