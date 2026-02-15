# Byggprojekt-planerare - Koncept

## Användarnas största problem (från forum)
- Vet inte hur mycket material som behövs
- Svårt att visualisera utan CAD-kunskap
- Oklart vilken ordning saker ska göras
- Bygglovsregler förvirrande
- Måste använda 4-5 olika verktyg idag

---

## Flöde: 5 enkla steg

```
┌─────────────────────────────────────────────────────────────────┐
│  STEG 1: LADDA UPP BILD                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │         📷 Dra & släpp bild på platsen                  │   │
│  │            eller ta foto direkt                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEG 2: BESKRIV PROJEKTET                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  "Utekök med grill, diskho och arbetsbänk"              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Snabbval:  [Utekök] [Altan] [Förråd] [Pergola] [Staket]       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEG 3: RITA I BILDEN                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Bild visas här]                                       │   │
│  │                                                         │   │
│  │   ┌──────────┐  <-- Ritat område (grön)                 │   │
│  │   │  HÄR!    │                                          │   │
│  │   └──────────┘                                          │   │
│  │              ⚠️ <-- Markerad begränsning (röd)          │   │
│  │           (vattenledning)                               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Verktyg:  [🖊️ Rita område] [📏 Mät] [⚠️ Begränsning] [💬 Notera]│
│                                                                 │
│  Ange mått:  Bredd [___] m   Djup [___] m   Höjd [___] m       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEG 4: SE VISUELLA FÖRSLAG (renderade i din bild)            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │   [ANVÄNDARENS FOTO MED 3D-RENDERAT UTEKÖK INLAGT]      │   │
│  │                                                         │   │
│  │   ╔═══════════════╗                                     │   │
│  │   ║   ┌─────┐     ║  <-- AI-genererat utekök            │   │
│  │   ║   │GRILL│ ░░░ ║      renderat på plats              │   │
│  │   ║   └─────┘     ║                                     │   │
│  │   ║ ┌──────────┐  ║                                     │   │
│  │   ║ │ DISKHO   │  ║                                     │   │
│  │   ║ └──────────┘  ║                                     │   │
│  │   ╚═══════════════╝                                     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│     ◀ Förslag 1/3 ▶      [L-form]  ~15 000 kr                  │
│                                                                 │
│  Justera:  [Rotera] [Flytta] [Ändra storlek] [Byt material]    │
│                                                                 │
│  💡 "Med dina mått behövs inget bygglov"                        │
└─────────────────────────────────────────────────────────────────┘

Användaren ser sitt eget foto med uteköket renderat på den plats
de ritade. Kan bläddra mellan förslag och justera direkt i bilden.
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEG 5: BYGGBESKRIVNING + MATERIALLISTA                       │
│                                                                 │
│  📋 Steg-för-steg                    🛒 Material               │
│  ┌─────────────────────────────┐    ┌─────────────────────────┐│
│  │ □ 1. Markera & gräv         │    │ Reglar 45x95   12 st   ││
│  │ □ 2. Sätt plintar           │    │ Reglar 45x145   8 st   ││
│  │ □ 3. Montera stomme         │    │ Skruv 5x80    200 st   ││
│  │ □ 4. Bänkskiva              │    │ Betongplintar   4 st   ││
│  │ □ 5. Installera diskho      │    │ Bänkskiva       1 st   ││
│  │ □ 6. Montera grill          │    │ ...                    ││
│  └─────────────────────────────┘    └─────────────────────────┘│
│                                                                 │
│  [📥 Ladda ner PDF]  [📧 Skicka till butik]  [💰 Se priser]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Nyckel-funktioner

### Visuell rendering i fotot
- AI tolkar fotot (perspektiv, ljus, skuggor)
- Renderar 3D-modell av förslaget direkt i bilden
- Matchar ljussättning så det ser realistiskt ut
- Användaren SER hur det kommer se ut på sin tomt
- Kan rotera, flytta, ändra - ser uppdatering live

### Whiteboard på bild
- Rita rektanglar/former för placering
- Markera hinder (träd, rör, el)
- Dra linjer för att mäta
- Klistra noteringar

### AI-genererade förslag
- Baserat på beskrivning + ritning + mått
- 2-3 layoutalternativ
- Prisuppskattning per förslag
- Anpassar sig efter markerade begränsningar

### Automatisk bygglovskoll
- Frågar: Kommun? Mått? Avstånd till tomt?
- Svarar: "Kräver anmälan" / "Inget bygglov" / "Kräver bygglov"

### Materiallista som funkar
- Exakta antal (inkl. 10% spill)
- Länka till Byggmax/Beijer/Bauhaus
- Exportera till PDF eller skicka direkt

---

## Projekttyper att stödja

| Projekt | Vanliga frågor i forum |
|---------|------------------------|
| Utekök | Gastillförsel, bänkhöjd, tak? |
| Altan | Plintavstånd, golvbrädor, räcke |
| Förråd | Bygglov, grund, takvinkel |
| Pergola | Stolpförankring, dimensioner |
| Staket | Stolpavstånd, höjd, sekretess |
| Växthus | Placering, ventilation |
| Carport | Mått, snölast, bygglov |

---

## Teknik-stack (förenklad)

```
Frontend:        React/Next.js + Canvas för ritning
Bild-AI:         GPT-4 Vision / Claude för att tolka foto & perspektiv
3D-rendering:    Three.js för att lägga in 3D-objekt i fotot
                 ELLER generativ AI (typ DALL-E/Midjourney inpainting)
Generering:      Bibliotek av färdiga 3D-moduler (utekök, altaner etc)
                 + AI som kombinerar baserat på input
Materialkalkyl:  Databas med standardmått + formler
Priser:          API till byggvaruhus (eller manuellt)
```

### Två vägar för visuell rendering:

**Alt 1: 3D-bibliotek (snabbare, mer exakt)**
- Färdiga 3D-modeller av utekök, altaner, etc
- Three.js placerar in i fotot baserat på ritad yta
- Användaren kan rotera/ändra i realtid
- Exakt koppling till materiallista

**Alt 2: AI-genererad bild (mer realistiskt)**
- Skicka foto + beskrivning till bildgenererings-AI
- Får tillbaka fotot med uteköket "målat in"
- Ser mer verkligt ut men svårare att justera
- Kan kombineras med Alt 1

---

## MVP - Första version

1. Ladda upp bild
2. Rita område + ange mått
3. Välj projekttyp (dropdown)
4. Få EN layout + materiallista
5. Ladda ner som PDF

Allt annat = senare versioner.
