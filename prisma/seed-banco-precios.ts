import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'

const prisma = new PrismaClient()

interface BancoPrecioItem {
  codigo: string | null
  actividad: string
  unidad: string
  cantidad: number
  categoria: string
  subcategoria: string | null
  materiales: string | null
  manoObra: string | null
  beneficiosSociales: number
  iva: number
  equipoMaquinaria: number
  gastosGenerales: number
  utilidad: number
  it: number
  precioUnitario: number
}

interface MaterialItem {
  nombre: string
  unidad: string
  cantidad: number
  precioUnitario: number
  costoTotal: number
}

interface LaborItem {
  oficio: string
  unidad: string
  cantidad: number
  precioUnitario: number
  costoTotal: number
}

function cleanText(str: string): string {
  return str
    .replace(/gmlp/gi, '')
    .replace(/ham\s+la\s+paz/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function determineSubcategory(codigo: string): string | null {
  if (!codigo) return null
  const prefix = codigo.split('-')[0].trim().toUpperCase()
  
  if (['DEM', 'DES', 'PIC', 'REM', 'RET', 'SEL'].includes(prefix)) return 'Demolición y Preparación'
  if (['INS', 'LET', 'REP'].includes(prefix)) return 'Obras Preliminares'
  if (['EXC', 'COR', 'MOV', 'REL'].includes(prefix)) return 'Movimiento de Tierras'
  if (['CIM', 'SOB', 'EMP', 'PIE'].includes(prefix)) return 'Cimentaciones'
  if (['COL', 'VIG', 'LOS', 'ESC', 'MAM', 'MUR', 'PAR'].includes(prefix)) return 'Obra Gruesa'
  if (['REV', 'ENL', 'CIE', 'PIS', 'ZOC'].includes(prefix)) return 'Revoques y Pisos'
  if (['CUB', 'TEJ', 'CHP', 'CUM', 'BAJ'].includes(prefix)) return 'Cubiertas y Drenajes'
  if (['PUE', 'VEN', 'MAR', 'CER', 'BAR', 'MES'].includes(prefix)) return 'Carpintería y Cerrajería'
  if (['PIN'].includes(prefix)) return 'Pinturas'
  if (['TUB', 'CAM', 'SUM', 'CAN', 'VAL', 'LLA', 'POZ'].includes(prefix)) return 'Instalación Hidrosanitaria'
  if (['LUM', 'CON', 'TAB', 'CAB'].includes(prefix)) return 'Instalación Eléctrica'
  if (['ADO', 'PAV', 'JUN', 'ASF'].includes(prefix)) return 'Pavimentos y Vías'
  
  return 'Otros'
}

function parseCategorySheet(
  wb: XLSX.WorkBook,
  sheetName: string,
  categoria: string
): BancoPrecioItem[] {
  const ws = wb.Sheets[sheetName]
  if (!ws) return []

  const items: BancoPrecioItem[] = []
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][]

  let currentSubcategoria = ''

  for (let i = 0; i < data.length; i++) {
    const row = data[i] as unknown[]
    const no = String(row[0] || '').trim()
    const codigo = String(row[2] || '').trim()
    const descripcion = String(row[4] || '').trim()
    const unidad = String(row[5] || '').trim()
    const precio = parseFloat(String(row[6] || '0'))

    if (!no && !codigo && descripcion && !precio && descripcion.length > 3) {
      currentSubcategoria = cleanText(descripcion)
      continue
    }

    if (no === 'No' || no === '' || !descripcion || !unidad) continue
    if (isNaN(precio) || precio <= 0) continue
    if (descripcion.includes('INDICE DE PRECIOS') || descripcion.includes('OBRAS PRELIMINARES') ||
        descripcion.includes('ESTRUCTURAS') || descripcion.includes('HIDRAULICA') ||
        descripcion.includes('VIAS URBANAS') || descripcion.includes('PRECIO UNITARIO')) continue

    items.push({
      codigo: codigo ? cleanText(codigo) : null,
      actividad: cleanText(descripcion),
      unidad: unidad.toLowerCase(),
      cantidad: 1,
      categoria,
      subcategoria: (currentSubcategoria ? cleanText(currentSubcategoria) : null) || (codigo ? determineSubcategory(codigo) : null),
      materiales: null,
      manoObra: null,
      beneficiosSociales: 71.18,
      iva: 14.94,
      equipoMaquinaria: 5,
      gastosGenerales: 11,
      utilidad: 7,
      it: 3.09,
      precioUnitario: precio,
    })
  }

  return items
}

function parseDetailedAPUs(wb: XLSX.WorkBook): Map<string, { materiales: MaterialItem[], manoObra: LaborItem[], desglose: Record<string, number> }> {
  const ws = wb.Sheets['PRECIOS UNITARIOS']
  if (!ws) return new Map()

  const detailedData = new Map<string, { materiales: MaterialItem[], manoObra: LaborItem[], desglose: Record<string, number> }>()
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][]
  const totalRows = data.length

  let i = 0
  while (i < totalRows) {
    const row = data[i] as unknown[]
    const cell0 = String(row[0] || '').trim()

    if (cell0.startsWith('Actividad:')) {
      const actMatch = cell0.replace('Actividad:', '').trim()
      const parts = actMatch.split(' - ')
      const codigo = parts.length >= 2 ? parts.slice(0, 2).join(' - ').trim() : ''
      const descripcion = parts.length >= 3 ? parts.slice(2).join(' - ').trim() : actMatch

      const cleanedCodigo = cleanText(codigo)
      const cleanedDescripcion = cleanText(descripcion)

      const key = `${cleanedCodigo}::${normalizeKey(cleanedDescripcion)}`

      let materialesArr: MaterialItem[] = []
      let manoObraArr: LaborItem[] = []
      let desglose: Record<string, number> = {}

      let section = ''
      for (let j = i + 3; j < Math.min(i + 60, totalRows); j++) {
        const r = (data[j] || []) as unknown[]
        const c0 = String(r[0] || '').trim()
        const c1 = String(r[1] || '').trim()
        const c2 = String(r[2] || '').trim()
        const c3 = parseFloat(String(r[3] || '0'))
        const c5 = parseFloat(String(r[5] || '0'))
        const c6 = String(r[6] || '').trim()
        const c7 = parseFloat(String(r[7] || '0'))

        // Detect sections
        if (c0.includes('1.-') || c1.includes('MATERIALES')) section = 'materials'
        else if (c0.includes('2.-') || c1.includes('MANO DE OBRA')) section = 'labor'
        else if (c0.includes('3.-') || c1.includes('EQUIPO')) section = 'equipment'
        else if (c0.includes('4.-') || c1.includes('GASTOS GENERALES')) section = 'overhead'
        else if (c0.includes('5.-') || c1.includes('UTILIDAD')) section = 'profit'
        else if (c0.includes('6.-') || c1.includes('IMPUESTOS')) section = 'taxes'

        // Capture totals
        if (c6.includes('TOTAL MATERIALES')) desglose.totalMateriales = c7
        else if (c6.includes('TOTAL MANO DE OBRA')) desglose.totalManoObra = c7
        else if (c6.includes('TOTAL EQUIPO')) desglose.totalEquipo = c7
        else if (c6.includes('TOTAL GASTOS')) desglose.totalGastosGenerales = c7
        else if (c6.includes('TOTAL UTILIDAD')) desglose.totalUtilidad = c7
        else if (c6.includes('TOTAL IMPUESTOS')) desglose.totalImpuestos = c7
        else if (c6.includes('TOTAL PRECIO UNITARIO')) desglose.totalPrecioUnitario = c7

        // Capture percentage rates
        if (c1.includes('BENEFICIOS SOCIALES')) {
          const rate = parseFloat(String(r[6] || '0'))
          if (rate > 0) desglose.tasaBeneficios = rate * 100
        }
        if (c1.includes('IMPUESTO AL VALOR AGREGADO')) {
          const rate = parseFloat(String(r[6] || '0'))
          if (rate > 0) desglose.tasaIVA = rate * 100
        }
        if (c1.includes('HERRAMIENTAS')) {
          const rate = parseFloat(String(r[6] || '0'))
          if (rate > 0) desglose.tasaHerramientas = rate * 100
        }
        if (c1.includes('GASTOS GENERALES') && c1.includes('%')) {
          const rate = parseFloat(String(r[6] || '0'))
          if (rate > 0) desglose.tasaGastosGenerales = rate * 100
        }
        if (c1.includes('UTILIDAD') && c1.includes('%')) {
          const rate = parseFloat(String(r[6] || '0'))
          if (rate > 0) desglose.tasaUtilidad = rate * 100
        }
        if (c1.includes('IMPUESTO A LAS TRANSACCIONES')) {
          const rate = parseFloat(String(r[6] || '0'))
          if (rate > 0) desglose.tasaIT = rate * 100
        }

        // Capture materials
        if (section === 'materials' && c1 && c2 && !c1.includes('TOTAL') && c1 !== '' && c3 > 0) {
          const precio = c5 > 0 ? c5 : parseFloat(String(r[6] || '0'))
          const costoTotal = parseFloat(String(r[7] || '0'))
          materialesArr.push({
            nombre: cleanText(c1),
            unidad: c2.toLowerCase(),
            cantidad: c3,
            precioUnitario: precio,
            costoTotal: costoTotal || c3 * precio,
          })
        }

        // Capture labor
        if (section === 'labor' && c1 && c2 && !c1.includes('TOTAL') && !c1.includes('BENEFICIOS') &&
            !c1.includes('IMPUESTO') && !c1.includes('%') && c3 > 0) {
          const precio = c5 > 0 ? c5 : parseFloat(String(r[6] || '0'))
          const costoTotal = parseFloat(String(r[7] || '0'))
          manoObraArr.push({
            oficio: cleanText(c1),
            unidad: c2.toLowerCase(),
            cantidad: c3,
            precioUnitario: precio,
            costoTotal: costoTotal || c3 * precio,
          })
        }
      }

      detailedData.set(key, { materiales: materialesArr, manoObra: manoObraArr, desglose })
    }

    i++
  }

  return detailedData
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/\s+/g, ' ').trim()
}

const groupPrefixes: Record<string, string> = {
  CEMENTO: 'CEM',
  AGREGADOS: 'AGR',
  ACERO: 'ACE',
  BLOQUE: 'BLO',
  CERAMICA: 'CER',
  TEJA: 'TEJ',
  MADERA: 'MAD',
  PINTURA: 'PIN',
  ADHESIVO: 'ADH',
  BOQUILLA: 'BOQ',
  BOVEDILLA: 'BOV',
  AGUA: 'AGU',
  DRYWALL: 'DRY',
  OTROS: 'MAT'
}

function determineMaterialGroup(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('cemento') || n.includes('yeso') || n.includes('cal')) return 'CEMENTO'
  if (n.includes('arena') || n.includes('grava') || n.includes('piedra') || n.includes('tierra') || n.includes('cascote') || n.includes('arcilla')) return 'AGREGADOS'
  if (n.includes('fierro') || n.includes('acero') || n.includes('alambre') || n.includes('malla') || n.includes('clavo') || n.includes('perfil') || n.includes('vigueta') || n.includes('omega') || n.includes('canal') || n.includes('parante') || n.includes('angulo')) return 'ACERO'
  if (n.includes('bloque') || n.includes('ladrillo') || n.includes('adobe')) return 'BLOQUE'
  if (n.includes('ceramica') || n.includes('porcelanato') || n.includes('azulejo') || n.includes('mosaico') || n.includes('piso')) return 'CERAMICA'
  if (n.includes('teja') || n.includes('calamina') || n.includes('chapa') || n.includes('lamina')) return 'TEJA'
  if (n.includes('madera') || n.includes('pino') || n.includes('tablon') || n.includes('mara') || n.includes('venesta') || n.includes('puntal')) return 'MADERA'
  if (n.includes('pintura') || n.includes('esmalte') || n.includes('latex') || n.includes('barniz') || n.includes('tinercito') || n.includes('tiner')) return 'PINTURA'
  if (n.includes('adhesivo') || n.includes('clefa') || n.includes('cola') || n.includes('pegamento')) return 'ADHESIVO'
  if (n.includes('boquilla')) return 'BOQUILLA'
  if (n.includes('bovedilla')) return 'BOVEDILLA'
  if (n.includes('agua')) return 'AGUA'
  if (n.includes('drywall') || n.includes('placa')) return 'DRYWALL'
  return 'OTROS'
}


async function main() {
  console.log('🏗️  Importando base de precios referenciales 2007...')

  const excelPath = path.join(process.cwd(), 'guia', 'actualizacion', 'PreciosUnitarios2007.xls')
  const wb = XLSX.readFile(excelPath)

  // Parse summary sheets
  const generales = parseCategorySheet(wb, 'GENERALES', 'GENERALES')
  const estructuras = parseCategorySheet(wb, 'ESTRUCTURAS', 'ESTRUCTURAS')
  const hidraulica = parseCategorySheet(wb, 'HIDRAULICA SANITARIA', 'HIDRAULICA')
  const vias = parseCategorySheet(wb, 'VIAS URBANAS', 'VIAS_URBANAS')

  console.log(`📊 Resumen: ${generales.length} generales, ${estructuras.length} estructuras, ${hidraulica.length} hidráulica, ${vias.length} vías`)

  const allItems = [...generales, ...estructuras, ...hidraulica, ...vias]
  console.log(`📊 Total items resumen: ${allItems.length}`)

  // Parse detailed APU sheet
  console.log('📖 Parseando hoja PRECIOS UNITARIOS (detallados)...')
  const detailedData = parseDetailedAPUs(wb)
  console.log(`📖 ${detailedData.size} APUs detallados encontrados`)

  // Merge detailed data into summary items
  let mergedCount = 0
  for (const item of allItems) {
    const itemCode = cleanText(item.codigo || '')
    const itemDesc = cleanText(item.actividad)
    const lookupKey = `${itemCode}::${normalizeKey(itemDesc)}`

    let bestMatch = detailedData.get(lookupKey) || null

    // Fallback 1: match by code only
    if (!bestMatch && itemCode) {
      const detailEntries = Array.from(detailedData.entries())
      for (const [key, detail] of detailEntries) {
        const [detailCode] = key.split('::')
        if (detailCode === itemCode) {
          bestMatch = detail
          break
        }
      }
    }

    // Fallback 2: match by description only
    if (!bestMatch) {
      const detailEntries = Array.from(detailedData.entries())
      const normalizedItemDesc = normalizeKey(itemDesc)
      for (const [key, detail] of detailEntries) {
        const [, detailDesc] = key.split('::')
        if (detailDesc === normalizedItemDesc) {
          bestMatch = detail
          break
        }
      }
    }

    // Fallback 3: index fallback
    if (!bestMatch) {
      const idx = allItems.indexOf(item)
      const detailKeys = Array.from(detailedData.keys())
      if (idx < detailKeys.length) {
        bestMatch = detailedData.get(detailKeys[idx]) || null
      }
    }

    if (bestMatch) {
      item.materiales = bestMatch.materiales.length > 0 ? JSON.stringify(bestMatch.materiales) : null
      item.manoObra = bestMatch.manoObra.length > 0 ? JSON.stringify(bestMatch.manoObra) : null

      if (bestMatch.desglose.tasaBeneficios) item.beneficiosSociales = bestMatch.desglose.tasaBeneficios
      if (bestMatch.desglose.tasaIVA) item.iva = bestMatch.desglose.tasaIVA
      if (bestMatch.desglose.tasaHerramientas) item.equipoMaquinaria = bestMatch.desglose.tasaHerramientas
      if (bestMatch.desglose.tasaGastosGenerales) item.gastosGenerales = bestMatch.desglose.tasaGastosGenerales
      if (bestMatch.desglose.tasaUtilidad) item.utilidad = bestMatch.desglose.tasaUtilidad
      if (bestMatch.desglose.tasaIT) item.it = bestMatch.desglose.tasaIT

      mergedCount++
    }
  }

  console.log(`🔗 ${mergedCount} items con datos detallados mergeados`)

  // Deduplicate items to prevent 100% identical duplicates
  const uniqueItems: BancoPrecioItem[] = []
  const seenItems = new Set<string>()

  for (const item of allItems) {
    const key = `${item.categoria}_${item.codigo || ''}_${item.actividad}_${item.precioUnitario}`
    if (!seenItems.has(key)) {
      seenItems.add(key)
      uniqueItems.push(item)
    }
  }

  console.log(`🧹 Filtrados ${allItems.length - uniqueItems.length} duplicados exactos. Ítems únicos a insertar: ${uniqueItems.length}`)

  // Extract and seed unique materials from detailed APUs
  console.log('📦 Extrayendo materiales únicos de los análisis de precios...')
  const uniqueExcelMaterials = new Map<string, { nombre: string; unidad: string; precio: number }>()
  
  for (const detail of detailedData.values()) {
    for (const mat of detail.materiales) {
      const name = mat.nombre.trim()
      const unit = mat.unidad.trim()
      const price = mat.precioUnitario
      
      if (name && unit && !isNaN(price)) {
        const key = `${name.toLowerCase()}::${unit.toLowerCase()}`
        if (!uniqueExcelMaterials.has(key)) {
          uniqueExcelMaterials.set(key, { nombre: name, unidad: unit, precio: price })
        } else {
          // Keep the highest price for the same material
          const existing = uniqueExcelMaterials.get(key)!
          if (price > existing.precio) {
            existing.precio = price
          }
        }
      }
    }
  }
  
  console.log(`📊 ${uniqueExcelMaterials.size} materiales únicos encontrados en el Excel.`)

  // Load existing materials in DB to prevent duplicates
  const existingMaterials = await prisma.material.findMany()
  const existingNames = new Set(existingMaterials.map(m => m.nombre.toLowerCase().trim()))
  const existingCodes = new Set(existingMaterials.map(m => m.codigo.toLowerCase().trim()))

  // Suffix counter for prefixes
  const prefixCounters = new Map<string, number>()
  for (const m of existingMaterials) {
    const match = m.codigo.match(/^([A-Z]+)-(\d+)$/)
    if (match) {
      const prefix = match[1]
      const num = parseInt(match[2], 10)
      const currentMax = prefixCounters.get(prefix) || 0
      if (num > currentMax) {
        prefixCounters.set(prefix, num)
      }
    }
  }

  const newMaterialsToInsert: any[] = []
  
  for (const mat of uniqueExcelMaterials.values()) {
    const nameNorm = mat.nombre.toLowerCase().trim()
    if (!existingNames.has(nameNorm)) {
      const grupo = determineMaterialGroup(mat.nombre)
      const prefix = groupPrefixes[grupo] || 'MAT'
      
      const nextNum = (prefixCounters.get(prefix) || 0) + 1
      prefixCounters.set(prefix, nextNum)
      
      let finalCode = `${prefix}-${String(nextNum).padStart(3, '0')}`
      let offset = 0
      while (existingCodes.has(finalCode.toLowerCase())) {
        offset++
        finalCode = `${prefix}-${String(nextNum + offset).padStart(3, '0')}`
      }
      if (offset > 0) {
        prefixCounters.set(prefix, nextNum + offset)
      }
      existingCodes.add(finalCode.toLowerCase())
      
      newMaterialsToInsert.push({
        codigo: finalCode,
        nombre: mat.nombre,
        unidad: mat.unidad,
        precio: mat.precio,
        grupo: grupo,
        proveedor: 'Banco de Precios 2007',
        activo: true,
        descripcion: `Material importado desde APU - Banco de Precios 2007`
      })
      
      // Add to existingNames to prevent duplicates within this loop
      existingNames.add(nameNorm)
    }
  }

  if (newMaterialsToInsert.length > 0) {
    console.log(`💾 Insertando ${newMaterialsToInsert.length} nuevos materiales en el catálogo...`)
    const matBatchSize = 100
    for (let i = 0; i < newMaterialsToInsert.length; i += matBatchSize) {
      const batch = newMaterialsToInsert.slice(i, i + matBatchSize)
      await prisma.material.createMany({ data: batch })
    }
    console.log(`✅ ${newMaterialsToInsert.length} nuevos materiales insertados exitosamente.`)
  } else {
    console.log('ℹ️ No hay nuevos materiales para agregar al catálogo.')
  }

  // Clear existing and re-seed
  console.log('🗑️  Limpiando banco de precios existente...')
  await prisma.bancoPrecio.deleteMany()


  console.log(`💾 Insertando ${uniqueItems.length} items en banco de precios...`)

  // Batch insert for performance
  const batchSize = 100
  let inserted = 0
  for (let i = 0; i < uniqueItems.length; i += batchSize) {
    const batch = uniqueItems.slice(i, i + batchSize)
    try {
      await prisma.bancoPrecio.createMany({ data: batch })
      inserted += batch.length
    } catch (e) {
      // Fallback to individual insert if batch fails
      for (const item of batch) {
        try {
          await prisma.bancoPrecio.create({ data: item })
          inserted++
        } catch (err) { /* skip */ }
      }
    }
    if ((i / batchSize) % 5 === 0) {
      console.log(`   → ${Math.min(i + batchSize, uniqueItems.length)}/${uniqueItems.length} procesados (${inserted} insertados)`)
    }
  }

  const total = await prisma.bancoPrecio.count()
  const withMaterials = await prisma.bancoPrecio.count({ where: { materiales: { not: null } } })
  const withLabor = await prisma.bancoPrecio.count({ where: { manoObra: { not: null } } })

  console.log(`\n✅ Importación completada:`)
  console.log(`   Total items: ${total}`)
  console.log(`   Con materiales detallados: ${withMaterials}`)
  console.log(`   Con mano de obra detallada: ${withLabor}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
