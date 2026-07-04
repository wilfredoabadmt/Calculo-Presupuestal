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
