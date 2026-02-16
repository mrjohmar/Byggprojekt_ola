// Puter AI - Gratis bildgenerering som fallback
// Puter laddas via script tag i layout.tsx

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>
      }
    }
  }
}

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

export async function generateWithPuterAI(
  projectType: string,
  description: string,
  dimensions: { width: number; depth: number; height: number }
): Promise<string | null> {
  // Vänta på att Puter ska laddas
  if (typeof window === 'undefined') {
    console.log('Puter AI: Not available on server side')
    return null
  }

  // Vänta upp till 5 sekunder på att Puter ska laddas
  let attempts = 0
  while (!window.puter && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  if (!window.puter) {
    console.error('Puter AI: puter not loaded')
    return null
  }

  try {
    const basePrompt = projectPrompts[projectType] || projectPrompts['övrigt']
    const prompt = `${basePrompt}, ${description || ''}, ${dimensions.width}m wide, in a Swedish residential garden, summer daylight, photorealistic architectural photography, professional DIY construction`

    console.log('Puter AI prompt:', prompt)

    // Anropa Puter AI txt2img
    const image = await window.puter.ai.txt2img(prompt)

    // Konvertera HTMLImageElement till base64
    const canvas = document.createElement('canvas')
    canvas.width = image.width || 1024
    canvas.height = image.height || 768
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('Puter AI: Could not get canvas context')
      return null
    }

    ctx.drawImage(image, 0, 0)
    const base64 = canvas.toDataURL('image/png')

    console.log('Puter AI: Image generated successfully')
    return base64

  } catch (error) {
    console.error('Puter AI generation error:', error)
    return null
  }
}

export async function regenerateWithPuterAI(
  editedImage: string,
  annotations: string,
  projectType: string,
  description: string
): Promise<string | null> {
  // För regenerering använder vi bara text-prompt baserat på annoteringarna
  // eftersom Puter AI inte har inpainting/image-to-image
  if (typeof window === 'undefined' || !window.puter) {
    return null
  }

  try {
    const basePrompt = projectPrompts[projectType] || projectPrompts['övrigt']
    let prompt = basePrompt

    if (annotations && annotations.trim().length > 0) {
      prompt = `${basePrompt}, incorporating changes: ${annotations}, ${description || ''}, photorealistic, professional DIY construction, seamlessly blending with garden surroundings, daylight photography`
    } else {
      prompt = `${basePrompt}, refined version, ${description || ''}, photorealistic, professional DIY construction, seamlessly blending with garden surroundings, daylight photography`
    }

    console.log('Puter AI regenerate prompt:', prompt)

    const image = await window.puter.ai.txt2img(prompt)

    const canvas = document.createElement('canvas')
    canvas.width = image.width || 1024
    canvas.height = image.height || 768
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    ctx.drawImage(image, 0, 0)
    return canvas.toDataURL('image/png')

  } catch (error) {
    console.error('Puter AI regenerate error:', error)
    return null
  }
}
