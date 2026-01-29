import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Daftar - ${SITE_NAME}`,
  description: 'Buat akun StockUs dan mulai perjalanan investasi Anda hari ini.',
}

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <SignupForm />
    </div>
  )
}
