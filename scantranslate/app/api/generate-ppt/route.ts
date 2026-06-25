import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import PptxGenJS from 'pptxgenjs'

export async function POST(req: NextRequest) {
  try {
    const { pageIds, title, userId } = await req.json()
    const supabase = createServerClient()

    const { data: pages } = await supabase
      .from('pages')
      .select('*')
      .in('id', pageIds)
      .order('created_at', { ascending: true })

    if (!pages?.length) return NextResponse.json({ error: 'No pages found' }, { status: 404 })

    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'
    pptx.defineLayout({ name: 'CUSTOM', width: 13.33, height: 7.5 })

    const DARK_BG = '1e1e2e'
    const ACCENT = '6366f1'
    const TEXT = 'e2e8f0'
    const MUTED = '94a3b8'

    // Title slide
    const titleSlide = pptx.addSlide()
    titleSlide.background = { color: DARK_BG }
    titleSlide.addText('ScanTranslate', {
      x: 1, y: 2, w: 11.33, h: 1,
      fontSize: 36, bold: true, color: ACCENT, align: 'center'
    })
    titleSlide.addText(title, {
      x: 1, y: 3.2, w: 11.33, h: 0.8,
      fontSize: 22, color: TEXT, align: 'center'
    })
    titleSlide.addText(`${pages.length} pages · ${new Date().toLocaleDateString()}`, {
      x: 1, y: 4.2, w: 11.33, h: 0.5,
      fontSize: 14, color: MUTED, align: 'center'
    })

    // Content slides
    for (const page of pages) {
      const slide = pptx.addSlide()
      slide.background = { color: DARK_BG }

      // Subject tag
      slide.addText(page.subject_tag || 'General', {
        x: 0.5, y: 0.3, w: 12.33, h: 0.5,
        fontSize: 18, bold: true, color: ACCENT
      })

      // Divider
      slide.addShape(pptx.ShapeType.line, {
        x: 0.5, y: 0.9, w: 12.33, h: 0,
        line: { color: ACCENT, width: 1 }
      })

      // Content
      const content = (page.translated_text || '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .slice(0, 1200)

      slide.addText(content, {
        x: 0.5, y: 1.1, w: 12.33, h: 5.8,
        fontSize: 13, color: TEXT,
        valign: 'top', wrap: true, autoFit: true
      })

      // Language badge
      slide.addText(page.target_language, {
        x: 11, y: 6.8, w: 2, h: 0.4,
        fontSize: 10, color: MUTED, align: 'right'
      })
    }

    const pptBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer

    const fileName = `${userId}/docs/${Date.now()}-${title.replace(/\s/g, '-')}.pptx`
    await supabase.storage.from('documents').upload(fileName, pptBuffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    })
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)

    await supabase.from('documents').insert({
      user_id: userId,
      title,
      format: 'ppt',
      download_url: urlData.publicUrl
    })

    return NextResponse.json({ downloadUrl: urlData.publicUrl })
  } catch (err: any) {
    console.error('generate-ppt error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
