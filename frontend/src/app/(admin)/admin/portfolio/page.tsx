'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  getAdminPortfolio, createPortfolioHolding, updatePortfolioHolding, deletePortfolioHolding,
  type PortfolioHolding, type PortfolioFormData,
} from '@/lib/api/admin'

const emptyForm: PortfolioFormData = {
  stockSymbol: '',
  stockName: '',
  avgBuyPrice: '',
  currentPrice: '',
  totalShares: 0,
  allocationPercent: '',
  sortOrder: 0,
}

export default function PortfolioAdminPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState<PortfolioFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadHoldings() }, [])

  async function loadHoldings() {
    try {
      setLoading(true)
      setHoldings(await getAdminPortfolio())
    } catch {
      toast.error('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setFormData(emptyForm)
    setEditingId(null)
    setFormOpen(true)
  }

  function openEdit(h: PortfolioHolding) {
    setFormData({
      stockSymbol: h.stockSymbol,
      stockName: h.stockName,
      logoUrl: h.logoUrl || undefined,
      avgBuyPrice: h.avgBuyPrice,
      currentPrice: h.currentPrice,
      totalShares: h.totalShares,
      allocationPercent: h.allocationPercent,
      sortOrder: h.sortOrder,
    })
    setEditingId(h.id)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!formData.stockSymbol || !formData.stockName || !formData.avgBuyPrice || !formData.currentPrice) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      setSaving(true)
      if (editingId) {
        await updatePortfolioHolding(editingId, formData)
        toast.success('Holding updated')
      } else {
        await createPortfolioHolding(formData)
        toast.success('Holding added')
      }
      setFormOpen(false)
      await loadHoldings()
    } catch {
      toast.error('Failed to save holding')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deletePortfolioHolding(deleteId)
      toast.success('Holding deleted')
      setDeleteId(null)
      await loadHoldings()
    } catch {
      toast.error('Failed to delete holding')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading portfolio...</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Manage Stockus portfolio holdings</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Holding
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="p-4">Symbol</th>
              <th className="p-4">Name</th>
              <th className="p-4">Avg Buy</th>
              <th className="p-4">Current</th>
              <th className="p-4">Shares</th>
              <th className="p-4">Allocation</th>
              <th className="p-4">Order</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{h.stockSymbol}</td>
                <td className="p-4">{h.stockName}</td>
                <td className="p-4">Rp {parseFloat(h.avgBuyPrice).toLocaleString('id-ID')}</td>
                <td className="p-4">Rp {parseFloat(h.currentPrice).toLocaleString('id-ID')}</td>
                <td className="p-4">{h.totalShares.toLocaleString()}</td>
                <td className="p-4">{h.allocationPercent}%</td>
                <td className="p-4">{h.sortOrder}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(h)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(h.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {holdings.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No holdings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Holding' : 'Add Holding'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Symbol *</Label>
                <Input value={formData.stockSymbol} onChange={(e) => setFormData({ ...formData, stockSymbol: e.target.value })} placeholder="e.g. BBCA" />
              </div>
              <div>
                <Label>Stock Name *</Label>
                <Input value={formData.stockName} onChange={(e) => setFormData({ ...formData, stockName: e.target.value })} placeholder="e.g. Bank Central Asia" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Avg Buy Price *</Label>
                <Input value={formData.avgBuyPrice} onChange={(e) => setFormData({ ...formData, avgBuyPrice: e.target.value })} placeholder="e.g. 8500" />
              </div>
              <div>
                <Label>Current Price *</Label>
                <Input value={formData.currentPrice} onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })} placeholder="e.g. 9200" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Total Shares *</Label>
                <Input type="number" value={formData.totalShares} onChange={(e) => setFormData({ ...formData, totalShares: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Allocation % *</Label>
                <Input value={formData.allocationPercent} onChange={(e) => setFormData({ ...formData, allocationPercent: e.target.value })} placeholder="e.g. 25.00" />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder ?? 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={formData.logoUrl ?? ''} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value || undefined })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holding</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
