// OpenAI integration - endast om API-nyckel finns

interface GenerateImageParams {
  originalImage: string
  projectType: string
  description: string
  dimensions: { width: number; depth: number; height: number }
  drawingArea: { x: number; y: number; width: number; height: number }
}

// Lazy initialization - skapar klient endast vid behov
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  const OpenAI = require('openai').default
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function generateProjectImage(params: GenerateImageParams): Promise<string | null> {
  const openai = getOpenAIClient()
  if (!openai) return null

  const { originalImage, projectType, description, dimensions } = params

  try {
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analysera denna bild av en utomhusplats. Beskriv kortfattat:
1. Typ av yta (gräsmatta, plattor, trädäck, etc)
2. Omgivning (hus, staket, träd, etc)
3. Ljusförhållanden
Svara på engelska, max 100 ord.`
            },
            {
              type: 'image_url',
              image_url: { url: originalImage, detail: 'low' }
            }
          ]
        }
      ],
      max_tokens: 200
    })

    const sceneDescription = analysis.choices[0]?.message?.content || ''

    const projectPrompts: Record<string, string> = {
      'utekök': `modern Scandinavian outdoor kitchen with built-in grill, sink, wooden countertop, ${dimensions.width}m wide`,
      'altan': `wooden deck/patio, ${dimensions.width}x${dimensions.depth}m, Scandinavian style`,
      'förråd': `Swedish garden shed, ${dimensions.width}x${dimensions.depth}m, Falu red or gray`,
      'pergola': `wooden pergola, ${dimensions.width}x${dimensions.depth}m, modern Scandinavian`,
      'staket': `wooden privacy fence, ${dimensions.width}m long, ${dimensions.height}m tall`,
      'carport': `wooden carport, ${dimensions.width}x${dimensions.depth}m, flat roof`,
    }

    const projectDescription = projectPrompts[projectType] || projectPrompts['utekök']
    const userDetails = description ? `, featuring ${description}` : ''

    const imagePrompt = `Photorealistic image of ${projectDescription}${userDetails}, in garden: ${sceneDescription}. Newly built, professional. Natural daylight, architectural photography.`

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'natural'
    })

    return imageResponse.data[0]?.url || null
  } catch (error) {
    console.error('OpenAI error:', error)
    return null
  }
}

export async function generateSimpleProjectImage(
  projectType: string,
  description: string,
  dimensions: { width: number; depth: number; height: number }
): Promise<string | null> {
  const openai = getOpenAIClient()
  if (!openai) return null

  const projectPrompts: Record<string, string> = {
    'utekök': 'modern Scandinavian outdoor kitchen with gas grill, sink, wooden countertops',
    'altan': 'wooden garden deck with horizontal planks',
    'förråd': 'Swedish garden shed in Falu red with white trim',
    'pergola': 'modern wooden pergola with clean timber beams',
    'staket': 'Scandinavian wooden privacy fence with vertical boards',
    'carport': 'modern wooden carport with flat angled roof',
  }

  const basePrompt = projectPrompts[projectType] || projectPrompts['utekök']
  const userDetails = description ? `, with ${description}` : ''

  const prompt = `Photorealistic photo of ${basePrompt}${userDetails}, ${dimensions.width}m wide, ${dimensions.depth}m deep. Swedish garden, summer day, professional construction. Wide angle, ultra realistic.`

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'natural'
    })
    return response.data[0]?.url || null
  } catch (error) {
    console.error('DALL-E error:', error)
    return null
  }
}
