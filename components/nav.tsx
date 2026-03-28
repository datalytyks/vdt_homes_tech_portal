'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, AlertCircle, Activity, GitBranch, ToggleLeft, LogOut } from 'lucide-react'
import { clsx } from 'clsx'

const links = [
  { href: '/',            label: 'Overview',      icon: LayoutDashboard },
  { href: '/errors',      label: 'Errors',        icon: AlertCircle },
  { href: '/status',      label: 'System Status', icon: Activity },
  { href: '/map',         label: 'Ecosystem Map', icon: GitBranch },
  { href: '/switchboard', label: 'Switchboard',   icon: ToggleLeft },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col border-r border-gray-800"
      style={{
        width: 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shrink-0">
            <Image
              src="https://api.vdthomes.com/storage/v1/object/public/branding_assets/logos/blank_on_transparent.png"
              alt="VDT Homes"
              width={24}
              height={24}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <span className="text-white font-semibold text-sm leading-tight block">VDT Tech</span>
            <span className="text-gray-500 text-xs leading-tight block">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium w-full transition-colors',
                active
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors w-full"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
