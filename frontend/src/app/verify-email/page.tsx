'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token verifikasi tidak ditemukan')
      return
    }

    verifyEmail(token)
  }, [token])

  async function verifyEmail(token: string) {
    try {
      const res = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Email berhasil diverifikasi!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Verifikasi gagal. Token mungkin sudah kadaluarsa.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Terjadi kesalahan saat memverifikasi email')
    }
  }

  return (
    <div className="w-full max-w-md text-center space-y-6">
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Memverifikasi Email...</h1>
          <p className="text-muted-foreground">Mohon tunggu sebentar</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Email Terverifikasi!</h1>
          <p className="text-muted-foreground">{message}</p>
          <Button asChild className="mt-4">
            <Link href="/login">Masuk ke Akun</Link>
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Verifikasi Gagal</h1>
          <p className="text-muted-foreground">{message}</p>
          <div className="flex flex-col gap-2 mt-4">
            <Button asChild variant="outline">
              <Link href="/login">Kembali ke Login</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md text-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Memuat...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
