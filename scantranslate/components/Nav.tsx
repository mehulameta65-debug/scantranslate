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
      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl bg-black/20 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs">
              📖
            </div>
            <span className="font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ScanTranslate
            </span>
          </Link>
          <div className="flex gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === l.href
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold">
              {userEmail[0].toUpperCase()}
            </div>
            <span className="text-slate-400 text-xs hidden lg:block">{userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 backdrop-blur-xl bg-black/20 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs">
            📖
          </div>
          <span className="font-bold text-sm gradient-text">ScanTranslate</span>
        </div>
        <button onClick={handleLogout} className="text-slate-500 text-xs hover:text-slate-300">
          Logout
        </button>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-t border-white/10">
        <div className="grid grid-cols-3">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center justify-center py-3 gap-1 transition-all ${
                pathname === l.href
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`text-xl transition-transform ${pathname === l.href ? 'scale-110' : ''}`}>
                {l.icon}
              </span>
              <span className="text-xs font-medium">{l.label}</span>
              {pathname === l.href && (
                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
