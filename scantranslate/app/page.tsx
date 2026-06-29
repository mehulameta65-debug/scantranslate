'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-slate-900">
      <div className="max-w-2xl">
        <div className="text-5xl mb-6">📖</div>
        <h1 className="text-4xl font-bold mb-4 text-indigo-400">
          ScanTranslate
        </h1>
        <p className="text-xl text-gray-400 mb-3">
          Hindi textbook pages → English notes → PDF/PPT
        </p>
        <p className="text-gray-500 mb-2">
          Built for SSC, UPSC, RSSB & all state PSC students
        </p>
        <p className="text-green-400 font-semibold mb-10">
          ✅ 100% Free · Unlimited Pages · No Credit Card · 40+ Languages
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/login" className="btn-primary text-lg px-8 py-3">
            Get Started Free →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: '📷', title: 'Snap & Upload', desc: 'Upload any photo of a textbook page' },
            { icon: '🌐', title: 'AI Translation', desc: 'AI extracts + translates to 40+ languages' },
            { icon: '📥', title: 'Download Notes', desc: 'Get clean PDF or PPT — completely free' }
          ].map(f => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}