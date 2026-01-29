'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/admin/DataTable'
import { getColumns } from './columns'
import { getAdminResearch, deleteResearch, Research } from '@/lib/api/admin'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export default function ResearchPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<number | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      setLoading(true)
      const data = await getAdminResearch()
      setReports(data)
    } catch (error) {
      console.error('Failed to load research reports:', error)
      toast.error('Failed to load research reports')
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteClick(id: number) {
    setReportToDelete(id)
    setDeleteDialogOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!reportToDelete) return

    try {
      await deleteResearch(reportToDelete)
      toast.success('Research report deleted successfully')
      setDeleteDialogOpen(false)
      setReportToDelete(null)
      // Refresh the list
      await loadReports()
    } catch (error) {
      console.error('Failed to delete research report:', error)
      toast.error('Failed to delete research report')
    }
  }

  const columns = getColumns({ onDelete: handleDeleteClick })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading research reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Research Reports</h1>
          <p className="text-muted-foreground">
            Manage research reports and stock analysis
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/research/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Research
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        searchKey="title"
        searchPlaceholder="Search research reports..."
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Research Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this research report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReportToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
