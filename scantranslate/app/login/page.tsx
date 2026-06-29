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
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-900">
      <div className="card w-full max-w-sm text-center">
        <div className="text-4xl mb-4">📖</div>
        <h1 className="text-2xl font-bold mb-1 text-white">ScanTranslate</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to start translating your textbooks</p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading
            ? <span className="animate-spin">⟳</span>
            : <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
          }
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <p className="text-gray-600 text-xs mt-6">
          100% Free · No credit card needed
        </p>
      </div>
    </main>
  )
}