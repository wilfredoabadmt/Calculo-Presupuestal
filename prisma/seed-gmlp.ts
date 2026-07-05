import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'

const prisma = new PrismaClient()

interface GMLPItem {
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

function parseCategorySheet(
  wb: XLSX.WorkBook,
  sheetName: string,
  categoria: string
): GMLPItem[] {
  const ws = wb.Sheets[sheetName]
  if (!ws) return []

  const items: GMLPItem[] = []
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
      currentSubcategoria = descripcion
      continue
    }

    if (no === 'No' || no === '' || !descripcion || !unidad) continue
    if (isNaN(precio) || precio <= 0) continue
    if (descripcion.includes('INDICE DE PRECIOS') || descripcion.includes('OBRAS PRELIMINARES') ||
        descripcion.includes('ESTRUCTURAS') || descripcion.includes('HIDRAULICA') ||
        descripcion.includes('VIAS URBANAS') || descripcion.includes('PRECIO UNITARIO')) continue

    items.push({
      actividad: descripcion,
      unidad: unidad.toLowerCase(),
      cantidad: 1,
      categoria,
      subcategoria: currentSubcategoria || null,
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

      // Use codigo as key to match with summary items
      const key = codigo || descripcion

      let materialesArr: MaterialItem[] = []
      let manoObraArr: LaborItem[] = []
      let desglose: Record<string, number> = {}

      let section = ''
      for (let j = i + 3; j < Math.min(i + 50, totalRows); j++) {
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

        // Capture materials (rows with description, unit, quantity, price)
        if (section === 'materials' && c1 && c2 && !c1.includes('TOTAL') && c1 !== '' && c3 > 0) {
          const precio = c5 > 0 ? c5 : parseFloat(String(r[6] || '0'))
          const costoTotal = parseFloat(String(r[7] || '0'))
          materialesArr.push({
            nombre: c1,
            unidad: c2.toLowerCase(),
            cantidad: c3,
            precioUnitario: precio,
            costoTotal: costoTotal || c3 * precio,
          })
        }

        // Capture labor (rows with profession, unit, quantity)
        if (section === 'labor' && c1 && c2 && !c1.includes('TOTAL') && !c1.includes('BENEFICIOS') &&
            !c1.includes('IMPUESTO') && !c1.includes('%') && c3 > 0) {
          const precio = c5 > 0 ? c5 : parseFloat(String(r[6] || '0'))
          const costoTotal = parseFloat(String(r[7] || '0'))
          manoObraArr.push({
            oficio: c1,
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

async function main() {
  console.log('🏗️  Importando base de precios GMLP 2007 (completa)...')

  const excelPath = path.join(process.cwd(), 'guia', 'Precios Unitarios - GMLP - 2007.xls')
  const wb = XLSX.readFile(excelPath)

  // Parse summary sheets
  const generales = parseCategorySheet(wb, 'GENERALES', 'GENERALIDADES')
  const estructuras = parseCategorySheet(wb, 'ESTRUCTURAS', 'ESTRUCTURAS')
  const hidraulica = parseCategorySheet(wb, 'HIDRAULICA SANITARIA', 'HIDRAULICA')
  const vias = parseCategorySheet(wb, 'VIAS URBANAS', 'VIAS_URBANAS')

  console.log(`📊 Resumen: ${generales.length} generalidades, ${estructuras.length} estructuras, ${hidraulica.length} hidráulica, ${vias.length} vías`)

  const allItems = [...generales, ...estructuras, ...hidraulica, ...vias]
  console.log(`📊 Total items resumen: ${allItems.length}`)

  // Parse detailed APU sheet
  console.log('📖 Parseando hoja PRECIOS UNITARIOS (detallado)...')
  const detailedData = parseDetailedAPUs(wb)
  console.log(`📖 ${detailedData.size} APU detallados encontrados`)

  // Merge detailed data into summary items
  let mergedCount = 0
  for (const item of allItems) {
    // Try to find matching detailed data by searching all detailed keys
    let bestMatch: { materiales: MaterialItem[], manoObra: LaborItem[], desglose: Record<string, number> } | null = null

    const detailEntries = Array.from(detailedData.entries())
    for (const [key, detail] of detailEntries) {
      if (item.subcategoria && key.includes(item.subcategoria.split(' - ')[0])) {
        bestMatch = detail
        break
      }
      if (normalizeKey(item.actividad).includes(normalizeKey(key).split(' - ').slice(-1)[0] || '___')) {
        bestMatch = detail
        break
      }
    }

    // Also try matching by index position (summary and detail have same order)
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

      // Apply AIU rates from detailed data
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

  // Clear existing and re-seed
  console.log('🗑️  Limpiando banco de precios existente...')
  await prisma.bancoPrecioGMLP.deleteMany()

  console.log(`💾 Insertando ${allItems.length} items en banco de precios...`)

  // Batch insert for performance
  const batchSize = 100
  let inserted = 0
  for (let i = 0; i < allItems.length; i += batchSize) {
    const batch = allItems.slice(i, i + batchSize)
    try {
      await prisma.bancoPrecioGMLP.createMany({ data: batch })
      inserted += batch.length
    } catch {
      for (const item of batch) {
        try {
          await prisma.bancoPrecioGMLP.create({ data: item })
          inserted++
        } catch { /* skip */ }
      }
    }
    if ((i / batchSize) % 5 === 0) {
      console.log(`   → ${Math.min(i + batchSize, allItems.length)}/${allItems.length} procesados (${inserted} insertados)`)
    }
  }

  const total = await prisma.bancoPrecioGMLP.count()
  const withMaterials = await prisma.bancoPrecioGMLP.count({ where: { materiales: { not: null } } })
  const withLabor = await prisma.bancoPrecioGMLP.count({ where: { manoObra: { not: null } } })

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
