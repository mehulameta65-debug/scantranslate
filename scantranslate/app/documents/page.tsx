'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

export default function Documents() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      supabase
        .from('documents')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .then(({ data: d }) => { setDocs(d || []); setLoading(false) })
    })
  }, [])

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen">
      <Nav userEmail={user.email} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-6">📄 Your Documents</h1>

        {loading ? (
          <div className="text-gray-500 text-center py-20">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-gray-400">No documents generated yet</p>
            <a href="/library" className="text-indigo-400 text-sm mt-2 hover:underline block">
              Go to Library to generate →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map(d => (
              <div key={d.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{d.format === 'pdf' ? '📄' : '📊'}</span>
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-xs text-gray-500">
                      {d.format.toUpperCase()} · {new Date(d.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={d.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
