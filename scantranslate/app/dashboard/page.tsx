'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

const LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Bengali', 'Tamil', 'Marathi', 'Telugu']

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pagesUsed, setPagesUsed] = useState(0)
  const [plan, setPlan] = useState('free')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [language, setLanguage] = useState('English')
  const [subjectTag, setSubjectTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchUsage(data.user.id)
    })
  }, [])

  const fetchUsage = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('pages_used, plan')
      .eq('id', userId)
      .single()
    if (data) { setPagesUsed(data.pages_used); setPlan(data.plan) }
  }

  const handleFile = (f: File) => {
    setFile(f)
    setResult('')
    setError('')
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleProcess = async () => {
    if (!file || !user) return
    const limit = plan === 'free' ? 10 : Infinity
    if (pagesUsed >= limit) {
      setError('Monthly limit reached. Upgrade to Pro for unlimited pages.')
      return
    }
    setLoading(true)
    setError('')
    setResult('')

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('language', language)
      formData.append('subject', subjectTag)
      formData.append('userId', user.id)

      const res = await fetch('/api/process-page', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Processing failed')

      setResult(data.translatedText)
      setPagesUsed(p => p + 1)
      setFile(null)
      setPreview('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  const limit = plan === 'free' ? 10 : '∞'
  const pct = plan === 'free' ? (pagesUsed / 10) * 100 : 0

  return (
    <div className="min-h-screen">
      <Nav userEmail={user.email} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Usage bar */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Pages used this month</span>
            <span className="text-sm font-medium">{pagesUsed} / {limit}</span>
          </div>
          {plan === 'free' && (
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          )}
          {plan === 'free' && (
            <p className="text-xs text-gray-600 mt-2">
              Free plan: 10 pages/month ·{' '}
              <span className="text-indigo-400 cursor-pointer">Upgrade to Pro</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload + Controls */}
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {preview ? (
                <img src={preview} className="max-h-40 mx-auto rounded-lg object-contain" alt="preview" />
              ) : (
                <>
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-gray-300 font-medium">Click or drag image here</p>
                  <p className="text-gray-600 text-sm mt-1">JPG, PNG, WEBP supported</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Language */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Translate to</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="input"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Subject tag */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Subject / Topic (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Computer Fundamentals, Indian History..."
                value={subjectTag}
                onChange={e => setSubjectTag(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!file || loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Processing with Gemini AI...
                </span>
              ) : '✨ Process Page'}
            </button>
          </div>

          {/* Result */}
          <div className="card min-h-64">
            {result ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-green-400">✅ Translation Complete</h3>
                  <a href="/library" className="text-indigo-400 text-sm hover:underline">View in Library →</a>
                </div>
                <div
                  className="prose prose-invert prose-sm max-w-none text-gray-300 text-sm leading-relaxed overflow-y-auto max-h-80"
                  dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
                />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 py-8">
                <div className="text-4xl mb-3">🌐</div>
                <p>Translation will appear here</p>
                <p className="text-xs mt-1">Upload an image and click Process</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
