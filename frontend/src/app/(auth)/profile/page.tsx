import { Metadata } from 'next'
import Link from 'next/link'
import { getUser } from '@/lib/auth/dal'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/member/ProfileForm'
import { LogoutButton } from '@/components/member/LogoutButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SITE_NAME } from '@/lib/constants'
import { Crown, ArrowRight, KeyRound } from 'lucide-react'

export const metadata: Metadata = {
  title: `Profil - ${SITE_NAME}`,
  description: 'Kelola profil dan pengaturan akun Anda.',
}

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Kelola informasi akun dan pengaturan Anda
        </p>
      </div>

      {/* Profile Info */}
      <ProfileForm user={user} />

      {/* Subscription Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Status membership dan informasi langganan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.tier === 'member' ? (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary">Member Aktif</p>
                  <p className="text-sm text-muted-foreground">
                    Anda memiliki akses penuh ke semua konten
                  </p>
                </div>
                <Crown className="h-8 w-8 text-primary" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-semibold">Akun Gratis</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade untuk akses penuh ke semua kursus, riset, dan template
                </p>
              </div>
              <Button asChild>
                <Link href="/pricing">
                  Upgrade ke Member
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Akun</CardTitle>
          <CardDescription>
            Kelola keamanan dan sesi akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ubah Password</p>
                <p className="text-xs text-muted-foreground">
                  Reset password melalui email
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/forgot-password">Reset</Link>
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Keluar dari Akun</p>
              <p className="text-xs text-muted-foreground">
                Akhiri sesi saat ini
              </p>
            </div>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
