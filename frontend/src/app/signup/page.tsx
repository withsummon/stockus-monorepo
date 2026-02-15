'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
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
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{
          background: 'radial-gradient(ellipse at top, #F96E00 0%, #222831 50%, #1a1a1a 100%)'
        }}
      >
        <ScrollReveal variant="scale">
          <motion.div
            className="w-full max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-white rounded-[30px] shadow-2xl p-8 md:p-10 space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold font-montserrat text-main-black">
                  {t('signup.checkEmail')}
                </h1>
                <p className="text-slate-400 font-montserrat text-sm">
                  {t('signup.verificationSent')} <strong className="text-main-black">{email}</strong>.
                  {' '}{t('signup.verificationInstructions')}
                </p>
              </div>

              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full h-12 rounded-xl border-slate-200 font-montserrat font-semibold text-base transition-all duration-300 hover:scale-[1.02]"
              >
                {t('signup.backToLogin')}
              </Button>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse at top, #F96E00 0%, #222831 50%, #1a1a1a 100%)'
      }}
    >
      <ScrollReveal variant="scale">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white rounded-[30px] shadow-2xl p-8 md:p-10 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold font-montserrat text-main-black">
                {t('signup.title')}
              </h1>
              <p className="text-slate-400 font-montserrat text-sm">
                {t('signup.subtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-main-black font-montserrat font-medium">
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
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-main-black font-montserrat font-medium">
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
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-main-black font-montserrat font-medium">
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
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-main-black font-montserrat font-medium">
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
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 font-montserrat placeholder:text-slate-400 focus:border-brand focus:ring-brand"
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

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-4 text-sm text-slate-400 font-montserrat">
                {t('signup.orContinue')}
              </span>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 font-montserrat transition-all duration-300 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 font-montserrat transition-all duration-300 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </Button>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm font-montserrat text-slate-500">
              {t('signup.hasAccount')}{' '}
              <Link href="/login" className="text-brand font-semibold hover:underline">
                {t('signup.login')}
              </Link>
            </p>
          </div>

          {/* SSL Notice */}
          <div className="flex items-center justify-center gap-2 mt-6 text-white/70 text-sm font-montserrat">
            <Lock className="w-4 h-4" />
            <span>{t('signup.sslNotice')}</span>
          </div>
        </motion.div>
      </ScrollReveal>
    </div>
  )
}
