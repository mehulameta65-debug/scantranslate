import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const { pageIds, title, userId } = await req.json()
    if (!pageIds?.length || !userId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Fetch pages
    const { data: pages } = await supabase
      .from('pages')
      .select('*')
      .in('id', pageIds)
      .order('created_at', { ascending: true })

    if (!pages?.length) {
      return NextResponse.json({ error: 'No pages found' }, { status: 404 })
    }

    // Create PDF
    const pdf = await PDFDocument.create()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)

    const W = 595, H = 842
    const margin = 50
    const lineH = 18

    const wrapText = (text: string, maxWidth: number, size: number) => {
      const words = text.split(' ')
      const lines: string[] = []
      let current = ''
      for (const word of words) {
        const test = current ? `${current} ${word}` : word
        if (font.widthOfTextAtSize(test, size) <= maxWidth) {
          current = test
        } else {
          if (current) lines.push(current)
          current = word
        }
      }
      if (current) lines.push(current)
      return lines
    }

    // Cover page
    const cover = pdf.addPage([W, H])
    cover.drawText('ScanTranslate', { x: margin, y: H - 120, font: boldFont, size: 28, color: rgb(0.39, 0.4, 0.95) })
    cover.drawText(title, { x: margin, y: H - 170, font: boldFont, size: 20, color: rgb(0.1, 0.1, 0.1) })
    cover.drawText(`Generated: ${new Date().toLocaleDateString()}`, { x: margin, y: H - 200, font, size: 12, color: rgb(0.5, 0.5, 0.5) })
    cover.drawText(`Total pages: ${pages.length}`, { x: margin, y: H - 220, font, size: 12, color: rgb(0.5, 0.5, 0.5) })

    // Content pages
    for (const page of pages) {
      const p = pdf.addPage([W, H])
      let y = H - margin

      // Subject tag header
      const subject = page.subject_tag || 'General'
      p.drawText(subject, { x: margin, y, font: boldFont, size: 14, color: rgb(0.39, 0.4, 0.95) })
      y -= lineH * 1.5

      // Horizontal line
      p.drawLine({ start: { x: margin, y }, end: { x: W - margin, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
      y -= lineH

      // Content
      const content = (page.translated_text || '').replace(/\*\*(.*?)\*\*/g, '$1')
      const lines = content.split('\n')

      for (const line of lines) {
        if (y < margin + lineH) {
          const newPage = pdf.addPage([W, H])
          y = H - margin
        }
        const wrapped = wrapText(line, W - margin * 2, 11)
        for (const wline of wrapped) {
          if (y < margin) break
          const isBold = line.startsWith('**') || line.startsWith('#')
          p.drawText(wline, {
            x: margin,
            y,
            font: isBold ? boldFont : font,
            size: 11,
            color: rgb(0.15, 0.15, 0.15)
          })
          y -= lineH
        }
        y -= 4
      }
    }

    const pdfBytes = await pdf.save()

    // Upload to Supabase Storage
    const fileName = `${userId}/docs/${Date.now()}-${title.replace(/\s/g, '-')}.pdf`
    await supabase.storage.from('documents').upload(fileName, pdfBytes, { contentType: 'application/pdf' })
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)

    // Save to documents table
    await supabase.from('documents').insert({
      user_id: userId,
      title,
      format: 'pdf',
      download_url: urlData.publicUrl
    })

    return NextResponse.json({ downloadUrl: urlData.publicUrl })
  } catch (err: any) {
    console.error('generate-pdf error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
