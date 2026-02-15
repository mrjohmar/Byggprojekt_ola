// Stability AI - Inpainting för att lägga in projekt i användarens bild
import sharp from 'sharp'

interface InpaintParams {
  originalImage: string // base64 data URL
  mask: { x: number; y: number; width: number; height: number }
  projectType: string
  description: string
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
  'övrigt': '', // Använd bara beskrivningen
}

export async function inpaintWithStability(params: InpaintParams): Promise<string | null> {
  const { originalImage, mask, projectType, description } = params

  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) {
    console.error('STABILITY_API_KEY not configured')
    return null
  }

  try {
    // Konvertera base64 data URL till buffer
    const base64Data = originalImage.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Hämta bildens dimensioner
    const metadata = await sharp(imageBuffer).metadata()
    const imgWidth = metadata.width || 1024
    const imgHeight = metadata.height || 768

    // Skapa mask som PNG (vit = ersätt, svart = behåll)
    const maskBuffer = await createMaskPng(mask, imgWidth, imgHeight)

    // Förbered bilden - se till att den är i rätt format
    const processedImage = await sharp(imageBuffer)
      .png()
      .toBuffer()

    // Bygg prompt - kombinera projekttyp med beskrivning
    const basePrompt = projectPrompts[projectType] || ''
    let fullPrompt: string

    if (description && description.trim().length > 0) {
      // Kombinera bas-prompt med användarens beskrivning för bästa resultat
      if (basePrompt) {
        fullPrompt = `${basePrompt}, ${description}, photorealistic, professional DIY construction, seamlessly blending with garden surroundings, daylight photography`
      } else {
        fullPrompt = `${description}, photorealistic, professional DIY construction, seamlessly blending with garden surroundings, daylight photography`
      }
    } else if (basePrompt) {
      fullPrompt = `${basePrompt}, photorealistic, professional DIY construction, seamlessly blending with garden surroundings, daylight photography`
    } else {
      fullPrompt = 'outdoor garden structure, photorealistic, professional construction, daylight'
    }

    console.log('Prompt:', fullPrompt)

    // Skapa FormData för API-anrop
    const formData = new FormData()
    formData.append('image', new Blob([processedImage], { type: 'image/png' }), 'image.png')
    formData.append('mask', new Blob([maskBuffer], { type: 'image/png' }), 'mask.png')
    formData.append('prompt', fullPrompt)
    formData.append('output_format', 'png')

    console.log('Calling Stability AI inpaint API...')
    console.log('Image size:', imgWidth, 'x', imgHeight)
    console.log('Mask area:', mask)

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit/inpaint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*'
      },
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Stability API error:', response.status, errorText)
      return null
    }

    // Konvertera response till base64
    const resultBuffer = await response.arrayBuffer()
    const base64Result = Buffer.from(resultBuffer).toString('base64')

    console.log('Inpainting successful!')
    return `data:image/png;base64,${base64Result}`

  } catch (error) {
    console.error('Stability inpaint error:', error)
    return null
  }
}

// Skapa en mask-bild som PNG
async function createMaskPng(
  mask: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number
): Promise<Buffer> {
  // Skapa svart bakgrund
  const blackBackground = await sharp({
    create: {
      width: imageWidth,
      height: imageHeight,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  }).png().toBuffer()

  // Skapa vit rektangel för mask-området
  const whiteRect = await sharp({
    create: {
      width: Math.round(mask.width),
      height: Math.round(mask.height),
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  }).png().toBuffer()

  // Kombinera: lägg vit rektangel på svart bakgrund
  const maskImage = await sharp(blackBackground)
    .composite([{
      input: whiteRect,
      left: Math.round(mask.x),
      top: Math.round(mask.y)
    }])
    .png()
    .toBuffer()

  return maskImage
}

// Fallback: generera bild utan inpainting
export async function generateWithStability(
  projectType: string,
  description: string,
  dimensions: { width: number; depth: number; height: number }
): Promise<string | null> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) return null

  const basePrompt = projectPrompts[projectType] || projectPrompts['utekök']
  const prompt = `${basePrompt}, ${dimensions.width}m wide, in a Swedish residential garden, summer daylight, photorealistic architectural photography`

  try {
    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('output_format', 'png')
    formData.append('aspect_ratio', '16:9')

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*'
      },
      body: formData
    })

    if (!response.ok) {
      console.error('Stability generate error:', response.status)
      return null
    }

    const imageBuffer = await response.arrayBuffer()
    const base64Result = Buffer.from(imageBuffer).toString('base64')

    return `data:image/png;base64,${base64Result}`

  } catch (error) {
    console.error('Stability generate error:', error)
    return null
  }
}
