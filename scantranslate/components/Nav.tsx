'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/dashboard', label: '📷 Dashboard' },
  { href: '/library', label: '📚 Library' },
  { href: '/documents', label: '📄 Documents' }
]

export default function Nav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-indigo-400">
          📖 ScanTranslate
        </Link>
        <div className="hidden sm:flex gap-1">
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
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs hidden sm:block">{userEmail}</span>
        <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-1.5">
          Logout
        </button>
      </div>
    </nav>
  )
}
