'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { format, differenceInDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { getAdminUserDetail, updateUserTier, UserDetail } from '@/lib/api/admin'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = parseInt(params.id as string)

  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [userId])

  async function loadUserData() {
    try {
      setLoading(true)
      const result = await getAdminUserDetail(userId)
      setData(result)
      setSelectedTier(result.user.tier)
    } catch (error) {
      console.error('Failed to load user:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  async function handleTierChange() {
    if (!data || selectedTier === data.user.tier) return

    setSaving(true)
    try {
      await updateUserTier(userId, { tier: selectedTier })
      toast.success('User tier updated successfully')
      // Refresh user data
      await loadUserData()
    } catch (error) {
      console.error('Failed to update tier:', error)
      toast.error('Failed to update user tier')
    } finally {
      setSaving(false)
    }
  }

  function formatIDR(amount: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'settlement':
      case 'capture':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'deny':
      case 'cancel':
      case 'expire':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading user details...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  const { user, subscription, payments } = data
  const tierChanged = selectedTier !== user.tier

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Details</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <div className="flex items-center gap-2">
                {user.isVerified ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span>No</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">
                {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: idLocale })}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">User Tier</p>
            <div className="flex items-center gap-4">
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              {tierChanged && (
                <Button onClick={handleTierChange} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Changing tier to &quot;member&quot; will create a subscription if none exists.
              Changing to &quot;free&quot; will cancel any active subscription.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="font-medium">
                  {subscription.status === 'active'
                    ? differenceInDays(new Date(subscription.endDate), new Date())
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {format(new Date(subscription.startDate), 'dd MMM yyyy', { locale: idLocale })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {format(new Date(subscription.endDate), 'dd MMM yyyy', { locale: idLocale })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground">No payment history</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {payment.type === 'subscription' ? 'Subscription' : 'Workshop'}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', {
                        locale: idLocale,
                      })}
                    </p>
                    {payment.paymentMethod && (
                      <p className="text-xs text-muted-foreground">
                        Method: {payment.paymentMethod}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatIDR(payment.amount)}</p>
                    {payment.paidAt && (
                      <p className="text-xs text-muted-foreground">
                        Paid: {format(new Date(payment.paidAt), 'dd MMM yyyy', { locale: idLocale })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
