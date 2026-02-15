interface Dimensions {
  width: number
  depth: number
  height: number
}

interface Material {
  name: string
  quantity: number
  unit: string
  price: number
}

// Prisuppskattningar (SEK) - uppdateras vid behov
const PRICES = {
  regel_45x95: 45, // per meter
  regel_45x145: 65,
  regel_45x195: 85,
  plint_betong: 150, // per styck
  skruv_5x80: 0.8, // per styck
  skruv_5x50: 0.5,
  vinkel: 15,
  bänkskiva_betong: 800, // per m²
  bänkskiva_trä: 400,
  trall_28x120: 55, // per meter
}

export function calculateMaterials(projectType: string, dim: Dimensions): Material[] {
  const materials: Material[] = []

  if (projectType === 'utekök') {
    return calculateOutdoorKitchen(dim)
  }
  if (projectType === 'altan') {
    return calculateDeck(dim)
  }
  if (projectType === 'förråd') {
    return calculateShed(dim)
  }
  if (projectType === 'pergola') {
    return calculatePergola(dim)
  }
  if (projectType === 'staket') {
    return calculateFence(dim)
  }
  if (projectType === 'carport') {
    return calculateCarport(dim)
  }
  if (projectType === 'blomlåda') {
    return calculatePlanterBox(dim)
  }
  if (projectType === 'lekstuga') {
    return calculatePlayhouse(dim)
  }
  if (projectType === 'växthus') {
    return calculateGreenhouse(dim)
  }

  // Fallback - grundläggande stomme
  return calculateBasicFrame(dim)
}

function calculateOutdoorKitchen(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  const materials: Material[] = []

  // Plintar (var 80cm)
  const plintRows = Math.ceil(depth / 0.8) + 1
  const plintCols = Math.ceil(width / 0.8) + 1
  const plintar = plintRows * plintCols
  materials.push({
    name: 'Betongplint 200x200',
    quantity: plintar,
    unit: 'st',
    price: plintar * PRICES.plint_betong
  })

  // Golvreglar
  const golvReglarAntal = Math.ceil(width / 0.6) + 1
  const golvReglarLängd = depth
  materials.push({
    name: 'Regel 45x145 (golv)',
    quantity: Math.ceil(golvReglarAntal * golvReglarLängd * 1.1),
    unit: 'm',
    price: Math.ceil(golvReglarAntal * golvReglarLängd * 1.1) * PRICES.regel_45x145
  })

  // Stolpar
  const stolpar = 4 + Math.floor(width / 1.2)
  const stolpHöjd = height
  materials.push({
    name: 'Regel 45x95 (stolpar)',
    quantity: Math.ceil(stolpar * stolpHöjd * 1.1),
    unit: 'm',
    price: Math.ceil(stolpar * stolpHöjd * 1.1) * PRICES.regel_45x95
  })

  // Bänkskiva
  const bänkArea = width * depth
  materials.push({
    name: 'Bänkskiva (betong/komposit)',
    quantity: Math.ceil(bänkArea * 10) / 10,
    unit: 'm²',
    price: Math.ceil(bänkArea * PRICES.bänkskiva_betong)
  })

  // Reglar för stomme
  const stomReglar = (width * 2 + depth * 2) * 2 // Över och under
  materials.push({
    name: 'Regel 45x95 (stomme)',
    quantity: Math.ceil(stomReglar * 1.1),
    unit: 'm',
    price: Math.ceil(stomReglar * 1.1) * PRICES.regel_45x95
  })

  // Skruv
  const skruvAntal = Math.ceil((plintar * 4) + (golvReglarAntal * 6) + (stolpar * 8) + 100)
  materials.push({
    name: 'Skruv 5x80mm rostfri',
    quantity: skruvAntal,
    unit: 'st',
    price: Math.ceil(skruvAntal * PRICES.skruv_5x80)
  })

  // Vinklar
  const vinklar = stolpar * 2 + golvReglarAntal * 2
  materials.push({
    name: 'Vinkelbeslag',
    quantity: vinklar,
    unit: 'st',
    price: vinklar * PRICES.vinkel
  })

  return materials
}

function calculateDeck(dim: Dimensions): Material[] {
  const { width, depth } = dim
  const materials: Material[] = []
  const area = width * depth

  // Plintar
  const plintar = Math.ceil(area / 2) + 4
  materials.push({
    name: 'Betongplint 200x200',
    quantity: plintar,
    unit: 'st',
    price: plintar * PRICES.plint_betong
  })

  // Bärläkt
  const bärläktAntal = Math.ceil(width / 0.6) + 1
  materials.push({
    name: 'Regel 45x145 (bärläkt)',
    quantity: Math.ceil(bärläktAntal * depth * 1.1),
    unit: 'm',
    price: Math.ceil(bärläktAntal * depth * 1.1) * PRICES.regel_45x145
  })

  // Trall
  const trallMeter = Math.ceil(area / 0.12 * 1.1) // 120mm bredd
  materials.push({
    name: 'Trall 28x120 tryckimpregnerad',
    quantity: trallMeter,
    unit: 'm',
    price: trallMeter * PRICES.trall_28x120
  })

  // Skruv
  const skruv = Math.ceil(area * 25)
  materials.push({
    name: 'Trallskruv 5x50 rostfri',
    quantity: skruv,
    unit: 'st',
    price: Math.ceil(skruv * PRICES.skruv_5x50)
  })

  return materials
}

function calculateShed(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  const materials: Material[] = []

  // Plintar
  const plintar = 6
  materials.push({
    name: 'Betongplint 200x200',
    quantity: plintar,
    unit: 'st',
    price: plintar * PRICES.plint_betong
  })

  // Syll
  const syll = (width + depth) * 2
  materials.push({
    name: 'Regel 45x145 (syll)',
    quantity: Math.ceil(syll * 1.1),
    unit: 'm',
    price: Math.ceil(syll * 1.1) * PRICES.regel_45x145
  })

  // Stolpar
  const stolpar = 4 + Math.ceil((width + depth) / 1.2) * 2
  materials.push({
    name: 'Regel 45x95 (stolpar)',
    quantity: Math.ceil(stolpar * height * 1.1),
    unit: 'm',
    price: Math.ceil(stolpar * height * 1.1) * PRICES.regel_45x95
  })

  // Takreglar
  materials.push({
    name: 'Regel 45x195 (takstolar)',
    quantity: Math.ceil(width * 3),
    unit: 'm',
    price: Math.ceil(width * 3) * PRICES.regel_45x195
  })

  // Skruv
  materials.push({
    name: 'Skruv 5x80mm',
    quantity: 300,
    unit: 'st',
    price: 300 * PRICES.skruv_5x80
  })

  return materials
}

function calculatePergola(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  const materials: Material[] = []

  // Stolpar
  const stolpar = 4
  materials.push({
    name: 'Stolpe 95x95 tryckimpregnerad',
    quantity: Math.ceil(stolpar * (height + 0.5) * 1.1),
    unit: 'm',
    price: Math.ceil(stolpar * (height + 0.5) * 1.1) * 120
  })

  // Hammarband
  materials.push({
    name: 'Regel 45x195 (hammarband)',
    quantity: Math.ceil((width + depth) * 2 * 1.1),
    unit: 'm',
    price: Math.ceil((width + depth) * 2 * 1.1) * PRICES.regel_45x195
  })

  // Takreglar
  const takreglar = Math.ceil(width / 0.6)
  materials.push({
    name: 'Regel 45x145 (takreglar)',
    quantity: Math.ceil(takreglar * depth * 1.1),
    unit: 'm',
    price: Math.ceil(takreglar * depth * 1.1) * PRICES.regel_45x145
  })

  // Stolpfötter
  materials.push({
    name: 'Stolpsko justerbar',
    quantity: 4,
    unit: 'st',
    price: 4 * 250
  })

  // Skruv
  materials.push({
    name: 'Skruv 5x80mm rostfri',
    quantity: 150,
    unit: 'st',
    price: 150 * PRICES.skruv_5x80
  })

  return materials
}

function calculateFence(dim: Dimensions): Material[] {
  const { width, height } = dim // width = längd på staketet
  const materials: Material[] = []

  // Stolpar var 2 meter
  const stolpar = Math.ceil(width / 2) + 1
  materials.push({
    name: 'Stolpe 70x70 tryckimpregnerad',
    quantity: Math.ceil(stolpar * (height + 0.5) * 1.1),
    unit: 'm',
    price: Math.ceil(stolpar * (height + 0.5) * 1.1) * 80
  })

  // Reglar (2 st per sektion)
  materials.push({
    name: 'Regel 45x95',
    quantity: Math.ceil(width * 2 * 1.1),
    unit: 'm',
    price: Math.ceil(width * 2 * 1.1) * PRICES.regel_45x95
  })

  // Brädor
  const brädor = Math.ceil(width / 0.12) // 120mm per bräda
  materials.push({
    name: 'Staketbräda 22x120',
    quantity: Math.ceil(brädor * height * 1.1),
    unit: 'm',
    price: Math.ceil(brädor * height * 1.1) * 35
  })

  // Skruv
  materials.push({
    name: 'Skruv 4x50mm rostfri',
    quantity: brädor * 4,
    unit: 'st',
    price: brädor * 4 * 0.4
  })

  return materials
}

function calculateCarport(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  const materials: Material[] = []

  // Stolpar (minst 4, fler vid större bredd)
  const stolpar = width > 4 ? 6 : 4
  materials.push({
    name: 'Stolpe 95x95 tryckimpregnerad',
    quantity: Math.ceil(stolpar * (height + 0.5) * 1.1),
    unit: 'm',
    price: Math.ceil(stolpar * (height + 0.5) * 1.1) * 120
  })

  // Stolpskor
  materials.push({
    name: 'Stolpsko justerbar',
    quantity: stolpar,
    unit: 'st',
    price: stolpar * 250
  })

  // Hammarband
  materials.push({
    name: 'Limträbalk 56x180',
    quantity: Math.ceil(width * 2 * 1.1),
    unit: 'm',
    price: Math.ceil(width * 2 * 1.1) * 150
  })

  // Takbalkar
  const takbalkar = Math.ceil(width / 0.6)
  materials.push({
    name: 'Regel 45x195 (takbalkar)',
    quantity: Math.ceil(takbalkar * depth * 1.1),
    unit: 'm',
    price: Math.ceil(takbalkar * depth * 1.1) * PRICES.regel_45x195
  })

  // Takskiva
  const takArea = width * depth
  materials.push({
    name: 'Takplywood 18mm',
    quantity: Math.ceil(takArea * 1.1),
    unit: 'm²',
    price: Math.ceil(takArea * 1.1) * 180
  })

  // Takpapp
  materials.push({
    name: 'Takpapp YEP 2500',
    quantity: Math.ceil(takArea * 1.2),
    unit: 'm²',
    price: Math.ceil(takArea * 1.2) * 45
  })

  // Takplåt
  materials.push({
    name: 'Takplåt trapets',
    quantity: Math.ceil(takArea * 1.1),
    unit: 'm²',
    price: Math.ceil(takArea * 1.1) * 120
  })

  // Skruv
  materials.push({
    name: 'Skruv 5x80mm rostfri',
    quantity: 200,
    unit: 'st',
    price: 200 * PRICES.skruv_5x80
  })

  return materials
}

function calculatePlanterBox(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  const materials: Material[] = []

  // Brädor för sidor
  const sidLängd = (width * 2 + depth * 2) * Math.ceil(height / 0.12)
  materials.push({
    name: 'Bräda 28x120 tryckimpregnerad',
    quantity: Math.ceil(sidLängd * 1.1),
    unit: 'm',
    price: Math.ceil(sidLängd * 1.1) * 45
  })

  // Hörnreglar
  materials.push({
    name: 'Regel 45x45 tryckimpregnerad',
    quantity: Math.ceil(4 * height * 1.1),
    unit: 'm',
    price: Math.ceil(4 * height * 1.1) * 30
  })

  // Bottenbräder
  const bottenArea = width * depth
  materials.push({
    name: 'Bräda 22x95 (botten)',
    quantity: Math.ceil(bottenArea / 0.1 * 1.1),
    unit: 'm',
    price: Math.ceil(bottenArea / 0.1 * 1.1) * 25
  })

  // Markduk
  materials.push({
    name: 'Markduk',
    quantity: Math.ceil((width * depth + (width + depth) * 2 * height) * 1.2),
    unit: 'm²',
    price: Math.ceil((width * depth + (width + depth) * 2 * height) * 1.2) * 15
  })

  // Skruv
  materials.push({
    name: 'Skruv 4x50mm rostfri',
    quantity: Math.ceil(sidLängd * 2),
    unit: 'st',
    price: Math.ceil(sidLängd * 2) * 0.4
  })

  return materials
}

function calculatePlayhouse(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  const materials: Material[] = []

  // Grund
  materials.push({
    name: 'Betongplatta 40x40',
    quantity: 4,
    unit: 'st',
    price: 4 * 50
  })

  // Golvreglar
  const golvReglar = (width + depth) * 2 + Math.ceil(width / 0.4) * depth
  materials.push({
    name: 'Regel 45x95',
    quantity: Math.ceil(golvReglar * 1.1),
    unit: 'm',
    price: Math.ceil(golvReglar * 1.1) * PRICES.regel_45x95
  })

  // Golvskiva
  materials.push({
    name: 'Plywood 12mm',
    quantity: Math.ceil(width * depth * 1.1),
    unit: 'm²',
    price: Math.ceil(width * depth * 1.1) * 120
  })

  // Väggstolpar
  const stolpar = 4 + Math.ceil((width + depth) / 0.8) * 2
  materials.push({
    name: 'Regel 45x70 (stolpar)',
    quantity: Math.ceil(stolpar * height * 1.1),
    unit: 'm',
    price: Math.ceil(stolpar * height * 1.1) * 35
  })

  // Panel
  const väggArea = (width + depth) * 2 * height
  materials.push({
    name: 'Fasadpanel spontad',
    quantity: Math.ceil(väggArea * 1.15),
    unit: 'm²',
    price: Math.ceil(väggArea * 1.15) * 150
  })

  // Tak
  materials.push({
    name: 'Plywood 9mm (tak)',
    quantity: Math.ceil(width * depth * 1.2),
    unit: 'm²',
    price: Math.ceil(width * depth * 1.2) * 90
  })

  materials.push({
    name: 'Takshingel',
    quantity: Math.ceil(width * depth * 1.3),
    unit: 'm²',
    price: Math.ceil(width * depth * 1.3) * 80
  })

  // Dörr och fönster
  materials.push({
    name: 'Dörr (barnstorlek)',
    quantity: 1,
    unit: 'st',
    price: 500
  })

  materials.push({
    name: 'Litet fönster',
    quantity: 1,
    unit: 'st',
    price: 300
  })

  // Färg
  materials.push({
    name: 'Utomhusfärg',
    quantity: Math.ceil(väggArea / 8),
    unit: 'liter',
    price: Math.ceil(väggArea / 8) * 200
  })

  // Skruv
  materials.push({
    name: 'Skruv diverse',
    quantity: 200,
    unit: 'st',
    price: 200 * 0.6
  })

  return materials
}

function calculateGreenhouse(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  const materials: Material[] = []

  // Markplattor
  const markArea = width * depth
  materials.push({
    name: 'Markplatta 40x40',
    quantity: Math.ceil(markArea / 0.16),
    unit: 'st',
    price: Math.ceil(markArea / 0.16) * 30
  })

  // Ram/stomme (beroende på typ)
  const ramLängd = (width + depth) * 2 * 2 + height * 4
  materials.push({
    name: 'Aluminiumram/träram',
    quantity: Math.ceil(ramLängd * 1.1),
    unit: 'm',
    price: Math.ceil(ramLängd * 1.1) * 80
  })

  // Glasskivor/polykarbonat
  const väggArea = (width + depth) * 2 * height
  const takArea = width * depth
  materials.push({
    name: 'Kanalplast/polykarbonat 10mm',
    quantity: Math.ceil((väggArea + takArea) * 1.1),
    unit: 'm²',
    price: Math.ceil((väggArea + takArea) * 1.1) * 180
  })

  // Dörr
  materials.push({
    name: 'Växthusddörr',
    quantity: 1,
    unit: 'st',
    price: 1200
  })

  // Ventilation
  materials.push({
    name: 'Takfönster ventilation',
    quantity: Math.ceil(width / 2),
    unit: 'st',
    price: Math.ceil(width / 2) * 400
  })

  // Hyllor
  materials.push({
    name: 'Hyllplan aluminium',
    quantity: Math.ceil(width * 2),
    unit: 'm',
    price: Math.ceil(width * 2) * 120
  })

  return materials
}

function calculateBasicFrame(dim: Dimensions): Material[] {
  const { width, depth, height } = dim
  return [
    {
      name: 'Regel 45x95',
      quantity: Math.ceil((width + depth) * 4 * 1.1),
      unit: 'm',
      price: Math.ceil((width + depth) * 4 * 1.1) * PRICES.regel_45x95
    },
    {
      name: 'Skruv 5x80mm',
      quantity: 100,
      unit: 'st',
      price: 100 * PRICES.skruv_5x80
    }
  ]
}
