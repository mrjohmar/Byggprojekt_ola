// Bildgenerering fallback
// Försöker Pollinations.ai först, sedan placeholder

const projectLabels: Record<string, string> = {
  'utekök': 'Utekök',
  'altan': 'Altan',
  'förråd': 'Förråd',
  'pergola': 'Pergola',
  'staket': 'Staket',
  'carport': 'Carport',
  'blomlåda': 'Blomlåda',
  'lekstuga': 'Lekstuga',
  'växthus': 'Växthus',
  'övrigt': 'Projekt',
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

// Skapa en placeholder-bild som SVG
function createPlaceholderImage(projectType: string, dimensions: { width: number; depth: number; height: number }): string {
  const label = projectLabels[projectType] || 'Byggprojekt'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="768" viewBox="0 0 1024 768">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a5f2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2d8a3e;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="768" fill="url(#bg)"/>
      <rect x="50" y="50" width="924" height="668" rx="20" fill="white" fill-opacity="0.1"/>
      <text x="512" y="300" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">${label}</text>
      <text x="512" y="380" font-family="Arial, sans-serif" font-size="32" fill="white" fill-opacity="0.9" text-anchor="middle">${dimensions.width} × ${dimensions.depth} × ${dimensions.height} m</text>
      <text x="512" y="480" font-family="Arial, sans-serif" font-size="24" fill="white" fill-opacity="0.7" text-anchor="middle">AI-bildgenerering ej tillgänglig just nu</text>
      <text x="512" y="520" font-family="Arial, sans-serif" font-size="20" fill="white" fill-opacity="0.5" text-anchor="middle">Materiallista och byggbeskrivning visas nedan</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

async function fetchImageAsBase64(url: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Pollinations fetch attempt ${attempt + 1}...`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 sek timeout

      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('Failed to fetch image:', response.status)
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 2000))
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
      return base64
    }

    // Fallback till placeholder om Pollinations misslyckas
    console.log('Pollinations failed, using placeholder image')
    return createPlaceholderImage(projectType, dimensions)

  } catch (error) {
    console.error('Pollinations generation error:', error)
    // Returnera placeholder vid fel
    return createPlaceholderImage(projectType, dimensions)
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

    const base64 = await fetchImageAsBase64(imageUrl)
    if (base64) {
      return base64
    }

    // Fallback till placeholder
    return createPlaceholderImage(projectType, { width: 3, depth: 2, height: 2 })

  } catch (error) {
    console.error('Pollinations regenerate error:', error)
    return createPlaceholderImage(projectType, { width: 3, depth: 2, height: 2 })
  }
}
