import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { SITE_NAME } from '@/lib/constants'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: `Masuk - ${SITE_NAME}`,
  description: 'Masuk ke akun StockUs Anda untuk mengakses kursus dan materi investasi.',
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
