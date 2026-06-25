import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ScanTranslate — Textbook Scanner for Exam Students',
  description: 'Upload Hindi textbook pages, translate to English, download as PDF or PPT'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
