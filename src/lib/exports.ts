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

export function exportarPDF(items: ExportItem[], titulo: string, resumen: Record<string, number>) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(titulo, 14, 22)

  doc.setFontSize(10)
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

export function exportarComputosPDF(elementos: any[], titulo: string) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(titulo, 14, 22)
  doc.setFontSize(10)
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30)

  const tableData = elementos.map((e, idx) => [
    (idx + 1).toString(),
    e.tipoElemento || "-",
    e.descripcion,
    e.cantidad.toString(),
    e.dimA ? `${e.dimA}x${e.dimB}x${e.dimH || "-"}` : "-",
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

export function exportarMaterialesPDF(materiales: any[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Catálogo de Materiales", 14, 22)
  doc.setFontSize(10)
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")} | Total: ${materiales.length} materiales`, 14, 30)

  const tableData = materiales.map((m, idx) => [
    (idx + 1).toString(),
    m.codigo,
    m.nombre,
    m.unidad,
    m.grupo,
    m.precio.toFixed(2),
  ])

  autoTable(doc, {
    startY: 35,
    head: [["#", "Código", "Nombre", "Unidad", "Grupo", "Precio (Bs.)"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [168, 85, 247] },
  })

  doc.save(`Materiales_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function exportarMaterialesExcel(materiales: any[]) {
  const data = materiales.map((m, idx) => ({
    "#": idx + 1,
    "Código": m.codigo,
    "Nombre": m.nombre,
    "Unidad": m.unidad,
    "Grupo": m.grupo,
    "Precio (Bs.)": m.precio,
    "Proveedor": m.proveedor || "",
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Materiales")

  ws["!cols"] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 35 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ]

  XLSX.writeFile(wb, `Materiales_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function exportarCronogramaPDF(items: any[]) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Cronograma de Obra", 14, 22)
  doc.setFontSize(10)
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-BO")}`, 14, 30)

  const tableData = items.map((item, idx) => [
    (idx + 1).toString(),
    item.codigo || item.item || "-",
    item.descripcion || item.item || "",
    item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString("es-BO") : "-",
    item.duracion ? `${item.duracion} días` : "-",
    item.fechaFinal ? new Date(item.fechaFinal).toLocaleDateString("es-BO") : "-",
  ])

  autoTable(doc, {
    startY: 35,
    head: [["#", "Código", "Item", "Inicio", "Duración", "Fin"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [6, 182, 212] },
  })

  doc.save(`Cronograma_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function exportarCronogramaExcel(items: any[]) {
  const data = items.map((item, idx) => ({
    "#": idx + 1,
    "Código": item.codigo || "",
    "Item": item.item || item.descripcion || "",
    "Fecha Inicio": item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString("es-BO") : "",
    "Duración (días)": item.duracion || "",
    "Fecha Fin": item.fechaFinal ? new Date(item.fechaFinal).toLocaleDateString("es-BO") : "",
    "Depende de": Array.isArray(item.dependeDe) ? item.dependeDe.join(", ") : "",
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
