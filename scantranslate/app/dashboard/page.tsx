'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

const LANGUAGE_GROUPS = [
  { group: '🇮🇳 Indian Languages', options: ['English', 'Hindi', 'Hinglish', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu', 'Assamese', 'Sanskrit'] },
  { group: '🌍 European', options: ['French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Polish', 'Ukrainian', 'Greek', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Czech', 'Romanian'] },
  { group: '🌏 Asian', options: ['Chinese Simplified', 'Chinese Traditional', 'Japanese', 'Korean', 'Arabic', 'Turkish', 'Persian', 'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Nepali'] },
  { group: '🌐 Other', options: ['Swahili', 'Afrikaans', 'Hebrew'] }
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [language, setLanguage] = useState('English')
  const [subjectTag, setSubjectTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
    }
    checkUser()
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

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
    if (f) handleFile(f)
  }

  const handleProcess = async () => {
    if (!file || !user) return
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
      setFile(null)
      setPreview('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-gray-400">
      Loading...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <Nav userEmail={user.email} />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Translate a Page</h1>
          <p className="text-gray-500 text-sm mt-1">Take a photo or upload from gallery</p>
        </div>

        {/* Upload */}
        {!preview ? (
          <div className="mb-5">
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-6 transition-colors"
                >
                  <span className="text-4xl">📸</span>
                  <span className="font-semibold">Take Photo</span>
                  <span className="text-xs text-indigo-200">Open camera</span>
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl p-6 transition-colors border border-slate-600"
                >
                  <span className="text-4xl">🖼️</span>
                  <span className="font-semibold">Gallery</span>
                  <span className="text-xs text-gray-400">Choose photo</span>
                </button>
                <input ref={cameraRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => galleryRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="text-5xl mb-3">📷</div>
                <p className="text-gray-300 font-medium">Click or drag image here</p>
                <p className="text-gray-500 text-sm mt-1">JPG, PNG, WEBP · Any size</p>
                <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            )}
          </div>
        ) : (
          <div className="relative mb-5 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
            <img src={preview} className="w-full max-h-64 object-contain" alt="preview" />
            <button
              onClick={() => { setFile(null); setPreview(''); setResult('') }}
              className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors"
            >✕</button>
            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              ✓ Ready
            </div>
          </div>
        )}

        {/* Language */}
        <div className="card mb-4">
          <label className="text-sm text-gray-400 block mb-2">🌐 Translate to</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="input">
            {LANGUAGE_GROUPS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map(l => <option key={l} value={l}>{l}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="card mb-5">
          <label className="text-sm text-gray-400 block mb-2">📚 Subject / Topic (optional)</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Computer Fundamentals, Indian History..."
            value={subjectTag}
            onChange={e => setSubjectTag(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg p-3 mb-4">
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleProcess} disabled={!file || loading} className="btn-primary w-full py-3 text-base mb-5">
          {loading ? <><span className="animate-spin">⟳</span> Translating...</> : '✨ Translate Page'}
        </button>

        {result && (
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-green-400">✅ Done!</h3>
              <a href="/library" className="text-indigo-400 text-sm hover:underline">Library →</a>
            </div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded-full">🌐 {language}</span>
              {subjectTag && <span className="bg-slate-700 text-gray-300 text-xs px-2 py-1 rounded-full">📚 {subjectTag}</span>}
            </div>
            <div
              className="text-gray-300 text-sm leading-relaxed overflow-y-auto max-h-80"
              dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\n/g, '<br/>') }}
            />
            <div className="flex gap-3 mt-4 pt-3 border-t border-slate-700">
              <button onClick={() => { setResult(''); setFile(null); setPreview('') }} className="btn-secondary flex-1 text-sm py-2">
                📷 Another
              </button>
              <a href="/library" className="btn-primary flex-1 text-sm py-2">
                📚 Library
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}