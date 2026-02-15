'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Suspense } from 'react'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push(redirect)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
        {/* Left: Gradient panel */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
            {/* Multi-layer mesh gradient background */}
            <div className="absolute inset-0">
              {/* Base orange */}
              <div className="absolute inset-0 bg-brand" />
              {/* Large white glow — top right corner bleeding out */}
              <div className="absolute -top-[20%] -right-[25%] w-[80%] h-[70%] rounded-full bg-white/70 blur-[80px]" />
              {/* Warm center blob */}
              <div className="absolute top-[30%] left-[20%] w-[60%] h-[50%] rounded-full bg-[#c46a20]/60 blur-[70px]" />
              {/* Subtle dark patch — mid left */}
              <div className="absolute top-[25%] left-[5%] w-[45%] h-[35%] rounded-full bg-[#b85e15]/40 blur-[60px]" />
              {/* Bottom-right warm glow */}
              <div className="absolute bottom-[10%] right-[5%] w-[50%] h-[30%] rounded-full bg-[#e8944c]/40 blur-[50px]" />
              {/* Top-left slightly darker warmth */}
              <div className="absolute top-[5%] left-[10%] w-[40%] h-[25%] rounded-full bg-[#d97b30]/30 blur-[50px]" />
              {/* Light grain texture overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
            </div>

            {/* Stockus logo — white */}
            <div className="relative z-10">
              <Image
                src="/stockus.png"
                alt="StockUs"
                width={120}
                height={48}
                className="brightness-0 invert object-contain"
              />
            </div>

            {/* Welcome text */}
            <div className="relative z-10">
              <h2 className="text-[42px] lg:text-[48px] font-bold text-white font-montserrat leading-[1.1] mb-4">
                Welcome<br />Back!
              </h2>
              <p className="text-white/75 text-sm lg:text-base font-montserrat font-light leading-relaxed max-w-[300px]">
                Learn how to think about global markets, not just what to buy.
              </p>
            </div>
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-6 sm:px-12 xl:px-20 py-12">
          <div className="w-full max-w-md mx-auto space-y-7">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-montserrat text-main-black">
                {t('login.title')}
              </h1>
              <p className="text-slate-400 font-montserrat text-sm leading-relaxed">
                {t('login.subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-main-black font-montserrat font-semibold text-sm">
                  {t('login.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 rounded-xl border-slate-200 bg-white font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-main-black font-montserrat font-semibold text-sm">
                  {t('login.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="type your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-slate-200 bg-white font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 font-montserrat">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-brand hover:bg-[#e06300] text-white rounded-xl font-montserrat font-semibold text-base transition-all duration-300 hover:scale-[1.02]"
              >
                {loading ? t('login.processing') : t('login.submit')}
              </Button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-sm font-montserrat text-slate-500">
              {t('login.noAccount')}{' '}
              <Link href="/signup" className="text-brand font-semibold hover:underline">
                {t('login.enrollNow')}
              </Link>
            </p>
          </div>
        </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-main-black">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
