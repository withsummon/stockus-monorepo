'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Loader2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MEMBERSHIP_PRICE, MEMBERSHIP_PRICE_FORMATTED } from '@/lib/constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; tier: string } | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const finalPrice = promoDiscount
    ? MEMBERSHIP_PRICE * (1 - promoDiscount / 100)
    : MEMBERSHIP_PRICE

  // Check for error from Midtrans redirect
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'payment_failed') {
      setError('Pembayaran gagal. Silakan coba lagi.')
    }
  }, [searchParams])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      })

      if (!res.ok) {
        router.push('/login?redirect=/checkout')
        return
      }

      const data = await res.json()

      if (data.user.tier === 'member') {
        router.push('/dashboard')
        return
      }

      setUser(data.user)
    } catch (err) {
      router.push('/login?redirect=/checkout')
    } finally {
      setIsLoading(false)
    }
  }

  async function validatePromo() {
    if (!promoCode.trim()) return

    setPromoValidating(true)
    setPromoError(null)
    setPromoDiscount(null)

    try {
      const res = await fetch(`${API_URL}/payments/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      })

      const data = await res.json()

      if (res.ok && data.valid) {
        setPromoDiscount(data.discountPercent)
      } else {
        setPromoError(data.error || 'Kode promo tidak valid')
      }
    } catch (err) {
      setPromoError('Gagal memvalidasi kode promo')
    } finally {
      setPromoValidating(false)
    }
  }

  async function handleCheckout() {
    setIsProcessing(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/payments/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          promoCode: promoDiscount ? promoCode.trim().toUpperCase() : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal memulai pembayaran')
        setIsProcessing(false)
        return
      }

      // Redirect to Midtrans payment page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError('Redirect URL tidak tersedia')
        setIsProcessing(false)
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setIsProcessing(false)
    }
  }

  function formatPrice(amount: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

      <Card>
        <CardHeader>
          <CardTitle>StockUs Membership</CardTitle>
          <CardDescription>Akses penuh selama 1 tahun</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Membership (1 tahun)</span>
              <span>{MEMBERSHIP_PRICE_FORMATTED}</span>
            </div>

            {promoDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Diskon ({promoDiscount}%)</span>
                <span>-{formatPrice(MEMBERSHIP_PRICE * promoDiscount / 100)}</span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(finalPrice)}</span>
            </div>
          </div>

          {/* Promo Code */}
          <div className="space-y-2">
            <Label htmlFor="promo">Kode Promo (Opsional)</Label>
            <div className="flex gap-2">
              <Input
                id="promo"
                placeholder="Masukkan kode promo"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase())
                  setPromoDiscount(null)
                  setPromoError(null)
                }}
                disabled={promoValidating || isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                onClick={validatePromo}
                disabled={!promoCode.trim() || promoValidating || isProcessing}
              >
                {promoValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Tag className="h-4 w-4" />
                )}
              </Button>
            </div>
            {promoDiscount && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" />
                Kode promo berhasil diterapkan ({promoDiscount}% diskon)
              </p>
            )}
            {promoError && (
              <p className="text-sm text-destructive">{promoError}</p>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Pembayaran untuk:</p>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Yang Anda dapatkan:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Akses semua video kursus
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Semua research reports
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Investment templates
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Private Discord community
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengalihkan ke pembayaran...
              </>
            ) : (
              `Bayar ${formatPrice(finalPrice)}`
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami.
            <br />
            14 hari garansi uang kembali.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
