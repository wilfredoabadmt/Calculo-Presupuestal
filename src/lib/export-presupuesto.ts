import * as XLSX from 'xlsx'

interface CapituloData {
  codigo: number
  nombre: string
  partidas: {
    codigo: string
    descripcion: string
    unidad: string
    precioBase: number
    mediciones: {
      veces: number
      largo: number
      ancho: number
      alto: number
      parcial: number
      precioUnitario: number
      costoTotal: number
    }[]
  }[]
}

interface PresupuestoData {
  empresaNombre?: string
  empresaDireccion?: string
  empresaCif?: string
  clienteNombre?: string
  clienteDireccion?: string
  clientePoblacion?: string
  clienteCif?: string
  proyectoNombre?: string
  fechaEmision?: string
  codigoPresupuesto?: string
  porcentajeBI: number
  porcentajeIVA: number
  capitulos: CapituloData[]
}

export function generarExcelPresupuesto(data: PresupuestoData): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()

  // ===== HOJA INFORME (Presupuesto Detallado) =====
  const informeData: any[][] = []

  // Encabezado empresa
  informeData.push(['', data.empresaNombre || ''])
  informeData.push(['', data.empresaDireccion || ''])
  informeData.push(['', data.empresaCif || ''])
  informeData.push([])

  // Datos cliente
  informeData.push(['CLIENTE:', data.clienteNombre || '', 'FECHA:', data.fechaEmision || ''])
  informeData.push(['OBRA:', data.proyectoNombre || ''])
  informeData.push([])

  // Título
  informeData.push(['', '', 'MEDICIONES Y PRESUPUESTO'])
  informeData.push([])

  // Encabezados de columna
  informeData.push(['PARTIDA', 'UD', 'CONCEPTO', 'CANT.', 'LARGO', 'ANCHO', 'ALTO', 'PARCIAL', 'PRECIO', 'TOTAL'])

  let currentRow = 13 // Fila donde empiezan los datos (0-indexed)
  const subtotalesInfo: { row: number; capitulo: string }[] = []

  // Datos por capítulo
  for (const capitulo of data.capitulos) {
    // Fila de capítulo
    informeData.push(['CAP.', capitulo.codigo.toString(), capitulo.nombre])
    currentRow++

    let subtotalCapitulo = 0
    const partidaStartRows: number[] = []

    for (const partida of capitulo.partidas) {
      for (const med of partida.mediciones) {
        partidaStartRows.push(currentRow)
        informeData.push([
          partida.codigo,
          partida.unidad,
          partida.descripcion,
          med.veces,
          med.largo,
          med.ancho,
          med.alto,
          '', // Parcial (fórmula)
          med.precioUnitario,
          '', // Total (fórmula)
        ])
        currentRow++
      }
    }

    // Subtotal capítulo
    informeData.push(['', '', '', '', '', '', '', '', 'SUBTOTAL', ''])
    subtotalesInfo.push({ row: currentRow, capitulo: capitulo.codigo.toString() })
    currentRow++
    currentRow++ // Fila vacía entre capítulos
  }

  // Totales finales
  informeData.push([])
  informeData.push(['', '', 'TOTAL PRESUPUESTO EJECUCION MATERIAL', '', '', '', '', '', '', ''])
  const totalMaterialRow = currentRow
  currentRow++
  informeData.push(['', '0.1', 'Gastos Generales y Beneficio Industrial', '', '', '', '', '', '', ''])
  const gastosRow = currentRow
  currentRow++
  informeData.push(['', '', 'TOTAL PRESUPUESTO EJECUCION CONTRATA', '', '', '', '', '', '', ''])
  const totalContrataRow = currentRow
  currentRow++
  informeData.push(['', '0.18', 'I.V.A.', '', '', '', '', '', '', ''])
  const ivaRow = currentRow
  currentRow++
  informeData.push(['', '', 'TOTAL PRESUPUESTO DE CONTRATA', '', '', '', '', '', '', ''])
  const totalFinalRow = currentRow

  const wsInforme = XLSX.utils.aoa_to_sheet(informeData)

  // Agregar fórmulas para parciales y totales
  // Las filas de datos empiezan en la fila 14 (índice 13)
  let dataRow = 14
  for (const capitulo of data.capitulos) {
    dataRow++ // Fila de capítulo
    for (const partida of capitulo.partidas) {
      for (const _med of partida.mediciones) {
        // Parcial = CANT * LARGO * ANCHO * ALTO (columnas D,E,F,G)
        const rowNum = dataRow + 1 // XLSX usa 1-based
        wsInforme['H' + rowNum] = { t: 's', f: `D${rowNum}*E${rowNum}*F${rowNum}*G${rowNum}` }
        // Total = PARCIAL * PRECIO (columnas H, I)
        wsInforme['J' + rowNum] = { t: 's', f: `H${rowNum}*I${rowNum}` }
        dataRow++
      }
    }
    dataRow++ // Subtotal
    dataRow++ // Vacía
  }

  // Configurar anchos de columna
  wsInforme['!cols'] = [
    { wch: 10 }, // PARTIDA
    { wch: 5 },  // UD
    { wch: 50 }, // CONCEPTO
    { wch: 8 },  // CANT
    { wch: 8 },  // LARGO
    { wch: 8 },  // ANCHO
    { wch: 8 },  // ALTO
    { wch: 10 }, // PARCIAL
    { wch: 10 }, // PRECIO
    { wch: 12 }, // TOTAL
  ]

  XLSX.utils.book_append_sheet(wb, wsInforme, 'INFORME')

  // ===== HOJA RESUMEN =====
  const resumenData: any[][] = []

  resumenData.push(['', data.empresaNombre || ''])
  resumenData.push(['', data.empresaDireccion || ''])
  resumenData.push(['', data.empresaCif || ''])
  resumenData.push([])
  resumenData.push(['CLIENTE:', data.clienteNombre || '', '', '', 'FECHA:', data.fechaEmision || ''])
  resumenData.push(['OBRA:', data.proyectoNombre || ''])
  resumenData.push([])
  resumenData.push(['', '', 'RESUMEN DE PRESUPUESTO'])
  resumenData.push([])
  resumenData.push(['CAP.', 'DESCRIPCION', '', '', '', 'TOTAL CAPITULO'])

  let resumenRow = 10
  const resumenSubtotalRows: number[] = []

  for (const capitulo of data.capitulos) {
    resumenData.push([capitulo.codigo.toString(), capitulo.nombre, '', '', '', ''])
    resumenSubtotalRows.push(resumenRow)
    resumenRow++
  }

  resumenData.push([])
  resumenData.push(['', '', '', '', '', ''])
  const resumenTotalMaterialRow = resumenRow
  resumenRow++
  resumenData.push(['0.1', 'Gastos Generales y Beneficio Industrial', '', '', '', ''])
  const resumenBIRow = resumenRow
  resumenRow++
  resumenData.push(['0.18', 'I.V.A.', '', '', '', ''])
  const resumenIVARow = resumenRow
  resumenRow++
  resumenData.push(['', 'TOTAL PRESUPUESTO DE CONTRATA', '', '', '', ''])
  const resumenTotalRow = resumenRow

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)

  wsResumen['!cols'] = [
    { wch: 8 },  // CAP
    { wch: 45 }, // DESCRIPCION
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 15 }, // TOTAL
  ]

  XLSX.utils.book_append_sheet(wb, wsResumen, 'RESUMEN')

  return wb
}

export function descargarExcel(wb: XLSX.WorkBook, nombreArchivo: string) {
  const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
