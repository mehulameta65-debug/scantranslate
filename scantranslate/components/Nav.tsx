'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/dashboard', label: 'Translate', icon: '📷' },
  { href: '/library', label: 'Library', icon: '📚' },
  { href: '/documents', label: 'Downloads', icon: '📄' }
]

export default function Nav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden sm:flex bg-gray-900 border-b border-gray-800 px-4 py-3 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-indigo-400 text-lg">
            📖 ScanTranslate
          </Link>
          <div className="flex gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === l.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs">{userEmail}</span>
          <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-1.5">
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="sm:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-indigo-400">📖 ScanTranslate</span>
        <button onClick={handleLogout} className="text-gray-500 text-sm">
          Logout
        </button>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="grid grid-cols-3">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                pathname === l.href
                  ? 'text-indigo-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-xl">{l.icon}</span>
              <span className="text-xs font-medium">{l.label}</span>
              {pathname === l.href && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
