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
  getAdminWatchlist, createWatchlistStock, updateWatchlistStock, deleteWatchlistStock,
  type WatchlistStock, type WatchlistFormData,
} from '@/lib/api/admin'

const CATEGORY_LABELS: Record<string, string> = {
  swing: 'Swing',
  short_term: 'Short Term',
  long_term: 'Long Term',
}

const emptyForm: WatchlistFormData = {
  stockSymbol: '',
  stockName: '',
  category: 'swing',
  sortOrder: 0,
}

export default function WatchlistAdminPage() {
  const [stocks, setStocks] = useState<WatchlistStock[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState<WatchlistFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadStocks() }, [])

  async function loadStocks() {
    try {
      setLoading(true)
      setStocks(await getAdminWatchlist())
    } catch {
      toast.error('Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setFormData(emptyForm)
    setEditingId(null)
    setFormOpen(true)
  }

  function openEdit(stock: WatchlistStock) {
    setFormData({
      stockSymbol: stock.stockSymbol,
      stockName: stock.stockName,
      logoUrl: stock.logoUrl || undefined,
      category: stock.category,
      entryPrice: stock.entryPrice ?? undefined,
      targetPrice: stock.targetPrice ?? undefined,
      stopLoss: stock.stopLoss ?? undefined,
      currentPrice: stock.currentPrice ?? undefined,
      analystRating: stock.analystRating ?? undefined,
      notes: stock.notes ?? undefined,
      sortOrder: stock.sortOrder,
    })
    setEditingId(stock.id)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!formData.stockSymbol || !formData.stockName) {
      toast.error('Stock symbol and name are required')
      return
    }
    try {
      setSaving(true)
      if (editingId) {
        await updateWatchlistStock(editingId, formData)
        toast.success('Stock updated')
      } else {
        await createWatchlistStock(formData)
        toast.success('Stock added')
      }
      setFormOpen(false)
      await loadStocks()
    } catch {
      toast.error('Failed to save stock')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteWatchlistStock(deleteId)
      toast.success('Stock deleted')
      setDeleteId(null)
      await loadStocks()
    } catch {
      toast.error('Failed to delete stock')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading watchlist...</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Watchlist</h1>
          <p className="text-muted-foreground">Manage watchlist stocks</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="p-4">Symbol</th>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Entry</th>
              <th className="p-4">Target</th>
              <th className="p-4">Current</th>
              <th className="p-4">Order</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.id} className="border-b hover:bg-muted/50">
                <td className="p-4 font-medium">{stock.stockSymbol}</td>
                <td className="p-4">{stock.stockName}</td>
                <td className="p-4">{CATEGORY_LABELS[stock.category]}</td>
                <td className="p-4">{stock.entryPrice?.toLocaleString('id-ID') ?? '-'}</td>
                <td className="p-4">{stock.targetPrice?.toLocaleString('id-ID') ?? '-'}</td>
                <td className="p-4">{stock.currentPrice?.toLocaleString('id-ID') ?? '-'}</td>
                <td className="p-4">{stock.sortOrder}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(stock)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(stock.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No stocks yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Stock' : 'Add Stock'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock Symbol *</Label>
                <Input value={formData.stockSymbol} onChange={(e) => setFormData({ ...formData, stockSymbol: e.target.value })} placeholder="e.g. AMMN" />
              </div>
              <div>
                <Label>Stock Name *</Label>
                <Input value={formData.stockName} onChange={(e) => setFormData({ ...formData, stockName: e.target.value })} placeholder="e.g. Amman Mineral" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as WatchlistFormData['category'] })}
                >
                  <option value="swing">Swing</option>
                  <option value="short_term">Short Term</option>
                  <option value="long_term">Long Term</option>
                </select>
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sortOrder ?? 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Entry Price</Label>
                <Input type="number" value={formData.entryPrice ?? ''} onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
              <div>
                <Label>Target Price</Label>
                <Input type="number" value={formData.targetPrice ?? ''} onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
              <div>
                <Label>Stop Loss</Label>
                <Input type="number" value={formData.stopLoss ?? ''} onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Price</Label>
                <Input type="number" value={formData.currentPrice ?? ''} onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
              <div>
                <Label>Analyst Rating</Label>
                <Input value={formData.analystRating ?? ''} onChange={(e) => setFormData({ ...formData, analystRating: e.target.value || undefined })} placeholder="e.g. Buy, Hold, Sell" />
              </div>
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={formData.logoUrl ?? ''} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value || undefined })} placeholder="https://..." />
            </div>
            <div>
              <Label>Notes</Label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                value={formData.notes ?? ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
                placeholder="Optional notes..."
              />
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
            <AlertDialogTitle>Delete Stock</AlertDialogTitle>
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
