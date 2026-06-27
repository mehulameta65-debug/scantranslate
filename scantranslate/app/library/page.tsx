'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

export default function Library() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pages, setPages] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState('')
  const [search, setSearch] = useState('')
  const [docTitle, setDocTitle] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchPages(data.user.id)
    })
  }, [])

  const fetchPages = async (userId: string) => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setPages(data || [])
    setLoading(false)
  }

  const toggleSelect = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

 const handleGenerate = async (format: 'pdf' | 'ppt') => {
  if (!selected.length) return
  setGenerating(format)

  try {
    const selectedPages = pages.filter(p => selected.includes(p.id))
    const title = docTitle || 'ScanTranslate Notes'

    if (format === 'pdf') {
      // Client-side PDF generation
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

      const pdf = await PDFDocument.create()
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)

      // Cover page
      const cover = pdf.addPage([595, 842])
      cover.drawText('ScanTranslate', {
        x: 50, y: 750, font: boldFont, size: 28,
        color: rgb(0.39, 0.4, 0.95)
      })
      cover.drawText(title, {
        x: 50, y: 700, font: boldFont, size: 20,
        color: rgb(0.1, 0.1, 0.1)
      })
      cover.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
        x: 50, y: 670, font, size: 12,
        color: rgb(0.5, 0.5, 0.5)
      })
      cover.drawText(`Total pages: ${selectedPages.length}`, {
        x: 50, y: 650, font, size: 12,
        color: rgb(0.5, 0.5, 0.5)
      })

      // Content pages
      for (const page of selectedPages) {
        const p = pdf.addPage([595, 842])
        let y = 792

        // Subject heading
        p.drawText(page.subject_tag || 'General', {
          x: 50, y, font: boldFont, size: 14,
          color: rgb(0.39, 0.4, 0.95)
        })
        y -= 25

        // Content
        const content = (page.translated_text || '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
        const lines = content.split('\n')

        for (const line of lines) {
          if (y < 50) break
          const words = line.split(' ')
          let current = ''
          const wrapped: string[] = []

          for (const word of words) {
            const test = current ? `${current} ${word}` : word
            if (font.widthOfTextAtSize(test, 11) <= 495) {
              current = test
            } else {
              if (current) wrapped.push(current)
              current = word
            }
          }
          if (current) wrapped.push(current)

          for (const wline of wrapped) {
            if (y < 50) break
            p.drawText(wline, {
              x: 50, y, font, size: 11,
              color: rgb(0.15, 0.15, 0.15)
            })
            y -= 18
          }
          y -= 4
        }
      }

      // Download directly in browser
      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      a.click()
      URL.revokeObjectURL(url)

    } else {
      // PPT — still use API
      const res = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageIds: selected,
          title,
          userId: user.id
        })
      })
      const data = await res.json()
      if (data.downloadUrl) window.open(data.downloadUrl, '_blank')
    }
  } catch (e: any) {
    console.error('Generate error:', e)
    alert('Error generating file: ' + e.message)
  } finally {
    setGenerating('')
  }
}

  const deletePage = async (id: string) => {
    await supabase.from('pages').delete().eq('id', id)
    setPages(p => p.filter(x => x.id !== id))
    setSelected(s => s.filter(x => x !== id))
  }

  const filtered = pages.filter(p =>
    !search || p.subject_tag?.toLowerCase().includes(search.toLowerCase()) ||
    p.translated_text?.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen">
      <Nav userEmail={user.email} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            className="input"
            placeholder="🔍 Search by subject or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {selected.length > 0 && (
            <input
              type="text"
              className="input sm:w-64"
              placeholder="Document title..."
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
            />
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading your pages...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-400">No pages yet</p>
            <a href="/dashboard" className="text-indigo-400 text-sm mt-2 hover:underline block">
              Upload your first page →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div
                key={p.id}
                className={`card cursor-pointer transition-all relative ${
                  selected.includes(p.id) ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => toggleSelect(p.id)}
              >
                {p.image_url && (
                  <img src={p.image_url} className="w-full h-28 object-cover rounded-lg mb-3" alt="page" />
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">
                    {p.subject_tag || 'General'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {p.target_language}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {p.translated_text?.replace(/\*\*/g, '').slice(0, 120)}...
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-600">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); deletePage(p.id) }}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
                {selected.includes(p.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom action bar */}
        {selected.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl">
            <span className="text-sm text-gray-300">{selected.length} selected</span>
            <button onClick={() => handleGenerate('pdf')} disabled={!!generating} className="btn-primary">
              {generating === 'pdf' ? '⟳ Generating...' : '📄 Download PDF'}
            </button>
            <button onClick={() => handleGenerate('ppt')} disabled={!!generating} className="btn-secondary">
              {generating === 'ppt' ? '⟳ Generating...' : '📊 Download PPT'}
            </button>
            <button onClick={() => setSelected([])} className="text-gray-500 text-sm hover:text-gray-300">
              Clear
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
