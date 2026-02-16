import { NextResponse } from 'next/server'
import { calculateMaterials } from '@/lib/materials'
import { getBuildSteps } from '@/lib/buildSteps'
import { regenerateWithStability } from '@/lib/stability'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { projectType, dimensions, description, editedImage, annotations } = data

    // Beräkna material baserat på projekttyp och mått
    const materials = calculateMaterials(projectType, dimensions)

    // Hämta byggsteg
    const buildSteps = getBuildSteps(projectType)

    // Beräkna total kostnad
    const estimatedCost = materials.reduce((sum, m) => sum + (m.price || 0), 0)

    // Kolla bygglov
    const area = dimensions.width * dimensions.depth
    let buildingPermit = 'Inget bygglov krävs'
    if (area > 15) {
      buildingPermit = 'Kräver bygganmälan'
    }
    if (area > 30) {
      buildingPermit = 'Kräver bygglov'
    }

    // Regenerera bild med Stability AI baserat på redigerad bild
    let generatedImage: string | null = null
    let useClientFallback = false
    let imageProvider = 'none'

    if (process.env.STABILITY_API_KEY && editedImage) {
      try {
        console.log('Starting regeneration based on edited image...')
        generatedImage = await regenerateWithStability({
          editedImage,
          annotations: annotations || '',
          projectType,
          description: description || ''
        })
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
    } else if (!process.env.STABILITY_API_KEY) {
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
    console.error('Regenerate error:', error)
    return NextResponse.json({ error: 'Något gick fel vid re-generering' }, { status: 500 })
  }
}
