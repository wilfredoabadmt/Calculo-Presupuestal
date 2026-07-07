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

  // ===== PASO 1: Construir arrays de datos =====

  // --- HOJA INFORME ---
  const informeData: any[][] = []

  informeData.push(['', data.empresaNombre || ''])
  informeData.push(['', data.empresaDireccion || ''])
  informeData.push(['', data.empresaCif || ''])
  informeData.push([])
  informeData.push(['CLIENTE:', data.clienteNombre || '', 'FECHA:', data.fechaEmision || ''])
  informeData.push(['OBRA:', data.proyectoNombre || ''])
  informeData.push([])
  informeData.push(['', '', 'MEDICIONES Y PRESUPUESTO'])
  informeData.push([])
  informeData.push(['PARTIDA', 'UD', 'CONCEPTO', 'CANT.', 'LARGO', 'ANCHO', 'ALTO', 'PARCIAL', 'PRECIO', 'TOTAL'])

  let currentRow = 13
  const subtotalesInfo: { row: number; capitulo: string }[] = []

  for (const capitulo of data.capitulos) {
    informeData.push(['CAP.', capitulo.codigo.toString(), capitulo.nombre])
    currentRow++

    for (const partida of capitulo.partidas) {
      for (const med of partida.mediciones) {
        informeData.push([
          partida.codigo,
          partida.unidad,
          partida.descripcion,
          med.veces,
          med.largo,
          med.ancho,
          med.alto,
          '',
          med.precioUnitario,
          '',
        ])
        currentRow++
      }
    }

    informeData.push(['', '', '', '', '', '', '', '', 'SUBTOTAL', ''])
    subtotalesInfo.push({ row: currentRow, capitulo: capitulo.codigo.toString() })
    currentRow++
    currentRow++
  }

  informeData.push([])
  informeData.push(['', '', 'TOTAL PRESUPUESTO EJECUCION MATERIAL', '', '', '', '', '', '', ''])
  const totalMaterialRow = currentRow
  currentRow++
  informeData.push(['', '', 'Gastos Generales y Beneficio Industrial', '', '', '', '', '', '', ''])
  const gastosRow = currentRow
  currentRow++
  informeData.push(['', '', 'TOTAL PRESUPUESTO EJECUCION CONTRATA', '', '', '', '', '', '', ''])
  const totalContrataRow = currentRow
  currentRow++
  informeData.push(['', '', 'I.V.A.', '', '', '', '', '', '', ''])
  const ivaRow = currentRow
  currentRow++
  informeData.push(['', '', 'TOTAL PRESUPUESTO CONTRATADO', '', '', '', '', '', '', ''])
  const totalFinalRow = currentRow

  // --- HOJA RESUMEN ---
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
  const resumenCapituloRows: number[] = []

  for (const capitulo of data.capitulos) {
    resumenData.push([capitulo.codigo.toString(), capitulo.nombre, '', '', '', ''])
    resumenCapituloRows.push(resumenRow)
    resumenRow++
  }

  resumenData.push([])
  resumenData.push(['', '', '', '', '', ''])
  const resumenTotalMaterialRow = resumenRow
  resumenRow++
  resumenData.push(['', 'Gastos Generales y Beneficio Industrial', '', '', '', ''])
  const resumenBIRow = resumenRow
  resumenRow++
  resumenData.push(['', 'I.V.A.', '', '', '', ''])
  const resumenIVARow = resumenRow
  resumenRow++
  resumenData.push(['', 'TOTAL PRESUPUESTO CONTRATADO', '', '', '', ''])
  const resumenTotalRow = resumenRow

  // ===== PASO 2: Crear hojas =====
  const wsInforme = XLSX.utils.aoa_to_sheet(informeData)
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)

  // ===== PASO 3: Agregar fórmulas a INFORME =====

  // Fórmulas por fila de datos: parcial, total, subtotales
  let dataRow = 14
  const subtotalRows: number[] = []

  for (const capitulo of data.capitulos) {
    dataRow++
    const partidaRows: number[] = []

    for (const _partida of capitulo.partidas) {
      for (const _med of _partida.mediciones) {
        wsInforme['H' + dataRow] = { t: 'n', f: `D${dataRow}*E${dataRow}*F${dataRow}*G${dataRow}` }
        wsInforme['J' + dataRow] = { t: 'n', f: `H${dataRow}*I${dataRow}` }
        partidaRows.push(dataRow)
        dataRow++
      }
    }

    subtotalRows.push(dataRow)
    if (partidaRows.length > 0) {
      wsInforme['J' + dataRow] = { t: 'n', f: partidaRows.map(r => `J${r}`).join('+') }
    }
    dataRow++
    dataRow++
  }

  // Fórmulas de totales finales del INFORME
  // Total Material = suma de subtotales
  if (subtotalRows.length > 0) {
    wsInforme['J' + (totalMaterialRow + 1)] = { t: 'n', f: subtotalRows.map(r => `J${r}`).join('+') }
  }
  // BI = Total Material * BI%
  wsInforme['J' + (gastosRow + 1)] = { t: 'n', f: `ROUND(J${totalMaterialRow + 1}*${data.porcentajeBI}/100,2)` }
  // Base Imponible = Total Material + BI
  wsInforme['J' + (totalContrataRow + 1)] = { t: 'n', f: `J${totalMaterialRow + 1}+J${gastosRow + 1}` }
  // IVA = Base Imponible * IVA%
  wsInforme['J' + (ivaRow + 1)] = { t: 'n', f: `ROUND(J${totalContrataRow + 1}*${data.porcentajeIVA}/100,2)` }
  // Total = Base Imponible + IVA
  wsInforme['J' + (totalFinalRow + 1)] = { t: 'n', f: `J${totalContrataRow + 1}+J${ivaRow + 1}` }

  // ===== PASO 4: Agregar fórmulas a RESUMEN =====

  // Total Material = referencia cruzada a INFORME
  if (subtotalRows.length > 0) {
    wsResumen['F' + (resumenTotalMaterialRow + 1)] = {
      t: 'n',
      f: subtotalRows.map(r => `'INFORME'!J${r}`).join('+'),
    }
  }
  // BI = Total Material * BI%
  wsResumen['F' + (resumenBIRow + 1)] = {
    t: 'n',
    f: `ROUND(F${resumenTotalMaterialRow + 1}*${data.porcentajeBI}/100,2)`,
  }
  // IVA = (Total Material + BI) * IVA%
  wsResumen['F' + (resumenIVARow + 1)] = {
    t: 'n',
    f: `ROUND((F${resumenTotalMaterialRow + 1}+F${resumenBIRow + 1})*${data.porcentajeIVA}/100,2)`,
  }
  // Total = Total Material + BI + IVA
  wsResumen['F' + (resumenTotalRow + 1)] = {
    t: 'n',
    f: `F${resumenTotalMaterialRow + 1}+F${resumenBIRow + 1}+F${resumenIVARow + 1}`,
  }

  // ===== PASO 5: Configurar anchos de columna =====
  wsInforme['!cols'] = [
    { wch: 10 },
    { wch: 5 },
    { wch: 50 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
  ]

  wsResumen['!cols'] = [
    { wch: 8 },
    { wch: 45 },
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 15 },
  ]

  XLSX.utils.book_append_sheet(wb, wsInforme, 'INFORME')
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
