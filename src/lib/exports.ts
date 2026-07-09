"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

interface ExportItem {
  codigo?: string
  tipoElemento?: string
  descripcion: string
  unidad?: string
  cantidad: number
  precioUnitario?: number
  costoTotal: number
}

const coloresPorTipo: Record<string, string> = {
  OP: "#f97316",
  OG: "#3b82f6",
  OF: "#22c55e",
}

const getTipoColor = (codigo: string, itemStr: string): string => {
  const codeUpper = (codigo || "").toUpperCase().trim()
  const itemLower = (itemStr || "").toLowerCase().trim()

  if (codeUpper.startsWith("OP")) return coloresPorTipo.OP
  if (codeUpper.startsWith("OG")) return coloresPorTipo.OG
  if (codeUpper.startsWith("OF")) return coloresPorTipo.OF

  // Semantic fallback
  if (itemLower.includes("excavac") || itemLower.includes("preliminar") || itemLower.includes("limpieza") || itemLower.includes("trazo") || itemLower.includes("replanteo") || itemLower.includes("zanja") || itemLower.includes("demolic") || itemLower.includes("faena")) {
    return coloresPorTipo.OP
  }
  if (itemLower.includes("pilar") || itemLower.includes("columna") || itemLower.includes("viga") || itemLower.includes("losa") || itemLower.includes("loza") || itemLower.includes("cimiento") || itemLower.includes("zapata") || itemLower.includes("hormigon") || itemLower.includes("concreto") || itemLower.includes("armado") || itemLower.includes("vaciado") || itemLower.includes("estructura") || itemLower.includes("sobrecimiento")) {
    return coloresPorTipo.OG
  }
  if (itemLower.includes("muro") || itemLower.includes("pared") || itemLower.includes("revoque") || itemLower.includes("yeso") || itemLower.includes("pintura") || itemLower.includes("piso") || itemLower.includes("ceramica") || itemLower.includes("acabado") || itemLower.includes("cielo") || itemLower.includes("puerta") || itemLower.includes("ventana") || itemLower.includes("revestimiento")) {
    return coloresPorTipo.OF
  }

  return "#3b82f6" // default
}

// 1. Exportar Presupuesto General (PDF)
export function exportarPDF(items: ExportItem[], titulo: string, resumen: Record<string, number>) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(titulo, 14, 22)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30)

  const tableData = items.map((item, idx) => [
    (idx + 1).toString(),
    item.codigo || item.tipoElemento || "-",
    item.descripcion,
    item.unidad || "ud",
    item.cantidad.toString(),
    item.costoTotal.toFixed(2),
  ])

  autoTable(doc, {
    startY: 35,
    head: [["#", "Código", "Descripción", "Und", "Cantidad", "Total (Bs.)"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  let y = (doc as any).lastAutoTable?.finalY + 10 || 120
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")

  for (const [key, value] of Object.entries(resumen)) {
    doc.text(`${key}: Bs. ${value.toFixed(2)}`, 14, y)
    y += 7
  }

  doc.save(`${titulo.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// 2. Exportar Presupuesto General (Excel)
export function exportarExcel(items: ExportItem[], titulo: string) {
  const data = items.map((item, idx) => ({
    "#": idx + 1,
    "Código": item.codigo || item.tipoElemento || "-",
    "Descripción": item.descripcion,
    "Unidad": item.unidad || "ud",
    "Cantidad": item.cantidad,
    "P.U. (Bs.)": item.precioUnitario || (item.costoTotal / item.cantidad),
    "Total (Bs.)": item.costoTotal,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Presupuesto")

  ws["!cols"] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 40 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
  ]

  XLSX.writeFile(wb, `${titulo.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// 3. Exportar Computos Métricos (PDF)
export function exportarComputosPDF(elementos: any[], titulo: string) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(titulo, 14, 22)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30)

  const tableData = elementos.map((e, idx) => [
    (idx + 1).toString(),
    e.tipoElemento || "-",
    e.descripcion,
    e.cantidad.toString(),
    e.dimA ? `${e.dimA}x${e.dimB || "-"}x${e.dimH || "-"}` : "-",
    e.costoTotal.toFixed(2),
  ])

  autoTable(doc, {
    startY: 35,
    head: [["#", "Tipo", "Descripción", "Cant.", "Dimensiones", "Total (Bs.)"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 197, 94] },
  })

  doc.save(`${titulo.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// Consolidar materiales de todas las partidas
export function consolidarMateriales(elementos: any[]) {
  const materialesConsolidados: Record<string, { nombre: string; cantidad: number; unidad: string; precio: number }> = {}

  elementos.forEach(e => {
    if (!e.materiales) return
    try {
      const parsed = JSON.parse(e.materiales)
      if (Array.isArray(parsed)) {
        parsed.forEach(m => {
          const key = m.nombre.toLowerCase().trim()
          if (materialesConsolidados[key]) {
            materialesConsolidados[key].cantidad += m.cantidad
            materialesConsolidados[key].precio += m.precio
          } else {
            materialesConsolidados[key] = {
              nombre: m.nombre,
              cantidad: m.cantidad,
              unidad: m.unidad,
              precio: m.precio
            }
          }
        })
      } else if (typeof parsed === "object") {
        for (const [key, value] of Object.entries(parsed)) {
          const val = value as any
          const name = key.charAt(0).toUpperCase() + key.slice(1)
          const unidad = key === "cemento" ? "bolsas" : key === "agua" ? "lt" : "m³"
          const cantidad = key === "cemento" ? val.bolsas : key === "agua" ? val.lt : val.m3
          const keyLower = name.toLowerCase().trim()
          if (materialesConsolidados[keyLower]) {
            materialesConsolidados[keyLower].cantidad += cantidad
            materialesConsolidados[keyLower].precio += val.precio
          } else {
            materialesConsolidados[keyLower] = {
              nombre: name,
              cantidad: cantidad,
              unidad: unidad,
              precio: val.precio
            }
          }
        }
      }
    } catch (err) {
      console.error("Error parsing materials:", err)
    }
  })

  return Object.values(materialesConsolidados)
}

// 4. Exportar Lista de Materiales (Excel)
export function exportarMaterialesExcelConsolidado(elementos: any[]) {
  const materiales = consolidarMateriales(elementos)
  const data = materiales.map((m, idx) => ({
    "#": idx + 1,
    "Insumo / Material": m.nombre,
    "Unidad": m.unidad,
    "Cantidad Consolidada": m.cantidad,
    "Costo Estimado (Bs.)": m.precio,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Materiales Consolidados")

  ws["!cols"] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 10 },
    { wch: 20 },
    { wch: 20 },
  ]

  XLSX.writeFile(wb, `Lista_Materiales_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// 5. Exportar Análisis de Precios Unitarios (APU PDF)
export function exportarAPUPDF(elementos: any[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Análisis de Precios Unitarios (APU)", 14, 22)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30)

  let y = 35

  elementos.forEach((e, idx) => {
    // Add page if near bottom
    if (y > 220) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`${idx + 1}. Item: ${e.descripcion} (${e.tipoElemento})`, 14, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Cantidad total: ${e.cantidad} unidades | Costo Total: Bs. ${e.costoTotal.toFixed(2)}`, 14, y)
    y += 8

    let materialsList: any[] = []
    if (e.materiales) {
      try {
        const parsed = JSON.parse(e.materiales)
        if (Array.isArray(parsed)) {
          materialsList = parsed
        } else if (typeof parsed === "object") {
          materialsList = Object.entries(parsed).map(([key, val]: any) => {
            const name = key.charAt(0).toUpperCase() + key.slice(1)
            const unidad = key === "cemento" ? "bolsas" : key === "agua" ? "lt" : "m³"
            const qty = key === "cemento" ? val.bolsas : key === "agua" ? val.lt : val.m3
            return { nombre: name, cantidad: qty, unidad, precio: val.precio }
          })
        }
      } catch {}
    }

    const tableData = materialsList.map((m, i) => [
      (i + 1).toString(),
      m.nombre,
      m.unidad,
      m.cantidad.toFixed(2),
      (m.precio / m.cantidad).toFixed(2),
      m.precio.toFixed(2),
    ])

    autoTable(doc, {
      startY: y,
      head: [["#", "Insumo / Material", "Unidad", "Cantidad", "P.U. (Bs.)", "Subtotal (Bs.)"]],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { top: y },
    })

    y = (doc as any).lastAutoTable?.finalY + 15 || y + 30
  })

  doc.save(`APU_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// 6. Exportar Resumen por Capítulos (PDF)
export function exportarCapitulosPDF(elementos: any[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Resumen por Capítulos (Análisis de Costos)", 14, 22)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30)

  // Group elements by chapter type
  const caps: Record<string, { total: number; count: number }> = {}
  let granTotal = 0
  elementos.forEach(e => {
    const key = e.tipoElemento || "OTROS"
    if (!caps[key]) caps[key] = { total: 0, count: 0 }
    caps[key].total += e.costoTotal
    caps[key].count += e.cantidad
    granTotal += e.costoTotal
  })

  const tableData = Object.entries(caps).map(([name, data], idx) => {
    const pct = granTotal > 0 ? (data.total / granTotal) * 100 : 0
    return [
      (idx + 1).toString(),
      name,
      data.count.toString(),
      data.total.toFixed(2),
      `${pct.toFixed(1)}%`
    ]
  })

  autoTable(doc, {
    startY: 35,
    head: [["#", "Capítulo / Módulo", "Cantidad Ítems", "Monto (Bs.)", "Porcentaje (%)"]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [249, 115, 22] },
  })

  let y = (doc as any).lastAutoTable?.finalY + 12 || 120
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(`Costo Total Consolidado de Módulos: Bs. ${granTotal.toFixed(2)}`, 14, y)

  doc.save(`Resumen_Capitulos_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// 7. Exportar Reporte Ejecutivo (PDF)
export function exportarEjecutivoPDF(elementos: any[], resumen: Record<string, number>, cronograma: any[]) {
  const doc = new jsPDF()

  // Header Box
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 45, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("REPORTE EJECUTIVO DE PROYECTO", 14, 20)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generado: ${new Date().toLocaleDateString("es-BO")} | Cálculo Presupuestal`, 14, 30)

  // Body content
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Resumen Financiero del Proyecto", 14, 60)

  const financieroData = Object.entries(resumen).map(([key, value]) => [key, `Bs. ${value.toFixed(2)}`])
  autoTable(doc, {
    startY: 65,
    head: [["Detalle de Costo", "Monto Estimado"]],
    body: financieroData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  })

  let nextY = (doc as any).lastAutoTable?.finalY + 15 || 120

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Planificación y Cronograma de Trabajo", 14, nextY)
  nextY += 5

  const totalActividades = cronograma.length
  const promedioProgreso = totalActividades > 0
    ? Math.round(cronograma.reduce((sum, item) => sum + (item.progreso ?? 0), 0) / totalActividades)
    : 0

  const cronoSummary = [
    ["Actividades Programadas", `${totalActividades} items`],
    ["Progreso Promedio General", `${promedioProgreso}%`],
  ]

  autoTable(doc, {
    startY: nextY,
    head: [["Métrica de Planificación", "Estado / Valor"]],
    body: cronoSummary,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [100, 116, 139] },
  })

  doc.save(`Reporte_Ejecutivo_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// 8. Exportar Cronograma (PDF) - Renderizado como Diagrama de Gantt Gráfico Completo
export function exportarCronogramaPDF(items: any[]) {
  exportarCronogramaImagen(items) // Usar la misma lógica visual de alta fidelidad para ambos botones
}

// 9. Exportar Cronograma (Excel)
export function exportarCronogramaExcel(items: any[]) {
  const data = items.map((item, idx) => ({
    "#": idx + 1,
    "Código": item.codigo || "",
    "Item": item.item || item.descripcion || "",
    "Fecha Inicio": item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString("es-BO") : "",
    "Duración (días)": item.duracion || "",
    "Fecha Fin": item.fechaFinal || item.fechaFin ? new Date(item.fechaFinal || item.fechaFin).toLocaleDateString("es-BO") : "",
    "Progreso (%)": item.progreso ?? 0,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Cronograma")

  ws["!cols"] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 35 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 15 },
  ]

  XLSX.writeFile(wb, `Cronograma_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// 10. Exportar Cronograma (Imagen - Representada como PDF Horizontal de Línea de Tiempo Gantt Completo)
export function exportarCronogramaImagen(items: any[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  // Cabecera Oscura Premium
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 297, 25, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Cronograma de Obra - Diagrama de Gantt", 15, 12)
  
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha de exportación: ${new Date().toLocaleDateString("es-BO")} | Total de Actividades: ${items.length}`, 15, 18)

  if (items.length === 0) {
    doc.setTextColor(100, 116, 139)
    doc.text("Sin actividades en el cronograma.", 15, 40)
    doc.save(`Cronograma_Gantt_${new Date().toISOString().slice(0, 10)}.pdf`)
    return
  }

  // Rango global de fechas
  const dates = items.map(i => new Date(i.fechaInicio).getTime()).concat(items.map(i => new Date(i.fechaFinal || i.fechaFin || i.fechaFinal).getTime()))
  const minTime = Math.min(...dates)
  const maxTime = Math.max(...dates)
  const allStart = new Date(minTime)
  const allEnd = new Date(maxTime)
  
  const getDiffDays = (d1: Date, d2: Date) => {
    const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
    const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
    return Math.round((t2 - t1) / (1000 * 60 * 60 * 24))
  }

  const totalRange = getDiffDays(allStart, allEnd) || 1

  // Grid de fechas y días
  const barStartX = 85
  const barMaxWidth = 170 // Ancho máximo del espacio de Gantt
  const gridEndY = 42 + items.length * 10 - 4
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  
  // Selección del intervalo de días para la cuadrícula
  let stepDays = 1
  if (totalRange > 180) stepDays = 30
  else if (totalRange > 90) stepDays = 15
  else if (totalRange > 45) stepDays = 7
  else if (totalRange > 20) stepDays = 5
  else if (totalRange > 10) stepDays = 2
  else stepDays = 1

  // Dibujar líneas verticales y cabeceras de fecha
  for (let i = 0; i <= totalRange; i += stepDays) {
    const x = barStartX + (i / totalRange) * barMaxWidth
    const currentDate = new Date(minTime + i * 24 * 60 * 60 * 1000)
    
    // Línea de cuadrícula vertical
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.35)
    doc.line(x, 35, x, gridEndY)
    
    // Rótulos de días y meses
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    const dayStr = currentDate.getDate().toString()
    doc.text(dayStr, x, 34, { align: "center" })

    // Mostrar el mes si cambia o si es el primer tick
    if (i === 0 || currentDate.getDate() === 1 || (i > 0 && new Date(minTime + (i - stepDays) * 24 * 60 * 60 * 1000).getMonth() !== currentDate.getMonth())) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8.5)
      doc.text(meses[currentDate.getMonth()], x, 29, { align: "center" })
    }
  }

  // Líneas límites horizontales de la cuadrícula
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.7)
  doc.line(barStartX, 35, barStartX + barMaxWidth, 35)
  doc.line(barStartX, gridEndY, barStartX + barMaxWidth, gridEndY)

  let y = 42

  items.forEach((item, idx) => {
    if (y > 180) {
      doc.addPage()
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 297, 15, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text("Cronograma de Obra - Diagrama de Gantt (Cont.)", 15, 9)
      y = 28
    }

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    
    // Título de la actividad con duración en días
    const nameText = `${item.codigo || ""} ${item.item || item.descripcion || ""}`
    const displayName = nameText.length > 32 ? nameText.substring(0, 32) + "..." : nameText
    const durationText = `(${item.duracion || 0}d)`
    doc.text(`${displayName} ${durationText}`, 15, y + 4.5)

    // Posición y ancho de barra Gantt staggered
    const itemStart = getDiffDays(allStart, new Date(item.fechaInicio))
    const startPercent = itemStart / totalRange
    const widthPercent = (item.duracion || 1) / totalRange

    const xPos = barStartX + (startPercent * barMaxWidth)
    const barWidth = Math.max(widthPercent * barMaxWidth, 4) // Mínimo 4mm de ancho

    // Determinar color de la leyenda
    const colorHex = getTipoColor(item.codigo, item.item || item.descripcion)
    
    const r = parseInt(colorHex.substring(1, 3), 16)
    const g = parseInt(colorHex.substring(3, 5), 16)
    const b = parseInt(colorHex.substring(5, 7), 16)

    // Dibujar fondo de barra (30% opaco / color suave)
    doc.setFillColor(Math.round(255 - (255 - r) * 0.18), Math.round(255 - (255 - g) * 0.18), Math.round(255 - (255 - b) * 0.18))
    doc.rect(xPos, y, barWidth, 6, "F")

    // Dibujar barra de progreso sólida
    doc.setFillColor(r, g, b)
    const progressWidth = barWidth * ((item.progreso ?? 0) / 100)
    if (progressWidth > 0.5) {
      doc.rect(xPos, y, progressWidth, 6, "F")
    }

    // Porcentaje de progreso a la derecha
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`${item.progreso ?? 0}%`, xPos + barWidth + 2, y + 4.5)

    y += 10
  })

  // Agregar la Leyenda al final de la página
  y = Math.min(y + 8, 185)
  doc.setDrawColor(226, 232, 240)
  doc.line(15, y, 282, y)
  y += 6

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("Leyenda de Especialidades:", 15, y + 3)

  let xLegend = 65
  const legendItems = [
    { label: "Obras Preliminares", color: coloresPorTipo.OP },
    { label: "Obra Gruesa", color: coloresPorTipo.OG },
    { label: "Obra Fina", color: coloresPorTipo.OF },
  ]

  legendItems.forEach(leg => {
    const rx = parseInt(leg.color.substring(1, 3), 16)
    const gx = parseInt(leg.color.substring(3, 5), 16)
    const bx = parseInt(leg.color.substring(5, 7), 16)

    doc.setFillColor(rx, gx, bx)
    doc.rect(xLegend, y, 4, 4, "F")
    
    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "normal")
    doc.text(leg.label, xLegend + 6, y + 3)
    
    xLegend += 50
  })

  doc.save(`Cronograma_Gantt_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// 11. Exportar Formulario B-1 (Análisis de Precios Unitarios Oficial de Licitación)
export function exportarFormularioB1PDF(
  elementos: any[],
  proyectoNombre: string,
  empresaNombre: string,
  config: {
    cargasSociales: number
    iva: number
    gastosGenerales: number
    utilidad: number
    it: number
    moneda: string
  }
) {
  const doc = new jsPDF("p", "mm", "letter")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  elementos.forEach((elemento, index) => {
    if (index > 0) doc.addPage()

    let y = 15

    // Borde de la página
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.5)
    doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin)

    // Cabecera del formulario
    doc.setFillColor(15, 23, 42)
    doc.rect(margin, margin, contentWidth, 12, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("FORMULARIO B-1: ANÁLISIS DE PRECIOS UNITARIOS OFICIAL", margin + 5, margin + 8)

    y = margin + 15
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)

    // Datos informativos en dos columnas
    doc.setFont("helvetica", "bold")
    doc.text("PROYECTO:", margin + 5, y)
    doc.setFont("helvetica", "normal")
    doc.text(proyectoNombre || "Sin nombre", margin + 30, y)

    doc.setFont("helvetica", "bold")
    doc.text("EMPRESA:", pageWidth - margin - 75, y)
    doc.setFont("helvetica", "normal")
    doc.text(empresaNombre || "Empresa Constructora", pageWidth - margin - 50, y)

    y += 5
    doc.setFont("helvetica", "bold")
    doc.text("ACTIVIDAD:", margin + 5, y)
    doc.setFont("helvetica", "normal")
    doc.text(elemento.descripcion || "Actividad de Obra", margin + 30, y)

    doc.setFont("helvetica", "bold")
    doc.text("UNIDAD:", pageWidth - margin - 75, y)
    doc.setFont("helvetica", "normal")
    doc.text(elemento.unidad || "ud", pageWidth - margin - 50, y)

    y += 5
    doc.setFont("helvetica", "bold")
    doc.text("CANTIDAD:", margin + 5, y)
    doc.setFont("helvetica", "normal")
    doc.text(elemento.cantidad.toFixed(2), margin + 30, y)

    doc.setFont("helvetica", "bold")
    doc.text("MONEDA:", pageWidth - margin - 75, y)
    doc.setFont("helvetica", "normal")
    doc.text(config.moneda || "Bs.", pageWidth - margin - 50, y)

    y += 8

    // Parsear materiales del elemento
    let materialesList: any[] = []
    if (elemento.materiales) {
      try {
        const parsed = JSON.parse(elemento.materiales)
        if (Array.isArray(parsed)) {
          materialesList = parsed
        } else if (typeof parsed === "object") {
          materialesList = Object.entries(parsed).map(([key, val]: any) => {
            const name = key.charAt(0).toUpperCase() + key.slice(1)
            const unidad = key === "cemento" ? "bolsas" : key === "agua" ? "lt" : "m³"
            const qty = key === "cemento" ? val.bolsas : key === "agua" ? val.lt : val.m3
            return { nombre: name, cantidad: qty, unidad, precio: val.precio }
          })
        }
      } catch {}
    }

    const cantElemento = elemento.cantidad || 1

    // Rendimiento y costos de materiales
    let costoMateriales = 0
    const matRows = materialesList.map((m, i) => {
      // Rendimiento por unidad del ítem
      const rend = m.cantidad / cantElemento
      const pu = m.precio / m.cantidad
      const totalMat = rend * pu
      costoMateriales += totalMat
      return [
        `MAT-${(i+1).toString().padStart(3, '0')}`,
        m.nombre,
        m.unidad,
        rend.toFixed(4),
        pu.toFixed(2),
        totalMat.toFixed(2)
      ]
    })

    // Mano de obra simulada/estimada
    const laborRates: Record<string, { desc: string; rate: number; rend: number }> = {
      CONCRETO: { desc: "Especialista Encofrador / Albañil", rate: 25.0, rend: 2.2 },
      PARED: { desc: "Albañil de Primera", rate: 22.0, rend: 1.4 },
      COLUMNA: { desc: "Albañil Especialista", rate: 26.0, rend: 2.5 },
      VIGA: { desc: "Albañil Especialista", rate: 26.0, rend: 2.5 },
      LOSA: { desc: "Albañil Especialista", rate: 26.0, rend: 2.0 },
      CIMIENTO: { desc: "Albañil Encargado", rate: 22.0, rend: 1.6 },
      MURO: { desc: "Albañil Estructurista", rate: 22.0, rend: 1.4 },
      TECHO: { desc: "Techador Especialista", rate: 24.0, rend: 1.8 },
      PISO: { desc: "Colocador Cerámica", rate: 22.0, rend: 1.1 },
      CIELO: { desc: "Yesero Pintor", rate: 22.0, rend: 1.2 },
    }

    const typeKey = (elemento.tipoElemento || "OTROS").toUpperCase()
    const lRate = laborRates[typeKey] || { desc: "Albañil General", rate: 20.0, rend: 1.2 }

    const rendAlbañil = lRate.rend
    const rendAyudante = lRate.rend * 1.2
    const costoAlbañilHr = lRate.rate
    const costoAyudanteHr = lRate.rate * 0.75

    const subtotalAlbañil = rendAlbañil * costoAlbañilHr
    const subtotalAyudante = rendAyudante * costoAyudanteHr
    const subtotalManoObraDirecto = subtotalAlbañil + subtotalAyudante

    const socialCharges = subtotalManoObraDirecto * (config.cargasSociales / 100)
    const subtotalWithSocial = subtotalManoObraDirecto + socialCharges
    const ivaLabor = subtotalWithSocial * (config.iva / 100)
    const totalManoObra = subtotalWithSocial + ivaLabor

    const moRows = [
      ["MO-001", lRate.desc, "hr", rendAlbañil.toFixed(2), costoAlbañilHr.toFixed(2), subtotalAlbañil.toFixed(2)],
      ["MO-002", "Peón / Ayudante de Obra", "hr", rendAyudante.toFixed(2), costoAyudanteHr.toFixed(2), subtotalAyudante.toFixed(2)],
      ["", "Subtotal Mano de Obra", "", "", "", subtotalManoObraDirecto.toFixed(2)],
      ["", `Cargas Sociales (${config.cargasSociales}%)`, "", "", "", socialCharges.toFixed(2)],
      ["", `IVA Mano de Obra (${config.iva}%)`, "", "", "", ivaLabor.toFixed(2)]
    ]

    // Equipos y Maquinaria
    const eqRates: Record<string, { desc: string; rate: number; rend: number }> = {
      CONCRETO: { desc: "Mezcladora de Concreto & Vibrador", rate: 35.0, rend: 0.8 },
      COLUMNA: { desc: "Herramientas Menores & Mezcladora", rate: 30.0, rend: 0.6 },
      VIGA: { desc: "Herramientas Menores & Mezcladora", rate: 30.0, rend: 0.6 },
      LOSA: { desc: "Herramientas Menores & Guinchera", rate: 32.0, rend: 0.7 },
      CIMIENTO: { desc: "Mezcladora & compactador", rate: 25.0, rend: 0.5 },
    }

    const eqRate = eqRates[typeKey] || null
    let costoEquiposDirecto = 0
    const eqRows: any[] = []

    if (eqRate) {
      costoEquiposDirecto = eqRate.rend * eqRate.rate
      eqRows.push(["EQ-001", eqRate.desc, "hr", eqRate.rend.toFixed(2), eqRate.rate.toFixed(2), costoEquiposDirecto.toFixed(2)])
    }

    // Herramientas menores (5% de la Mano de Obra Directa)
    const herramientasMenores = subtotalManoObraDirecto * 0.05
    const totalEquipos = costoEquiposDirecto + herramientasMenores

    eqRows.push(["EQ-HM", "Herramientas Menores (5% Mano Obra)", "glb", "1.00", herramientasMenores.toFixed(2), herramientasMenores.toFixed(2)])

    // Costo Directo Total
    const costoDirecto = costoMateriales + totalManoObra + totalEquipos

    // Costos Indirectos y Margen
    const gastosGenerales = costoDirecto * (config.gastosGenerales / 100)
    const utilidad = (costoDirecto + gastosGenerales) * (config.utilidad / 100)
    const costoIndirecto = gastosGenerales + utilidad

    // Base Imponible y Transacciones (IT 3.09%)
    const baseIT = costoDirecto + costoIndirecto
    const impuestoIT = baseIT * (config.it / 100)

    // Adoptado Final
    const precioAdoptado = baseIT + impuestoIT

    // Renderizar tablas usando autoTable
    // 1. Tabla de Materiales
    doc.setFont("helvetica", "bold")
    doc.text("1. MATERIALES", margin + 2, y + 5)
    y += 7

    autoTable(doc, {
      startY: y,
      head: [["Código", "Insumo / Material", "Unidad", "Rendimiento", "P. Unitario", "Costo Total"]],
      body: matRows.length > 0 ? matRows : [["-", "Sin materiales registrados", "-", "0", "0", "0.00"]],
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [47, 55, 65] },
      margin: { left: margin + 2, right: margin + 2 },
    })

    y = (doc as any).lastAutoTable.finalY + 3
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL MATERIALES: Bs. ${costoMateriales.toFixed(2)}`, pageWidth - margin - 50, y)

    // 2. Tabla de Mano de Obra
    y += 5
    doc.text("2. MANO DE OBRA", margin + 2, y)
    y += 2

    autoTable(doc, {
      startY: y,
      head: [["Código", "Descripción Obreros", "Unidad", "Rendimiento", "Costo Horario", "Costo Total"]],
      body: moRows,
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [47, 55, 65] },
      margin: { left: margin + 2, right: margin + 2 },
    })

    y = (doc as any).lastAutoTable.finalY + 3
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL MANO DE OBRA: Bs. ${totalManoObra.toFixed(2)}`, pageWidth - margin - 50, y)

    // 3. Tabla de Equipos y Herramientas
    y += 5
    doc.text("3. EQUIPO Y HERRAMIENTAS", margin + 2, y)
    y += 2

    autoTable(doc, {
      startY: y,
      head: [["Código", "Descripción Equipos", "Unidad", "Rendimiento", "Tarifa / Costo", "Costo Total"]],
      body: eqRows,
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [47, 55, 65] },
      margin: { left: margin + 2, right: margin + 2 },
    })

    y = (doc as any).lastAutoTable.finalY + 3
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL EQUIPOS: Bs. ${totalEquipos.toFixed(2)}`, pageWidth - margin - 50, y)

    // Resumen Final APU
    y += 8
    doc.setFillColor(248, 250, 252)
    doc.rect(margin + 5, y, contentWidth - 10, 32, "F")
    doc.setDrawColor(203, 213, 225)
    doc.rect(margin + 5, y, contentWidth - 10, 32)

    doc.setFontSize(8)
    doc.setTextColor(30, 41, 59)
    doc.text(`COSTO DIRECTO TOTAL (1 + 2 + 3):`, margin + 8, y + 6)
    doc.text(`Bs. ${costoDirecto.toFixed(2)}`, pageWidth - margin - 20, y + 6, { align: "right" })

    doc.text(`GASTOS GENERALES (${config.gastosGenerales}% de Costo Directo):`, margin + 8, y + 12)
    doc.text(`Bs. ${gastosGenerales.toFixed(2)}`, pageWidth - margin - 20, y + 12, { align: "right" })

    doc.text(`UTILIDAD (${config.utilidad}% de Costo Directo + GG):`, margin + 8, y + 18)
    doc.text(`Bs. ${utilidad.toFixed(2)}`, pageWidth - margin - 20, y + 18, { align: "right" })

    doc.text(`IMPUESTO A LAS TRANSACCIONES IT (${config.it}%):`, margin + 8, y + 24)
    doc.text(`Bs. ${impuestoIT.toFixed(2)}`, pageWidth - margin - 20, y + 24, { align: "right" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`PRECIO UNITARIO ADOPTADO:`, margin + 8, y + 30)
    doc.text(`Bs. ${precioAdoptado.toFixed(2)}`, pageWidth - margin - 20, y + 30, { align: "right" })
  })

  doc.save(`Formulario_B1_APU_${new Date().toISOString().slice(0, 10)}.pdf`)
}

