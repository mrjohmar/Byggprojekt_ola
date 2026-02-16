import { NextResponse } from 'next/server'
import { calculateMaterials } from '@/lib/materials'
import { getBuildSteps } from '@/lib/buildSteps'
import { inpaintWithStability, generateWithStability } from '@/lib/stability'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { projectType, dimensions, description, image, drawing } = data

    // Beräkna material baserat på projekttyp och mått
    const materials = calculateMaterials(projectType, dimensions)

    // Hämta byggsteg
    const buildSteps = getBuildSteps(projectType)

    // Beräkna total kostnad
    const estimatedCost = materials.reduce((sum, m) => sum + (m.price || 0), 0)

    // Kolla bygglov (förenklad logik)
    const area = dimensions.width * dimensions.depth
    let buildingPermit = 'Inget bygglov krävs'
    if (area > 15) {
      buildingPermit = 'Kräver bygganmälan'
    }
    if (area > 30) {
      buildingPermit = 'Kräver bygglov'
    }

    // Generera bild med Stability AI
    let generatedImage: string | null = null
    let useClientFallback = false
    let imageProvider = 'none'

    if (process.env.STABILITY_API_KEY) {
      try {
        if (image && drawing) {
          // Inpainting - lägg in projektet i användarens bild
          console.log('Starting inpainting...')
          generatedImage = await inpaintWithStability({
            originalImage: image,
            mask: drawing,
            projectType,
            description: description || ''
          })
        }

        // Fallback om inpainting misslyckades
        if (!generatedImage) {
          console.log('Inpainting failed, falling back to generate...')
          generatedImage = await generateWithStability(projectType, description || '', dimensions)
        }

        if (generatedImage) {
          imageProvider = 'stability'
        }
      } catch (error: any) {
        if (error?.message === 'CREDITS_DEPLETED') {
          console.log('Stability AI credits depleted, signaling client to use fallback')
          useClientFallback = true
        } else {
          console.error('Stability error:', error)
        }
      }
    } else {
      // Ingen API-nyckel - använd klient-fallback
      useClientFallback = true
    }

    return NextResponse.json({
      materials,
      buildSteps,
      estimatedCost,
      buildingPermit,
      generatedImage,
      useClientFallback,
      imageProvider,
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 })
  }
}
