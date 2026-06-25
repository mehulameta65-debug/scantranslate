import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function processImageWithGemini(
  imageBase64: string,
  mimeType: string,
  targetLanguage: string,
  subjectTag?: string
): Promise<string> {
  // gemini-2.0-flash is the current stable model
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are a document processor for students.
The subject/topic is: ${subjectTag || 'General'}.

Do the following:
1. Extract ALL text from this image (OCR) — handle any page size.
2. Translate everything to ${targetLanguage}.
3. Format as clean structured notes with clear headings and bullet points.
4. Bold any key terms or definitions using **term** syntax.
5. Preserve numbering, lists, and structure from the original.

Return ONLY the structured translated content. No preamble, no explanation.`

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: imageBase64
      }
    }
  ])

  return result.response.text()
}
