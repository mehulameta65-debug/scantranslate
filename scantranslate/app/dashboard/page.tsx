'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

const LANGUAGE_GROUPS = [
  { group: '🇮🇳 Indian Languages', options: [
    'English', 'Hindi', 'Hinglish', 'Bengali', 'Tamil',
    'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam',
    'Punjabi', 'Odia', 'Urdu', 'Assamese', 'Sanskrit'
  ]},
  { group: '🌍 European', options: [
    'French', 'Spanish', 'German', 'Italian', 'Portuguese',
    'Dutch', 'Russian', 'Polish', 'Ukrainian', 'Greek',
    'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Czech', 'Romanian'
  ]},
  { group: '🌏 Asian', options: [
    'Chinese Simplified', 'Chinese Traditional', 'Japanese',
    'Korean', 'Arabic', 'Turkish', 'Persian', 'Thai',
    'Vietnamese', 'Indonesian', 'Malay', 'Nepali'
  ]},
  { group: '🌐 Other', options: [
    'Swahili', 'Afrikaans', 'Hebrew'
  ]}
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

  // Refs for different input modes
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
    }
    checkUser()
    // Detect mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP)')
      return
    }
    // No size limit — handle any size
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

      const res = await fetch('/api/process-page', {
        method: 'POST',
        body: formData
      })
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

  const clearImage = () => {
    setFile(null)
    setPreview('')
    setResult('')
    setError('')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="text-4xl animate-spin mb-4">⟳</div>
        <p>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <Nav userEmail={user.email} />

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Translate a Page</h1>
          <p className="text-gray-500 text-sm mt-1">Take a photo or upload from gallery</p>
        </div>

        {/* Image Upload Area */}
        {!preview ? (
          <div className="space-y-3 mb-6">
            {/* Mobile: Camera + Gallery buttons */}
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Live Camera Button */}
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl p-6 transition-colors"
                >
                  <span className="text-4xl">📸</span>
                  <span className="font-semibold">Take Photo</span>
                  <span className="text-xs text-indigo-200">Open camera</span>
                </button>

                {/* Gallery Button */}
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl p-6 transition-colors border border-gray-700"
                >
                  <span className="text-4xl">🖼️</span>
                  <span className="font-semibold">Gallery</span>
                  <span className="text-xs text-gray-400">Choose photo</span>
                </button>

                {/* Camera input — opens rear camera on mobile */}
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {/* Gallery input */}
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              /* Desktop: Drag and drop zone */
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => galleryRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                  dragging
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 hover:border-indigo-600 hover:bg-gray-900'
                }`}
              >
                <div className="text-5xl mb-4">📷</div>
                <p className="text-gray-300 font-semibold text-lg">Click or drag image here</p>
                <p className="text-gray-600 text-sm mt-2">JPG, PNG, WEBP · Any size supported</p>
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            )}
          </div>
        ) : (
          /* Image Preview */
          <div className="relative mb-6 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
            <img
              src={preview}
              className="w-full max-h-72 object-contain"
              alt="Page preview"
            />
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 bg-gray-900/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
            <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              ✓ Image ready
            </div>
          </div>
        )}

        {/* Language Selector */}
        <div className="card mb-4">
          <label className="text-sm text-gray-400 block mb-2 font-medium">
            🌐 Translate to
          </label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="input text-base"
            style={{ fontSize: '16px' }} // prevents iOS zoom on focus
          >
            {LANGUAGE_GROUPS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Subject Tag */}
        <div className="card mb-4">
          <label className="text-sm text-gray-400 block mb-2 font-medium">
            📚 Subject / Topic <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Computer Fundamentals, Indian History..."
            value={subjectTag}
            onChange={e => setSubjectTag(e.target.value)}
            style={{ fontSize: '16px' }} // prevents iOS zoom
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl p-3 mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={!file || loading}
          className="btn-primary w-full py-4 text-lg rounded-2xl mb-6"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin text-xl">⟳</span>
              Translating with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✨ Translate Page
            </span>
          )}
        </button>

        {/* Loading state */}
        {loading && (
          <div className="card text-center py-8 mb-6">
            <div className="text-4xl animate-pulse mb-3">🧠</div>
            <p className="text-gray-300 font-medium">Gemini AI is reading your page...</p>
            <p className="text-gray-500 text-sm mt-1">Extracting text + translating to {language}</p>
            <div className="flex justify-center gap-1 mt-4">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-green-400 text-lg">✅ Translation Done!</h3>
              <a
                href="/library"
                className="text-indigo-400 text-sm hover:underline font-medium"
              >
                Library →
              </a>
            </div>

            {/* Language badge */}
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded-full">
                🌐 {language}
              </span>
              {subjectTag && (
                <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                  📚 {subjectTag}
                </span>
              )}
            </div>

            <div
              className="text-gray-300 text-sm leading-relaxed overflow-y-auto max-h-96 border-t border-gray-800 pt-3"
              dangerouslySetInnerHTML={{
                __html: result
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  .replace(/\n/g, '<br/>')
              }}
            />

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800">
              <button
                onClick={() => {
                  setResult('')
                  setFile(null)
                  setPreview('')
                }}
                className="btn-secondary flex-1 text-sm py-2"
              >
                📷 Translate Another
              </button>
              <a href="/library" className="btn-primary flex-1 text-sm py-2 text-center">
                📚 View Library
              </a>
            </div>
          </div>
        )}

        {/* Tips for mobile */}
        {!preview && !result && isMobile && (
          <div className="card mt-4 text-center">
            <p className="text-gray-500 text-xs leading-relaxed">
              💡 <strong className="text-gray-400">Tip:</strong> For best results, hold your phone steady,
              ensure good lighting, and keep the page flat when taking a photo.
              Works with any page size — A4, A5, textbooks, notebooks.
            </p>
          </div>
        )}
      </main>

      {/* Mobile bottom safe area spacer */}
      <div className="h-8" />
    </div>
  )
}
