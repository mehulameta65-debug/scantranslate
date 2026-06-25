'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        {/* Logo */}
        <div className="text-5xl mb-6">📖</div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ScanTranslate
        </h1>

        <p className="text-xl text-gray-400 mb-3">
          Hindi textbook pages → English notes → PDF/PPT
        </p>
        <p className="text-gray-500 mb-10">
          Built for SSC, UPSC, RSSB & all state PSC students
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/login" className="btn-primary text-lg px-8 py-3">
            Get Started Free →
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: '📷', title: 'Snap & Upload', desc: 'Upload any photo of a textbook page' },
            { icon: '🌐', title: 'AI Translation', desc: 'Gemini AI extracts + translates in seconds' },
            { icon: '📥', title: 'Download Notes', desc: 'Get clean PDF or PPT to study from' }
          ].map(f => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-sm mt-10">
          Free: 10 pages/month · No credit card required
        </p>
      </div>
    </main>
  )
}
