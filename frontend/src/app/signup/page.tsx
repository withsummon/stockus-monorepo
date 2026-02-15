'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/lib/i18n/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError(t('signup.passwordMismatch'))
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t('signup.passwordMinLength'))
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-montserrat text-main-black">
            {t('signup.checkEmail')}
          </h1>
          <p className="text-slate-400 font-montserrat text-sm">
            {t('signup.verificationSent')} <strong className="text-main-black">{email}</strong>.
            {' '}{t('signup.verificationInstructions')}
          </p>
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="w-full h-12 rounded-xl border-slate-200 font-montserrat font-semibold text-base"
          >
            {t('signup.backToLogin')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Gradient panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
        {/* Multi-layer mesh gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-brand" />
          <div className="absolute -top-[20%] -right-[25%] w-[80%] h-[70%] rounded-full bg-white/70 blur-[80px]" />
          <div className="absolute top-[30%] left-[20%] w-[60%] h-[50%] rounded-full bg-[#c46a20]/60 blur-[70px]" />
          <div className="absolute top-[25%] left-[5%] w-[45%] h-[35%] rounded-full bg-[#b85e15]/40 blur-[60px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[50%] h-[30%] rounded-full bg-[#e8944c]/40 blur-[50px]" />
          <div className="absolute top-[5%] left-[10%] w-[40%] h-[25%] rounded-full bg-[#d97b30]/30 blur-[50px]" />
          <div className="absolute bottom-[30%] right-[20%] w-[200px] h-[200px] rounded-full bg-white/10 blur-[70px]" />
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
          <h2 className="text-[42px] xl:text-[48px] font-bold text-white font-montserrat leading-[1.1] mb-4">
            Join<br />StockUs
          </h2>
          <p className="text-white/75 text-sm xl:text-base font-montserrat font-light leading-relaxed max-w-[300px]">
            Start your journey to smarter investing with institutional-grade research and education.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-6 sm:px-12 xl:px-20 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-montserrat text-main-black">
              {t('signup.title')}
            </h1>
            <p className="text-slate-400 font-montserrat text-sm leading-relaxed">
              {t('signup.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-main-black font-montserrat font-semibold text-sm">
                {t('signup.fullName')}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-12 rounded-xl border-slate-200 bg-white font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-main-black font-montserrat font-semibold text-sm">
                {t('signup.email')}
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
                {t('signup.password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-12 rounded-xl border-slate-200 bg-white font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-main-black font-montserrat font-semibold text-sm">
                {t('signup.confirmPassword')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
              {loading ? t('signup.processing') : t('signup.submit')}
            </Button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm font-montserrat text-slate-500">
            {t('signup.hasAccount')}{' '}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              {t('signup.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
