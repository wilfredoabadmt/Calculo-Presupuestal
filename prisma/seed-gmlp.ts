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
  precioUnitario: number
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

    // Detect subcategory headers (rows without No but with text in column 4 that isn't a price)
    if (!no && !codigo && descripcion && !precio && descripcion.length > 3) {
      currentSubcategoria = descripcion
      continue
    }

    // Skip header rows and empty rows
    if (no === 'No' || no === '' || !descripcion || !unidad) continue
    if (isNaN(precio) || precio <= 0) continue

    // Skip index/header rows
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
      precioUnitario: precio,
    })
  }

  return items
}

function parseDetailedAPUs(wb: XLSX.WorkBook): GMLPItem[] {
  const ws = wb.Sheets['PRECIOS UNITARIOS']
  if (!ws) return []

  const items: GMLPItem[] = []
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][]
  const totalRows = data.length

  let i = 0
  while (i < totalRows) {
    const row = data[i] as unknown[]
    const cell0 = String(row[0] || '').trim()

    // Detect APU header: "Actividad:    XXX - XXX - DESCRIPTION"
    if (cell0.startsWith('Actividad:')) {
      const actMatch = cell0.replace('Actividad:', '').trim()
      // Extract code and description
      const parts = actMatch.split(' - ')
      const codigo = parts.length >= 2 ? parts.slice(0, 2).join(' - ').trim() : ''
      const descripcion = parts.length >= 3 ? parts.slice(2).join(' - ').trim() : actMatch

      // Next rows: Unit, Quantity
      const row1 = (data[i + 1] || []) as unknown[]
      const row2 = (data[i + 2] || []) as unknown[]
      const unidad = String(row1[0] || '').replace('Unitario:', '').trim().toLowerCase()
      const cantidad = parseFloat(String(row2[0] || '').replace('Cantidad:', '').trim()) || 1

      // Scan forward to find materials, labor, totals
      let materialesArr: { nombre: string; cantidad: number; unidad: string; precio: number }[] = []
      let manoObraArr: { oficio: string; cantidad: number }[] = []
      let precioTotal = 0
      let section = ''

      for (let j = i + 3; j < Math.min(i + 40, totalRows); j++) {
        const r = (data[j] || []) as unknown[]
        const c0 = String(r[0] || '').trim()
        const c1 = String(r[1] || '').trim()
        const c6 = String(r[6] || '').trim()
        const c7 = parseFloat(String(r[7] || '0'))

        if (c0.includes('MATERIALES')) section = 'materials'
        else if (c0.includes('MANO DE OBRA')) section = 'labor'
        else if (c0.includes('EQUIPO')) section = 'equipment'
        else if (c0.includes('GASTOS')) section = 'overhead'
        else if (c0.includes('UTILIDAD')) section = 'profit'
        else if (c0.includes('IMPUESTOS')) section = 'taxes'

        if (section === 'materials' && c1 && !c1.includes('TOTAL') && c1 !== '') {
          const matNombre = c1
          const matCantidad = parseFloat(String(r[3] || '0'))
          const matUnd = String(r[2] || '').trim().toLowerCase()
          const matPrecio = parseFloat(String(r[5] || '0'))
          if (matNombre && matCantidad > 0) {
            materialesArr.push({ nombre: matNombre, cantidad: matCantidad, unidad: matUnd, precio: matPrecio })
          }
        }

        if (section === 'labor' && c1 && c1 !== '' && !c1.includes('TOTAL') && !c1.includes('BENEFICIOS') && !c1.includes('IMPUESTO')) {
          const oficio = c1
          const cant = parseFloat(String(r[3] || '0'))
          if (oficio && cant > 0) {
            manoObraArr.push({ oficio, cantidad: cant })
          }
        }

        if (c6.includes('TOTAL IMPUESTOS') || c6.includes('TOTAL UTILIDAD')) {
          // Continue scanning for final price
        }

        if (c6 === '' && c7 > 0 && section === 'taxes') {
          // This might be the final total row
        }
      }

      // Look for the final price (usually last significant number before next APU)
      for (let j = i + 30; j < Math.min(i + 45, totalRows); j++) {
        const r = (data[j] || []) as unknown[]
        const c7 = parseFloat(String(r[7] || '0'))
        if (c7 > 0) precioTotal = c7
      }

      if (precioTotal > 0) {
        items.push({
          actividad: descripcion,
          unidad: unidad || 'global',
          cantidad,
          categoria: 'DETALLE',
          subcategoria: codigo || null,
          materiales: materialesArr.length > 0 ? JSON.stringify(materialesArr) : null,
          manoObra: manoObraArr.length > 0 ? JSON.stringify(manoObraArr) : null,
          precioUnitario: precioTotal,
        })
      }
    }

    i++
  }

  return items
}

async function main() {
  console.log('🏗️  Importando base de precios GMLP 2007...')

  const excelPath = path.join(process.cwd(), 'guia', 'Precios Unitarios - GMLP - 2007.xls')
  const wb = XLSX.readFile(excelPath)

  // Parse summary sheets
  const generales = parseCategorySheet(wb, 'GENERALES', 'GENERALIDADES')
  const estructuras = parseCategorySheet(wb, 'ESTRUCTURAS', 'ESTRUCTURAS')
  const hidraulica = parseCategorySheet(wb, 'HIDRAULICA SANITARIA', 'HIDRAULICA')
  const vias = parseCategorySheet(wb, 'VIAS URBANAS', 'VIAS_URBANAS')

  console.log(`📊 Resumen encontrados: ${generales.length} generalidades, ${estructuras.length} estructuras, ${hidraulica.length} hidráulica, ${vias.length} vías`)

  const allItems = [...generales, ...estructuras, ...hidraulica, ...vias]

  // Clear existing and re-seed
  console.log('🗑️  Limpiando banco de precios existente...')
  await prisma.bancoPrecioGMLP.deleteMany()

  console.log(`💾 Insertando ${allItems.length} items en banco de precios...`)

  // Batch insert for performance
  const batchSize = 200
  let inserted = 0
  for (let i = 0; i < allItems.length; i += batchSize) {
    const batch = allItems.slice(i, i + batchSize)
    try {
      await prisma.bancoPrecioGMLP.createMany({ data: batch })
      inserted += batch.length
    } catch {
      // If batch fails, insert one by one skipping duplicates
      for (const item of batch) {
        try {
          await prisma.bancoPrecioGMLP.create({ data: item })
          inserted++
        } catch { /* skip */ }
      }
    }
    if ((i / batchSize) % 10 === 0) {
      console.log(`   → ${Math.min(i + batchSize, allItems.length)}/${allItems.length} procesados (${inserted} insertados)`)
    }
  }

  const total = await prisma.bancoPrecioGMLP.count()
  console.log(`✅ Importación completada: ${total} items en banco de precios GMLP`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
