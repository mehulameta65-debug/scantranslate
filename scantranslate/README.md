# ScanTranslate 📖

Upload photos of Hindi textbook pages → AI translates to English → Download as PDF or PPT.

Built for SSC, UPSC, RSSB, RPSC students.

## Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Supabase Setup
1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `supabase-schema.sql` → Run
3. Go to Storage → Create two buckets:
   - `page-images` (public)
   - `documents` (public)
4. Go to Authentication → Providers → Enable Google OAuth
   - Add Google Client ID + Secret (from console.cloud.google.com)

### 4. Run Locally
```bash
npm run dev
```
Open http://localhost:3000

### 5. Deploy to Vercel
```bash
npx vercel
```
Add all env variables in Vercel dashboard.

## Features
- 📷 Upload any photo of a textbook page
- 🌐 Translate to English, Hindi, Hinglish, Bengali, Tamil, Marathi, Telugu
- 📚 Library to manage all your translated pages
- 📄 Download as PDF (with cover page + structured notes)
- 📊 Download as PPT (dark theme, one slide per page)
- 🔐 Google OAuth login
- 📊 Free tier: 10 pages/month

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Supabase (Auth + DB + Storage)
- Google Gemini Vision API
- pdf-lib (PDF generation)
- pptxgenjs (PPT generation)
