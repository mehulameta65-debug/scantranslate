'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <main className="gradient-bg min-h-screen flex items-center justify-center px-4 relative">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse-glow">
            📖
          </div>
          <h1 className="text-2xl font-black mb-1">
            Welcome to <span className="gradient-text">ScanTranslate</span>
          </h1>
          <p className="text-slate-400 text-sm">Translate any textbook page instantly</p>
        </div>

        {/* Card */}
        <div className="card-glow">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-primary w-full py-4 text-base"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
            )}
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
            {[
              { icon: '🆓', label: '100% Free' },
              { icon: '🌐', label: '40+ Languages' },
              { icon: '📥', label: 'PDF & PPT' }
            ].map(f => (
              <div key={f.label} className="text-center">
                <div className="text-xl mb-1">{f.icon}</div>
                <p className="text-xs text-slate-500">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Built for SSC · UPSC · RSSB · RPSC students
        </p>
      </div>
    </main>
  )
}
