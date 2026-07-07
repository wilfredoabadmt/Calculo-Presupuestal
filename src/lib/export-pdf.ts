import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  empresaLogo?: string
  clienteNombre?: string
  clienteDireccion?: string
  clientePoblacion?: string
  clienteCif?: string
  clienteLogo?: string
  proyectoNombre?: string
  fechaEmision?: string
  codigoPresupuesto?: string
  porcentajeBI: number
  porcentajeIVA: number
  subtotalMaterial: number
  beneficioIndustrial: number
  baseImponible: number
  montoIVA: number
  totalPresupuesto: number
  capitulos: CapituloData[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function generarPDFPresupuesto(data: PresupuestoData): jsPDF {
  const doc = new jsPDF('p', 'mm', 'letter')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let y = margin

  // ===== ENCABEZADO EMPRESA =====
  let logoY = y
  let infoX = margin
  
  if (data.empresaLogo) {
    try {
      doc.addImage(data.empresaLogo, 'PNG', margin, y, 16, 16)
      infoX = margin + 20
      logoY = y + 18
    } catch (e) {
      console.error("Error adding empresa logo to PDF", e)
    }
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(data.empresaNombre || '', infoX, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(data.empresaDireccion || '', infoX, y)
  y += 4
  doc.text(data.empresaCif || '', infoX, y)
  
  y = Math.max(y + 8, logoY)

  // ===== DATOS CLIENTE =====
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.clienteNombre || '', margin + 25, y)
  doc.text('FECHA:', pageWidth - 60, y)
  doc.text(data.fechaEmision || '', pageWidth - 45, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('DIRECCION:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.clienteDireccion || '', margin + 25, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('POBLACION:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.clientePoblacion || '', margin + 25, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.text('C.I.F.:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.clienteCif || '', margin + 25, y)

  if (data.clienteLogo) {
    try {
      doc.addImage(data.clienteLogo, 'PNG', pageWidth - margin - 20, y - 12, 16, 16)
    } catch (e) {
      console.error("Error adding cliente logo to PDF", e)
    }
  }
  
  y += 8

  // ===== TÍTULO =====
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('MEDICIONES Y PRESUPUESTO', pageWidth / 2, y, { align: 'center' })
  y += 10

  // ===== CAPÍTULOS Y PARTIDAS =====
  for (const capitulo of data.capitulos) {
    // Verificar si hay espacio para el capítulo
    if (y > 240) {
      doc.addPage()
      y = margin
    }

    // Encabezado del capítulo
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, y - 4, contentWidth, 7, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`CAP. ${capitulo.codigo} - ${capitulo.nombre}`, margin + 2, y)
    y += 8

    // Tabla de partidas
    const tableData: any[][] = []
    let subtotalCapitulo = 0

    for (const partida of capitulo.partidas) {
      for (const med of partida.mediciones) {
        subtotalCapitulo += med.costoTotal
        tableData.push([
          partida.codigo,
          partida.unidad,
          partida.descripcion.substring(0, 45),
          med.veces.toString(),
          med.largo.toString(),
          med.ancho.toString(),
          med.alto.toString(),
          formatCurrency(med.parcial),
          formatCurrency(med.precioUnitario),
          formatCurrency(med.costoTotal),
        ])
      }
    }

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Partida', 'UD', 'Concepto', 'Cant', 'Largo', 'Ancho', 'Alto', 'Parcial', 'Precio', 'Total']],
        body: tableData,
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: [60, 60, 60], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 8 },
          2: { cellWidth: 55 },
          3: { cellWidth: 10 },
          4: { cellWidth: 10 },
          5: { cellWidth: 10 },
          6: { cellWidth: 10 },
          7: { cellWidth: 15 },
          8: { cellWidth: 15 },
          9: { cellWidth: 18 },
        },
        margin: { left: margin, right: margin },
        didDrawPage: () => {
          // Footer en cada página
          doc.setFontSize(7)
          doc.text(
            `Página ${(doc as any).internal.getNumberOfPages?.() || 1}`,
            pageWidth - margin,
            doc.internal.pageSize.getHeight() - 5,
            { align: 'right' }
          )
        },
      })

      y = (doc as any).lastAutoTable.finalY + 3

      // Subtotal capítulo
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`SUBTOTAL CAP. ${capitulo.codigo}:`, pageWidth - margin - 40, y)
      doc.text(formatCurrency(subtotalCapitulo), pageWidth - margin, y, { align: 'right' })
      y += 8
    }
  }

  // ===== TOTALES FINALES =====
  if (y > 220) {
    doc.addPage()
    y = margin
  }

  y += 5
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  doc.text('TOTAL PRESUPUESTO EJECUCION MATERIAL:', margin, y)
  doc.text(formatCurrency(data.subtotalMaterial), pageWidth - margin, y, { align: 'right' })
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.text(`Gastos Generales y Beneficio Industrial (${data.porcentajeBI}%):`, margin, y)
  doc.text(formatCurrency(data.beneficioIndustrial), pageWidth - margin, y, { align: 'right' })
  y += 7

  doc.text('TOTAL PRESUPUESTO EJECUCION CONTRATA:', margin, y)
  doc.text(formatCurrency(data.baseImponible), pageWidth - margin, y, { align: 'right' })
  y += 7

  doc.text(`I.V.A. (${data.porcentajeIVA}%):`, margin, y)
  doc.text(formatCurrency(data.montoIVA), pageWidth - margin, y, { align: 'right' })
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, y - 4, contentWidth, 8, 'F')
  doc.text('TOTAL PRESUPUESTO CONTRATADO:', margin + 2, y + 1)
  doc.text(formatCurrency(data.totalPresupuesto), pageWidth - margin, y + 1, { align: 'right' })

  return doc
}

export function descargarPDF(doc: jsPDF, nombreArchivo: string) {
  doc.save(nombreArchivo.endsWith('.pdf') ? nombreArchivo : `${nombreArchivo}.pdf`)
}
