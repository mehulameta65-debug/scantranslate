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
    if (!f.type.startsWith('image/')) { setError('Please upload an image file'); return }
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
    <div className="gradient-bg min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="gradient-bg min-h-screen">
      <Nav userEmail={user.email} />

      <main className="max-w-3xl mx-auto px-4 py-8 pb-28 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">
            Translate a <span className="gradient-text">Page</span>
          </h1>
          <p className="text-slate-500 text-sm">Take a photo or upload from gallery · Any language</p>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div className="mb-6">
            {isMobile ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all text-center"
                >
                  <span className="text-5xl">📸</span>
                  <div>
                    <p className="font-bold text-indigo-300">Take Photo</p>
                    <p className="text-xs text-slate-500 mt-1">Opens camera</p>
                  </div>
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20 transition-all text-center"
                >
                  <span className="text-5xl">🖼️</span>
                  <div>
                    <p className="font-bold text-slate-300">Gallery</p>
                    <p className="text-xs text-slate-500 mt-1">Choose photo</p>
                  </div>
                </button>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => galleryRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                    : 'border-white/10 hover:border-indigo-500/40 hover:bg-white/3'
                }`}
              >
                <div className="text-6xl mb-4 animate-float">📷</div>
                <p className="text-slate-300 font-semibold text-lg mb-1">Click or drag image here</p>
                <p className="text-slate-500 text-sm">JPG, PNG, WEBP · Any size supported</p>
                <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            )}
          </div>
        ) : (
          <div className="relative mb-6 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
            <img src={preview} className="w-full max-h-64 object-contain" alt="preview" />
            <button onClick={() => { setFile(null); setPreview(''); setResult('') }} className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center text-sm transition-all backdrop-blur-sm">✕</button>
            <div className="absolute bottom-3 left-3 badge">✓ Image ready</div>
          </div>
        )}

        {/* Controls */}
        <div className="card-glow mb-4">
          <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">🌐 Translate to</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="input">
            {LANGUAGE_GROUPS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map(l => <option key={l} value={l}>{l}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="card-glow mb-6">
          <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">📚 Subject / Topic <span className="text-slate-600 normal-case">(optional)</span></label>
          <input type="text" className="input" placeholder="e.g. Computer Fundamentals, Indian History..." value={subjectTag} onChange={e => setSubjectTag(e.target.value)} />
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Translate Button */}
        <button onClick={handleProcess} disabled={!file || loading} className="btn-primary w-full py-4 text-base mb-6">
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Translating with AI...
            </span>
          ) : '✨ Translate Page'}
        </button>

        {/* Loading Animation */}
        {loading && (
          <div className="card-glow text-center py-10 mb-6">
            <div className="text-5xl animate-float mb-4">🧠</div>
            <p className="text-slate-200 font-semibold mb-1">AI is reading your page...</p>
            <p className="text-slate-500 text-sm">Extracting text + translating to {language}</p>
            <div className="flex justify-center gap-2 mt-6">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.15}s`}} />
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="card-glow">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-400">Translation Complete!</span>
              </div>
              <a href="/library" className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all">
                📚 Library →
              </a>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="badge">🌐 {language}</span>
              {subjectTag && <span className="badge">📚 {subjectTag}</span>}
            </div>
            <div
              className="text-slate-300 text-sm leading-relaxed overflow-y-auto max-h-80 pr-2"
              dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\n/g, '<br/>') }}
            />
            <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => { setResult(''); setFile(null); setPreview('') }} className="btn-secondary flex-1 text-sm py-2.5">
                📷 Translate Another
              </button>
              <a href="/library" className="btn-primary flex-1 text-sm py-2.5 text-center">
                📚 View Library
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
