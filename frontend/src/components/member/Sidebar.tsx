'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Download,
  Calendar,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { LogoutButton } from './LogoutButton'
import type { User as UserType } from '@/types/auth'

interface SidebarProps {
  user: UserType
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kursus', href: '/courses', icon: BookOpen },
  { name: 'Riset', href: '/research', icon: FileText },
  { name: 'Download', href: '/downloads', icon: Download },
  { name: 'Jadwal', href: '/cohorts', icon: Calendar },
  { name: 'Profil', href: '/profile', icon: User },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col h-screen sticky top-0">
      {/* User Info */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="mt-2">
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
            user.tier === 'member'
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {user.tier === 'member' ? 'Member' : 'Free'}
          </span>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />

      {/* Logout */}
      <div className="p-4">
        <LogoutButton />
      </div>
    </aside>
  )
}
