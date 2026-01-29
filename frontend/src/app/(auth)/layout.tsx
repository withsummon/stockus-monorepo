import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/dal'
import { Sidebar } from '@/components/member/Sidebar'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
