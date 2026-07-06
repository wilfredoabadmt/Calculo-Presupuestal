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

// 8. Exportar Cronograma (PDF)
export function exportarCronogramaPDF(items: any[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Cronograma de Obra", 14, 22)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30)

  const tableData = items.map((item, idx) => [
    (idx + 1).toString(),
    item.codigo || "-",
    item.item || item.descripcion || "-",
    item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString("es-BO") : "-",
    item.duracion ? `${item.duracion} días` : "-",
    item.fechaFinal ? new Date(item.fechaFinal).toLocaleDateString("es-BO") : "-",
    `${item.progreso ?? 0}%`,
  ])

  autoTable(doc, {
    startY: 35,
    head: [["#", "Código", "Actividad / Item", "Fecha Inicio", "Duración", "Fecha Fin", "Progreso"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [6, 182, 212] },
  })

  doc.save(`Cronograma_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// 9. Exportar Cronograma (Excel)
export function exportarCronogramaExcel(items: any[]) {
  const data = items.map((item, idx) => ({
    "#": idx + 1,
    "Código": item.codigo || "",
    "Item": item.item || item.descripcion || "",
    "Fecha Inicio": item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString("es-BO") : "",
    "Duración (días)": item.duracion || "",
    "Fecha Fin": item.fechaFinal ? new Date(item.fechaFinal).toLocaleDateString("es-BO") : "",
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

// 10. Exportar Cronograma (Imagen - Representada como PDF Horizontal de Línea de Tiempo)
export function exportarCronogramaImagen(items: any[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Línea de Tiempo del Cronograma", 15, 20)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")} | Total Actividades: ${items.length}`, 15, 26)

  // Draw a timeline mockup
  let y = 40
  items.forEach((item, idx) => {
    if (y > 180) return // Limit to one page for the timeline visual
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text(`${item.codigo || ""} - ${item.item || item.descripcion || ""}`, 15, y)

    // Draw bar background
    doc.setFillColor(240, 240, 240)
    doc.rect(80, y - 4, 150, 6, "F")

    // Draw progress bar
    doc.setFillColor(59, 130, 246)
    doc.rect(80, y - 4, 150 * ((item.progreso ?? 0) / 100), 6, "F")

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`${item.progreso ?? 0}% (duración: ${item.duracion}d)`, 235, y)

    y += 12
  })

  doc.save(`Cronograma_Visual_${new Date().toISOString().slice(0, 10)}.pdf`)
}
