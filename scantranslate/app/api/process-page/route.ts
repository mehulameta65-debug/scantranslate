import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { processImageWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const language = formData.get('language') as string || 'English'
    const subject = formData.get('subject') as string || ''
    const userId = formData.get('userId') as string

    if (!image || !userId) {
      return NextResponse.json({ error: 'Missing image or userId' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check usage limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('pages_used, plan')
      .eq('id', userId)
      .single()

    if (profile?.plan === 'free' && (profile?.pages_used || 0) >= 10) {
      return NextResponse.json({ error: 'Monthly limit reached. Upgrade to Pro.' }, { status: 403 })
    }

    // Convert image to base64 for Gemini
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = image.type as 'image/jpeg' | 'image/png' | 'image/webp'

    // Upload original to Supabase Storage
    const fileName = `${userId}/${Date.now()}-${image.name}`
    const { data: uploadData } = await supabase.storage
      .from('page-images')
      .upload(fileName, bytes, { contentType: mimeType })

    const { data: publicUrl } = supabase.storage
      .from('page-images')
      .getPublicUrl(fileName)

    // Process with Gemini
    const translatedText = await processImageWithGemini(base64, mimeType, language, subject)

    // Save to pages table
    const { data: page } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        image_url: publicUrl.publicUrl,
        translated_text: translatedText,
        target_language: language,
        subject_tag: subject || null
      })
      .select()
      .single()

    // Increment usage
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        pages_used: (profile?.pages_used || 0) + 1,
        plan: profile?.plan || 'free'
      })

    return NextResponse.json({
      pageId: page?.id,
      translatedText,
      imageUrl: publicUrl.publicUrl
    })
  } catch (err: any) {
    console.error('process-page error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
