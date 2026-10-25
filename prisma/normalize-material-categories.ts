import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function classifyMaterial(name: string): { grupo: string; subcategoria: string } {
  const n = name.toLowerCase().trim()

  // 1. Cerrajería (chapas de puerta, cerraduras, bisagras, candados, jaladores, picaportes)
  if (
    n.includes('chapa') ||
    n.includes('cerradura') ||
    n.includes('candado') ||
    n.includes('bisagra') ||
    n.includes('picaporte') ||
    n.includes('pestillo') ||
    n.includes('aldaba') ||
    n.includes('jalador') ||
    n.includes('manija') ||
    n.includes('tirador') ||
    n.includes('cerrojo') ||
    n.includes('pasador')
  ) {
    return { grupo: 'CERRAJERIA', subcategoria: 'Cerraduras y Herrajes' }
  }

  // 2. Teja (tejas cerámicas, coloniales, españolas, francesas, romanas, cumbreras de teja)
  if (n.includes('teja') || (n.includes('cumbrera') && !n.includes('calamina') && !n.includes('zinc'))) {
    return { grupo: 'TEJA', subcategoria: 'Tejas y Cumbreras' }
  }

  // 3. Vidrios (vidrio plano, doble, triple, catedral, templado, espejos)
  if (n.includes('vidrio') || n.includes('espejo')) {
    return { grupo: 'VIDRIOS', subcategoria: 'Vidrios y Cristales' }
  }

  // 4. Hidrosanitario / Plomería / Tuberías
  if (
    (n.includes('tanque') && !n.includes('pintura')) ||
    n.includes('tuberia') ||
    n.includes('tubería') ||
    n.includes('tubo') ||
    n.includes('codo') ||
    (n.includes('tee') && !n.includes('bisagra')) ||
    n.includes('grifo') ||
    n.includes('griferia') ||
    n.includes('grifería') ||
    n.includes('valvula') ||
    n.includes('válvula') ||
    n.includes('llave de paso') ||
    n.includes('inodoro') ||
    n.includes('lavamanos') ||
    n.includes('lavanderia') ||
    n.includes('lavadero') ||
    n.includes('ducha') ||
    n.includes('sifon') ||
    n.includes('sifón') ||
    n.includes('rejilla') ||
    n.includes('alcantarill') ||
    n.includes('sumidero') ||
    n.includes('boca de tormenta') ||
    n.includes('sanitario') ||
    (n.includes('pvc') && !n.includes('manta')) ||
    n.includes('pileta') ||
    n.includes('polietileno para agua') ||
    n.includes('flotador')
  ) {
    return { grupo: 'HIDROSANITARIO', subcategoria: 'Tuberías y Grifería' }
  }

  // 5. Electricidad
  if (
    (n.includes('cable') && !n.includes('acero')) ||
    n.includes('conductor') ||
    n.includes('disyuntor') ||
    n.includes('termomagnetico') ||
    n.includes('termomagnético') ||
    n.includes('tomacorriente') ||
    n.includes('interruptor') ||
    n.includes('enchufe') ||
    n.includes('luminaria') ||
    n.includes('foco') ||
    n.includes('fluorescente') ||
    n.includes('caja de paso') ||
    n.includes('caja plastica') ||
    n.includes('electrico') ||
    n.includes('eléctrico') ||
    n.includes('aislante')
  ) {
    return { grupo: 'ELECTRICIDAD', subcategoria: 'Instalaciones Eléctricas' }
  }

  // 6. Porcelanato
  if (n.includes('porcelanato')) {
    return { grupo: 'PORCELANATO', subcategoria: 'Porcelanatos y Esmaltados' }
  }

  // 7. Cerámica y Revestimientos
  if (
    n.includes('ceramica') ||
    n.includes('cerámico') ||
    n.includes('ceramico') ||
    n.includes('azulejo') ||
    n.includes('mosaico') ||
    n.includes('baldosa') ||
    n.includes('granito') ||
    n.includes('marmol') ||
    (n.includes('piso') && !n.includes('falso') && !n.includes('contrapiso') && !n.includes('vibrador'))
  ) {
    return { grupo: 'CERAMICA', subcategoria: 'Pisos y Revestimientos' }
  }

  // 8. Ladrillos
  if (
    n.includes('ladrillo') ||
    n.includes('gambote') ||
    n.includes('celosia') ||
    n.includes('celosía') ||
    n.includes('adobito')
  ) {
    return { grupo: 'LADRILLO', subcategoria: 'Ladrillos Cerámicos' }
  }

  // 9. Bloques
  if (n.includes('bloque') || n.includes('adobe')) {
    return { grupo: 'BLOQUE', subcategoria: 'Bloques de Mampostería' }
  }

  // 10. Bovedillas y Alivianamientos
  if (n.includes('bovedilla') || n.includes('plastoform')) {
    return { grupo: 'BOVEDILLA', subcategoria: 'Elementos de Entrepiso y Alivianamiento' }
  }

  // 11. Lámina / Calaminas / Hojalatería
  if (
    n.includes('calamina') ||
    n.includes('zincalum') ||
    n.includes('zinc-alum') ||
    (n.includes('galvanizad') && !n.includes('alambre') && !n.includes('tub') && !n.includes('malla')) ||
    n.includes('duralit') ||
    n.includes('onduline') ||
    n.includes('ondina') ||
    (n.includes('lamina') &&
      !n.includes('melamina') &&
      !n.includes('asfalt') &&
      !n.includes('neopreno') &&
      !n.includes('compuerta')) ||
    n.includes('canaleta') ||
    n.includes('bajante') ||
    n.includes('hojalata') ||
    n.includes('tirafondo')
  ) {
    return { grupo: 'LAMINA', subcategoria: 'Calaminas y Chapas' }
  }

  // 12. Madera y Tableros (incluyendo callapos, melaminas, etc.)
  if (
    n.includes('madera') ||
    n.includes('pino') ||
    n.includes('tablon') ||
    n.includes('tablón') ||
    n.includes('mara') ||
    n.includes('venesta') ||
    n.includes('puntal') ||
    n.includes('callapo') ||
    n.includes('melamina') ||
    n.includes('triplay') ||
    n.includes('trupan') ||
    n.includes('machimbr') ||
    n.includes('machihembr') ||
    n.includes('liston') ||
    n.includes('listón') ||
    n.includes('estaca') ||
    n.includes('parket') ||
    n.includes('parquet')
  ) {
    return { grupo: 'MADERA', subcategoria: 'Maderas y Tableros' }
  }

  // 13. Carpintería terminada (puertas, ventanas, marcos)
  if (
    n.includes('puerta') ||
    n.includes('ventana') ||
    n.includes('marco') ||
    n.includes('mampara') ||
    n.includes('pizarr') ||
    n.includes('baranda')
  ) {
    return { grupo: 'CARPINTERIA', subcategoria: 'Puertas, Ventanas y Elementos' }
  }

  // 14. Acero y Elementos Estructurales
  if (
    n.includes('cable de acero') ||
    (n.includes('grapa') && n.includes('cable')) ||
    n.includes('alambre') ||
    n.includes('malla') ||
    n.includes('clavo') ||
    n.includes('fierro') ||
    n.includes('acero') ||
    n.includes('perfil') ||
    n.includes('vigueta') ||
    n.includes('angular') ||
    n.includes('platina') ||
    n.includes('pletina') ||
    n.includes('perno') ||
    n.includes('soldadura') ||
    n.includes('electrodo') ||
    n.includes('corbatin') ||
    n.includes('corbatín') ||
    n.includes('riel') ||
    n.includes('gavion') ||
    n.includes('gavión') ||
    n.includes('colchoneta') ||
    n.includes('terramesh') ||
    n.includes('argolla') ||
    n.includes('compuerta')
  ) {
    return { grupo: 'ACERO', subcategoria: 'Acero Estructural y Fijaciones' }
  }

  // 15. Drywall
  if (
    n.includes('drywall') ||
    n.includes('panel yeso') ||
    n.includes('placa yeso') ||
    (n.includes('yeso') && n.includes('carton')) ||
    n.includes('tornillo ph') ||
    n.includes('cinta papel') ||
    (n.includes('masilla') && !n.includes('vidrio'))
  ) {
    return { grupo: 'DRYWALL', subcategoria: 'Sistemas Drywall' }
  }

  // 16. Boquillas / Fraguas para Cerámica
  if (n.includes('boquilla') || n.includes('pastina') || (n.includes('fragua') && !n.includes('fraguad'))) {
    return { grupo: 'BOQUILLA', subcategoria: 'Fraguas y Pastinas' }
  }

  // 17. Adhesivos y Pegamentos
  if (
    (n.includes('adhesivo') && !n.includes('cemento')) ||
    n.includes('clefa') ||
    n.includes('carpicola') ||
    n.includes('cola') ||
    n.includes('pegamento') ||
    n.includes('pegante')
  ) {
    return { grupo: 'ADHESIVO', subcategoria: 'Pegamentos y Adhesivos' }
  }

  // 18. Pintura y Recubrimientos
  if (
    n.includes('pintura') ||
    n.includes('esmalte') ||
    n.includes('latex') ||
    n.includes('látex') ||
    n.includes('barniz') ||
    n.includes('anticorrosiv') ||
    n.includes('oleo') ||
    n.includes('óleo') ||
    n.includes('tiner') ||
    n.includes('aguarras') ||
    n.includes('disolvente') ||
    n.includes('ocre')
  ) {
    return { grupo: 'PINTURA', subcategoria: 'Pinturas y Recubrimientos' }
  }

  // 19. Impermeabilizantes y Asfaltos
  if (
    n.includes('asfalt') ||
    n.includes('alquitran') ||
    n.includes('alquitrán') ||
    n.includes('impermeabiliz') ||
    n.includes('igol') ||
    n.includes('polietileno') ||
    n.includes('geomembrana') ||
    n.includes('geotextil') ||
    n.includes('manta de pvc') ||
    n.includes('silicona')
  ) {
    return { grupo: 'IMPERMEABILIZANTES', subcategoria: 'Impermeabilización y Asfaltos' }
  }

  // 20. Cemento y Conglomerantes
  if (
    n.includes('cemento') ||
    n.includes('estuco') ||
    n.includes('yeso') ||
    n.includes('concreto') ||
    n.includes('readymix') ||
    n.startsWith('cal ') ||
    n.endsWith(' cal') ||
    n === 'cal' ||
    n.includes(' cal ') ||
    n.includes('cal viva') ||
    n.includes('cal hidratada') ||
    n.includes('aditivo')
  ) {
    return { grupo: 'CEMENTO', subcategoria: 'Cementos y Conglomerantes' }
  }

  // 21. Agregados
  if (
    n.includes('arena') ||
    n.includes('grava') ||
    n.includes('piedra') ||
    n.includes('tierra') ||
    n.includes('cascote') ||
    n.includes('arcilla') ||
    n.includes('ripio') ||
    n.includes('gravilla')
  ) {
    return { grupo: 'AGREGADOS', subcategoria: 'Áridos y Piedras' }
  }

  // 22. Agua
  if (n.includes('agua')) {
    return { grupo: 'AGUA', subcategoria: 'Servicios de Amasado' }
  }

  return { grupo: 'OTROS', subcategoria: 'Materiales Varios' }
}

async function main() {
  console.log('🔄 Iniciando normalización exhaustiva de categorías de materiales...')

  const materiales = await prisma.material.findMany()
  console.log(`📦 Se encontraron ${materiales.length} materiales en la base de datos.`)

  let updatedCount = 0

  for (const mat of materiales) {
    // Si es uno de los materiales base del catálogo semilla inicial, conservar su grupo si ya es específico
    const baseCodes = [
      'CEM-001', 'CEM-002', 'CEM-003',
      'AGR-001', 'AGR-002', 'AGR-003', 'AGR-004', 'AGR-005', 'AGR-006',
      'AGU-001',
      'ACE-001', 'ACE-002', 'ACE-003', 'ACE-004', 'ACE-005', 'ACE-006', 'ACE-007', 'ACE-008', 'ACE-009',
      'BLO-001', 'BLO-002', 'BLO-003', 'BLO-004',
      'LAD-001', 'LAD-002',
      'TEJ-001', 'TEJ-002', 'TEJ-003',
      'LAM-001', 'LAM-002', 'LAM-003',
      'DRY-001', 'DRY-002', 'DRY-003', 'DRY-004', 'DRY-005', 'DRY-006', 'DRY-007', 'DRY-008', 'DRY-009',
      'CER-001', 'CER-002', 'CER-003',
      'POR-001', 'POR-002',
      'ADH-001', 'ADH-002',
      'BOQ-001', 'BOQ-002',
      'BOV-001', 'BOV-002',
      'MAD-001', 'MAD-002', 'MAD-003',
      'PIN-001', 'PIN-002'
    ]

    let targetGrupo = mat.grupo
    let targetSubcategoria = mat.subcategoria

    if (baseCodes.includes(mat.codigo)) {
      // Los 56 materiales base ya fueron normalizados en seed.ts
      continue
    }

    // Clasificar con las reglas exhaustivas
    const classification = classifyMaterial(mat.nombre)
    targetGrupo = classification.grupo
    targetSubcategoria = classification.subcategoria

    if (targetGrupo !== mat.grupo || targetSubcategoria !== mat.subcategoria) {
      await prisma.material.update({
        where: { id: mat.id },
        data: {
          grupo: targetGrupo,
          subcategoria: targetSubcategoria,
        },
      })
      updatedCount++
    }
  }

  console.log(`✅ Normalización completada: ${updatedCount} materiales actualizados a su categoría correcta.`)
}

main()
  .catch((e) => {
    console.error('❌ Error normalizando materiales:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
