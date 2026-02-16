// Pollinations.ai - Gratis bildgenerering utan API-nyckel
// https://pollinations.ai - helt gratis och öppen

const projectPrompts: Record<string, string> = {
  'utekök': 'modern outdoor kitchen with built-in stainless steel gas grill, granite countertop, wooden storage cabinets underneath, professional outdoor cooking station',
  'altan': 'wooden deck with horizontal pressure-treated planks, clean professional construction',
  'förråd': 'traditional Swedish garden shed painted in Falu red with white window trim, wooden door',
  'pergola': 'modern wooden pergola structure with thick timber beams overhead',
  'staket': 'wooden privacy fence with vertical boards, natural wood finish',
  'carport': 'modern wooden carport with flat angled roof, open sides',
  'blomlåda': 'large wooden raised garden bed planter box for flowers and vegetables, natural wood finish',
  'lekstuga': 'small wooden playhouse for children, painted in bright colors, with small door and window',
  'växthus': 'glass greenhouse structure with aluminum frame, transparent walls',
  'övrigt': 'outdoor garden structure',
}

// Ta bort svenska tecken och specialtecken som kan orsaka problem
function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/Å/g, 'A')
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O')
    .replace(/[^\w\s,.-]/g, '') // Ta bort andra specialtecken
    .trim()
}

async function fetchImageAsBase64(url: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Pollinations fetch attempt ${attempt + 1}...`)
      const response = await fetch(url)
      if (!response.ok) {
        console.error('Failed to fetch image:', response.status)
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 2000)) // Vänta 2 sekunder
          continue
        }
        return null
      }
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error fetching image:', error)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000))
        continue
      }
      return null
    }
  }
  return null
}

export async function generateWithPuterAI(
  projectType: string,
  description: string,
  dimensions: { width: number; depth: number; height: number }
): Promise<string | null> {
  if (typeof window === 'undefined') {
    console.log('Pollinations: Not available on server side')
    return null
  }

  try {
    const basePrompt = projectPrompts[projectType] || projectPrompts['övrigt']
    const rawPrompt = `${basePrompt}, ${description || ''}, ${dimensions.width}m wide, in a Swedish residential garden, summer daylight, photorealistic architectural photography, professional DIY construction`
    const fullPrompt = sanitizePrompt(rawPrompt)

    console.log('Pollinations prompt:', fullPrompt)

    // Pollinations.ai URL-baserad bildgenerering
    const encodedPrompt = encodeURIComponent(fullPrompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`

    console.log('Fetching image from Pollinations...')
    const base64 = await fetchImageAsBase64(imageUrl)

    if (base64) {
      console.log('Pollinations: Image generated successfully')
    }
    return base64

  } catch (error) {
    console.error('Pollinations generation error:', error)
    return null
  }
}

export async function regenerateWithPuterAI(
  editedImage: string,
  annotations: string,
  projectType: string,
  description: string
): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const basePrompt = projectPrompts[projectType] || projectPrompts['övrigt']
    let rawPrompt: string

    if (annotations && annotations.trim().length > 0) {
      rawPrompt = `${basePrompt}, incorporating changes: ${annotations}, ${description || ''}, photorealistic, professional DIY construction, seamlessly blending with garden surroundings, daylight photography`
    } else {
      rawPrompt = `${basePrompt}, refined version, ${description || ''}, photorealistic, professional DIY construction, seamlessly blending with garden surroundings, daylight photography`
    }

    const fullPrompt = sanitizePrompt(rawPrompt)
    console.log('Pollinations regenerate prompt:', fullPrompt)

    const encodedPrompt = encodeURIComponent(fullPrompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true`

    return await fetchImageAsBase64(imageUrl)

  } catch (error) {
    console.error('Pollinations regenerate error:', error)
    return null
  }
}
