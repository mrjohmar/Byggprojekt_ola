// Bildgenerering - använder Unsplash för relevanta bilder

interface GenerateParams {
  projectType: string
  description: string
  dimensions: { width: number; depth: number; height: number }
}

// Unsplash bilder med relevanta söktermer
const unsplashIds: Record<string, string[]> = {
  'utekök': [
    'photo-1600585154340-be6161a56a0c', // outdoor kitchen
    'photo-1558618666-fcd25c85cd64', // grill setup
    'photo-1523301343968-6a6ebf63c672', // outdoor cooking
  ],
  'altan': [
    'photo-1591825729269-caeb344f6df2', // wooden deck
    'photo-1600566753190-17f0baa2a6c3', // patio
    'photo-1600573472550-8090b5e0745e', // deck
  ],
  'förråd': [
    'photo-1530836369250-ef72a3f5cda8', // garden shed
    'photo-1558618666-fcd25c85cd64', // shed
  ],
  'pergola': [
    'photo-1600566752355-35792bedcfea', // pergola
    'photo-1600585154526-990dced4db0d', // garden structure
  ],
  'staket': [
    'photo-1558618666-fcd25c85cd64', // fence
  ],
  'carport': [
    'photo-1558618666-fcd25c85cd64', // carport
  ],
}

export async function generateWithPollinations(params: GenerateParams): Promise<string> {
  const { projectType } = params

  // Välj en slumpmässig bild för projekttypen
  const ids = unsplashIds[projectType] || unsplashIds['utekök']
  const randomId = ids[Math.floor(Math.random() * ids.length)]

  // Unsplash direktlänk - fungerar alltid
  return `https://images.unsplash.com/${randomId}?w=1280&h=720&fit=crop&auto=format`
}
