'use client'
import Link from 'next/link'

const features = [
  {
    icon: '📸',
    title: 'Snap Any Page',
    desc: 'Take a live photo or upload from gallery. Works with any textbook, notebook or document.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20'
  },
  {
    icon: '🧠',
    title: 'AI Translation',
    desc: 'Powered by Llama AI. Extracts text, translates, and formats as clean structured notes.',
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/20'
  },
  {
    icon: '📥',
    title: 'Download Notes',
    desc: 'Get a beautifully formatted PDF or PPT in your language. Ready to study instantly.',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20'
  }
]

const languages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'French', 'Spanish', 'Arabic', 'Japanese', 'Chinese', 'Korean', 'German', '40+ more']

const stats = [
  { value: '40+', label: 'Languages' },
  { value: '100%', label: 'Free' },
  { value: 'AI', label: 'Powered' },
  { value: '∞', label: 'Pages' }
]

export default function Home() {
  return (
    <main className="gradient-bg min-h-screen relative">
      <div className="relative z-10">

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
              📖
            </div>
            <span className="font-bold text-lg">ScanTranslate</span>
          </div>
          <Link
            href="/login"
            className="btn-primary text-sm px-5 py-2.5"
          >
            Get Started Free →
          </Link>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            100% Free · No limits · No credit card
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight tracking-tight">
            Translate Any
            <br />
            <span className="gradient-text">Textbook Page</span>
            <br />
            Instantly
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-4 max-w-2xl mx-auto leading-relaxed">
            Upload a photo of your Hindi textbook → AI translates to 40+ languages → Download as PDF or PPT
          </p>
          <p className="text-slate-500 mb-12">
            Built for SSC · UPSC · RSSB · RPSC · All state PSC students
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login" className="btn-primary text-lg px-8 py-4 animate-pulse-glow">
              🚀 Start Translating Free
            </Link>
            <a
              href="#features"
              className="btn-secondary text-lg px-8 py-4"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-16">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* App Preview Card */}
          <div className="card-glow max-w-2xl mx-auto animate-float">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 bg-white/5 rounded-md h-5 mx-2"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-3xl mb-2">📷</div>
                <div className="h-2 bg-white/10 rounded mb-2"></div>
                <div className="h-2 bg-white/5 rounded w-3/4"></div>
                <div className="mt-3 h-8 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-lg border border-indigo-500/20"></div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-green-400 font-semibold mb-2">✅ Translation Complete</div>
                <div className="space-y-1.5">
                  {[100, 80, 90, 70, 85].map((w, i) => (
                    <div key={i} className="h-1.5 bg-white/10 rounded" style={{width: `${w}%`}}></div>
                  ))}
                </div>
                <div className="mt-3 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg opacity-80"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-5xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to
              <span className="gradient-text"> study smarter</span>
            </h2>
            <p className="text-slate-400">No more struggling with Hindi textbooks</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className={`card-glow bg-gradient-to-br ${f.color} border ${f.border} text-left`}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="card-glow text-center">
            <h2 className="text-2xl font-bold mb-2">Supports <span className="gradient-text">40+ Languages</span></h2>
            <p className="text-slate-400 text-sm mb-8">Translate to any language in the world</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {languages.map(l => (
                <span
                  key={l}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
          <div className="card-glow">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-3xl font-black mb-3">
              Ready to study <span className="gradient-text">smarter?</span>
            </h2>
            <p className="text-slate-400 mb-8">Join thousands of students already using ScanTranslate</p>
            <Link href="/login" className="btn-primary text-lg px-10 py-4">
              Start Free — No Sign up fees →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pb-8 text-slate-600 text-sm">
          Built with ❤️ for exam students · ScanTranslate © 2026
        </footer>
      </div>
    </main>
  )
}
