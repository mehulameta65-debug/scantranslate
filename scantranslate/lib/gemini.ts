export async function processImageWithGemini(
  imageBase64: string,
  mimeType: string,
  targetLanguage: string,
  subjectTag?: string
): Promise<string> {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a document processor for students.
Subject: ${subjectTag || 'General'}.
1. Extract ALL text from this image.
2. Translate everything to ${targetLanguage}.
3. Format as clean structured notes with headings and bullet points.
4. Bold key terms using **term** syntax.
Return ONLY the translated content.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Groq API error')
  }

  return data.choices[0]?.message?.content || 'No response generated'
}