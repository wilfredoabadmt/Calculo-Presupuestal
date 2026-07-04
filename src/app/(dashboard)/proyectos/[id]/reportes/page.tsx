"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { FileBarChart, Download, FileText, Table2, Calendar, PieChart, BarChart3, Loader2 } from "lucide-react"
import { exportarPDF, exportarExcel } from "@/lib/exports"

interface Elemento {
  id: string
  tipoElemento: string
  descripcion: string
  cantidad: number
  costoTotal: number
}

export default function ReportesPage() {
  const params = useParams()
  const projectId = params.id as string
  const [elementos, setElementos] = useState<Elemento[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/proyectos/${projectId}/elementos`)
      .then(r => r.json())
      .then(data => {
        setElementos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  const subtotal = elementos.reduce((sum, e) => sum + e.costoTotal, 0)
  const totalAIU = subtotal * 1.30

  const handleExport = useCallback((tipo: string) => {
    setExporting(tipo)
    const items = elementos.map(e => ({
      codigo: e.tipoElemento,
      descripcion: e.descripcion,
      unidad: "ud",
      cantidad: e.cantidad,
      costoTotal: e.costoTotal,
    }))

    const resumen = {
      "Subtotal Materiales": subtotal,
      "Gastos Generales (15%)": subtotal * 0.15,
      "Utilidad (10%)": subtotal * 0.10,
      "Impuesto IT (3.09%)": subtotal * 0.0309,
      "Total General": totalAIU,
    }

    switch (tipo) {
      case "presupuesto-pdf":
        exportarPDF(items, "Presupuesto General", resumen)
        break
      case "presupuesto-excel":
        exportarExcel(items, "Presupuesto General")
        break
      case "materiales-excel":
        exportarExcel(items, "Lista de Materiales")
        break
    }
    setTimeout(() => setExporting(null), 1000)
  }, [elementos, subtotal, totalAIU])

  const reportes = [
    { nombre: "Presupuesto General", descripcion: "Tabla completa con totales por módulo", icon: FileText, formatos: ["PDF", "Excel"], key: "presupuesto" },
    { nombre: "Computos Métricos", descripcion: "Detalle de mediciones por elemento", icon: Table2, formatos: ["PDF", "Excel"], key: "computos" },
    { nombre: "Análisis de Precios Unitarios", descripcion: "Desglose material + MO + AIU", icon: FileBarChart, formatos: ["PDF"], key: "apu" },
    { nombre: "Resumen por Capítulos", descripcion: "Totales por capítulo con gráfico Pareto", icon: BarChart3, formatos: ["PDF"], key: "capitulos" },
    { nombre: "Lista de Materiales", descripcion: "Materiales agrupados por tipo/proveedor", icon: Table2, formatos: ["Excel"], key: "materiales" },
    { nombre: "Cronograma", descripcion: "Gantt + Curva S de inversión", icon: Calendar, formatos: ["PDF", "Imagen"], key: "cronograma" },
    { nombre: "Reporte Ejecutivo", descripcion: "Dashboard con gráficos resumen", icon: PieChart, formatos: ["PDF"], key: "ejecutivo" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Generar y exportar reportes del proyecto"
        backHref={`/proyectos/${projectId}`}
        icon={<FileBarChart className="h-7 w-7 text-primary" />}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportes.map((r) => (
          <Card key={r.nombre} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <r.icon className="h-5 w-5 text-primary" />
                {r.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{r.descripcion}</p>
              <div className="flex gap-2">
                {r.formatos.map(f => {
                  const exportKey = `${r.key}-${f.toLowerCase()}`
                  return (
                    <Button
                      key={f}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(exportKey)}
                      disabled={exporting === exportKey || elementos.length === 0}
                    >
                      {exporting === exportKey ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="mr-1 h-3 w-3" />
                      )}
                      {f}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {elementos.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-muted-foreground">No hay datos para exportar. Agrega elementos al proyecto primero.</p>
        </Card>
      )}
    </div>
  )
}
