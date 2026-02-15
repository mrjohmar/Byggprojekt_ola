interface BuildStep {
  step: number
  title: string
  description: string
}

const steps: Record<string, BuildStep[]> = {
  'utekök': [
    {
      step: 1,
      title: 'Markera och gräv',
      description: 'Markera ut området med snöre och pinnar. Gräv bort grässvålen och lägg singel/makadam för dränering.'
    },
    {
      step: 2,
      title: 'Sätt plintar',
      description: 'Placera betongplintarna i ett rutnät (ca 60-80cm mellan). Använd vattenpass för att få allt i nivå.'
    },
    {
      step: 3,
      title: 'Bygg golvram',
      description: 'Montera golvreglar på plintarna. Fäst med vinkelbeslag. Kontrollera att allt är i vinkel med snickarvinkeln.'
    },
    {
      step: 4,
      title: 'Res stolpar och stomme',
      description: 'Skruva fast stolparna i golvramens hörn. Montera horisontella reglar för bänkstöd och eventuell överhylla.'
    },
    {
      step: 5,
      title: 'Montera bänkskiva',
      description: 'Lägg bänkskivan på stommen. Markera och skär ut hål för diskho och ev. grillinbyggnad.'
    },
    {
      step: 6,
      title: 'Installera diskho och grill',
      description: 'Fäst diskho underifrån med clips. Placera grillen i sin öppning. Anslut vatten och gas/el vid behov.'
    },
    {
      step: 7,
      title: 'Klä in och ytbehandla',
      description: 'Klä in stommen med panel eller låt reglar synas. Behandla trä med olja eller lasyr för att skydda mot väder.'
    }
  ],

  'altan': [
    {
      step: 1,
      title: 'Markera och gräv',
      description: 'Markera ytans hörn med pinnar och snöre. Gräv bort grässvål och jämna till marken.'
    },
    {
      step: 2,
      title: 'Sätt plintar',
      description: 'Placera plintar i rätt position. Max 60cm mellan plintar på längden, max 120cm på tvären.'
    },
    {
      step: 3,
      title: 'Montera bärläkt',
      description: 'Lägg upp bärläkt (golvbalkar) på plintarna. Använd pallklossar för nivåjustering. Fäst med vinkelbeslag.'
    },
    {
      step: 4,
      title: 'Lägg trall',
      description: 'Börja vid husväggen. Lägg trallbrädor med 5-8mm mellanrum. Förborra och skruva 2 skruvar per bärläkt.'
    },
    {
      step: 5,
      title: 'Montera kantlist',
      description: 'Skruva fast kantlist runt altanen för att dölja ändträet.'
    },
    {
      step: 6,
      title: 'Ytbehandla',
      description: 'Behandla obehandlad trall med terrassolja. Tryckimpregnerat kan lämnas obehandlat.'
    }
  ],

  'förråd': [
    {
      step: 1,
      title: 'Förbered grunden',
      description: 'Markera yta, gräv bort grässvål, lägg ut markduk och singel för dränering.'
    },
    {
      step: 2,
      title: 'Sätt plintar eller platta',
      description: 'Placera plintar i hörn och mitt. Alternativt gjut en enkel platta.'
    },
    {
      step: 3,
      title: 'Bygg golvram',
      description: 'Montera syll på plintarna med förankring. Lägg in golvbjälkar.'
    },
    {
      step: 4,
      title: 'Res väggstomme',
      description: 'Förbered väggsektioner liggande och res dem en i taget. Börja med bakvägg.'
    },
    {
      step: 5,
      title: 'Montera takstolar',
      description: 'Placera takstolarna med rätt c/c-avstånd. Skruva fast i hammarband.'
    },
    {
      step: 6,
      title: 'Lägg tak',
      description: 'Montera råspont eller takplywood. Lägg takpapp och täck med plåt eller shingel.'
    },
    {
      step: 7,
      title: 'Klä väggar',
      description: 'Montera vindskydd och panel. Sätt foder runt dörr och fönster.'
    },
    {
      step: 8,
      title: 'Måla och slutför',
      description: 'Grundmåla och täckmåla utvändigt. Montera dörrbeslag, hängrännor etc.'
    }
  ],

  'pergola': [
    {
      step: 1,
      title: 'Markera stolppositioner',
      description: 'Markera ut de 4 stolppositionerna. Kontrollera att det är exakt i vinkel med 3-4-5-metoden.'
    },
    {
      step: 2,
      title: 'Förbered stolpfästen',
      description: 'Gjut ner stolpskor eller markskruvar. Låt härda minst 24 timmar innan belastning.'
    },
    {
      step: 3,
      title: 'Montera stolpar',
      description: 'Fäst stolparna i stolpskorna. Använd vattenpass och temporärt stöd tills hammarbandet sitter.'
    },
    {
      step: 4,
      title: 'Montera hammarband',
      description: 'Skruva fast hammarbanden (de övre bärande reglarna) i stolparna med vinkeljärn eller genombultning.'
    },
    {
      step: 5,
      title: 'Lägg takreglar',
      description: 'Montera takreglar på hammarbanden med jämnt avstånd (ca 50-60cm). Skruva snett eller använd vinkelbeslag.'
    },
    {
      step: 6,
      title: 'Ytbehandla',
      description: 'Olja eller lasera träet för att skydda mot väder. Upprepa vartannat år.'
    }
  ],

  'staket': [
    {
      step: 1,
      title: 'Markera stolppositioner',
      description: 'Slå ner pinnar var 2 meter längs staketlinjen. Kontrollera med snöre att linjen är rak.'
    },
    {
      step: 2,
      title: 'Gräv stolphål',
      description: 'Gräv hål ca 50cm djupa (under tjäldjup). Bred ut botten för stabilitet.'
    },
    {
      step: 3,
      title: 'Sätt stolpar',
      description: 'Placera stolpar i hålen med lite singel i botten. Justera med vattenpass och fyll med jord/betong.'
    },
    {
      step: 4,
      title: 'Montera reglar',
      description: 'Skruva fast horisontella reglar mellan stolparna - en ca 20cm från mark, en ca 20cm från topp.'
    },
    {
      step: 5,
      title: 'Sätt brädor',
      description: 'Skruva fast staketbrädorna på reglarna. Använd distansklots för jämnt avstånd.'
    },
    {
      step: 6,
      title: 'Ytbehandla',
      description: 'Måla eller lasera staketet. Tryckimpregnerat kan lämnas obehandlat men åldras grått.'
    }
  ],

  'carport': [
    {
      step: 1,
      title: 'Markera och förbered grund',
      description: 'Markera yta på minst 3x6m. Lägg ut markduk och singel, eller gjut plattor för stolpfästen.'
    },
    {
      step: 2,
      title: 'Förankra stolpar',
      description: 'Borra ner markskruvar eller gjut ner stolpskor i hörnen och vid behov mittstolpar.'
    },
    {
      step: 3,
      title: 'Res stolpar',
      description: 'Montera stolpar (minst 95x95mm) i stolpskorna. Kontrollera lod och stötta temporärt.'
    },
    {
      step: 4,
      title: 'Montera hammarband',
      description: 'Fäst hammarband (45x195 eller limträbalk) på stolparna. Kontrollera att taket får rätt fall.'
    },
    {
      step: 5,
      title: 'Lägg takbalkar',
      description: 'Montera takbalkar vinkelrätt mot hammarbandet med ca 60cm c/c.'
    },
    {
      step: 6,
      title: 'Lägg takskiva och täckmaterial',
      description: 'Montera råspont eller plywood. Täck med takpapp och plåt eller takshingel.'
    },
    {
      step: 7,
      title: 'Slutför',
      description: 'Montera vindskivor och hängrännor. Ytbehandla synligt trä.'
    }
  ]
}

const blomlådaSteps: BuildStep[] = [
  {
    step: 1,
    title: 'Förbered material',
    description: 'Köp tryckimpregnerade brädor (28x120mm) och reglar. Mät och såga till rätt längder.'
  },
  {
    step: 2,
    title: 'Bygg ramen',
    description: 'Skruva ihop sidorna till en rektangulär ram. Använd vinkelbeslag i hörnen för stabilitet.'
  },
  {
    step: 3,
    title: 'Montera botten',
    description: 'Lägg brädor i botten med mellanrum för dränering. Borra hål om du vill ha bättre vattenavrinning.'
  },
  {
    step: 4,
    title: 'Fäst markduk',
    description: 'Klä insidan med markduk för att hålla jorden på plats men släppa igenom vatten.'
  },
  {
    step: 5,
    title: 'Fyll med jord',
    description: 'Fyll med planteringsjord blandad med kompost. Lämna 5cm kant för vattning.'
  }
]

const lekstuguSteps: BuildStep[] = [
  {
    step: 1,
    title: 'Förbered grunden',
    description: 'Placera betongplattor eller plintar på plan yta. Kontrollera med vattenpass.'
  },
  {
    step: 2,
    title: 'Bygg golvram',
    description: 'Montera golvreglar på grunden. Lägg golvskiva eller brädor.'
  },
  {
    step: 3,
    title: 'Res väggarna',
    description: 'Förbered väggarna liggande och res dem en i taget. Spika ihop i hörnen.'
  },
  {
    step: 4,
    title: 'Montera tak',
    description: 'Lägg takbalkar och täck med plywood och takpapp eller shingel.'
  },
  {
    step: 5,
    title: 'Sätt dörr och fönster',
    description: 'Montera dörr och eventuella fönster. Lägg foder runt öppningarna.'
  },
  {
    step: 6,
    title: 'Måla',
    description: 'Grundmåla och täckmåla i valfria färger. Barnsäker färg rekommenderas.'
  }
]

const växthuSteps: BuildStep[] = [
  {
    step: 1,
    title: 'Förbered plats',
    description: 'Välj soligt läge. Jämna till marken och lägg eventuellt markplattor som golv.'
  },
  {
    step: 2,
    title: 'Montera ram',
    description: 'Följ tillverkarens instruktioner för att montera aluminiumramen eller träkonstruktionen.'
  },
  {
    step: 3,
    title: 'Sätt glasskivor/plast',
    description: 'Montera väggpaneler och tak av glas, polykarbonat eller plastfolie.'
  },
  {
    step: 4,
    title: 'Installera ventilation',
    description: 'Montera takfönster eller ventilationsluckor för luftcirkulation.'
  },
  {
    step: 5,
    title: 'Inredning',
    description: 'Sätt upp hyllor, bänkar och eventuellt bevattningssystem.'
  }
]

export function getBuildSteps(projectType: string): BuildStep[] {
  if (projectType === 'blomlåda') return blomlådaSteps
  if (projectType === 'lekstuga') return lekstuguSteps
  if (projectType === 'växthus') return växthuSteps
  if (projectType === 'övrigt') return [] // Tom lista för övrigt
  return steps[projectType] || steps['utekök']
}
