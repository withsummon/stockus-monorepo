'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import Link from 'next/link'
import { Research } from '@/lib/api/admin'

interface ColumnsProps {
  onDelete: (id: number) => void
}

export function getColumns({ onDelete }: ColumnsProps): ColumnDef<Research>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'stockSymbol',
      header: 'Stock',
      cell: ({ row }) => row.original.stockSymbol || '-',
    },
    {
      accessorKey: 'analystRating',
      header: 'Rating',
      cell: ({ row }) => {
        const rating = row.original.analystRating
        if (!rating) return '-'

        const variant =
          rating.toLowerCase() === 'buy' ? 'default' :
          rating.toLowerCase() === 'hold' ? 'secondary' :
          rating.toLowerCase() === 'sell' ? 'destructive' :
          'secondary'

        return (
          <Badge variant={variant}>
            {rating}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'isFreePreview',
      header: 'Access',
      cell: ({ row }) => (
        row.original.isFreePreview ? 'Free Preview' : 'Members Only'
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published',
      cell: ({ row }) => {
        const date = row.original.publishedAt
        return date ? new Date(date).toLocaleDateString('id-ID') : '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/research/${row.original.id}`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
