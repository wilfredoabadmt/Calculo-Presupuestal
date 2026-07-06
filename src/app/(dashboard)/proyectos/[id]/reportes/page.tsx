"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { FileBarChart, Download, FileText, Table2, Calendar, PieChart, BarChart3, Loader2 } from "lucide-react"
import { differenceInCalendarDays } from "date-fns"
import {
  exportarPDF,
  exportarExcel,
  exportarComputosPDF,
  exportarCronogramaPDF,
  exportarCronogramaExcel,
  exportarMaterialesExcelConsolidado,
  exportarAPUPDF,
  exportarCapitulosPDF,
  exportarEjecutivoPDF,
  exportarCronogramaImagen,
  consolidarMateriales
} from "@/lib/exports"

interface Elemento {
  id: string
  tipoElemento: string
  descripcion: string
  cantidad: number
  costoTotal: number
  materiales?: string
  dimA?: number
  dimB?: number
  dimH?: number
}

export default function ReportesPage() {
  const params = useParams()
  const projectId = params.id as string
  const [elementos, setElementos] = useState<Elemento[]>([])
  const [cronograma, setCronograma] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/proyectos/${projectId}/elementos`).then(r => r.json()),
      fetch(`/api/proyectos/${projectId}/cronograma`).then(r => r.json()),
    ]).then(([elemData, cronData]) => {
      setElementos(Array.isArray(elemData) ? elemData : [])
      setCronograma(Array.isArray(cronData) ? cronData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [projectId])

  const subtotal = elementos.reduce((sum, e) => sum + e.costoTotal, 0)
  const gastosGenerales = subtotal * 0.15
  const utilidad = subtotal * 0.10
  const impuestos = subtotal * 0.0309
  const totalAIU = subtotal + gastosGenerales + utilidad + impuestos

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
      "Gastos Generales (15%)": gastosGenerales,
      "Utilidad (10%)": utilidad,
      "Impuesto IT (3.09%)": impuestos,
      "Total General": totalAIU,
    }

    switch (tipo) {
      case "presupuesto-pdf":
        exportarPDF(items, "Presupuesto General", resumen)
        break
      case "presupuesto-excel":
        exportarExcel(items, "Presupuesto General")
        break
      case "computos-pdf":
        exportarComputosPDF(elementos, "Computos Métricos")
        break
      case "computos-excel":
        exportarExcel(items, "Computos Métricos")
        break
      case "cronograma-pdf":
        exportarCronogramaPDF(cronograma)
        break
      case "cronograma-excel":
        exportarCronogramaExcel(cronograma)
        break
      case "materiales-excel":
        exportarMaterialesExcelConsolidado(elementos)
        break
      case "apu-pdf":
        exportarAPUPDF(elementos)
        break
      case "capitulos-pdf":
        exportarCapitulosPDF(elementos)
        break
      case "ejecutivo-pdf":
        exportarEjecutivoPDF(elementos, resumen, cronograma)
        break
      case "cronograma-imagen":
        exportarCronogramaImagen(cronograma)
        break
    }
    setTimeout(() => setExporting(null), 1000)
  }, [elementos, cronograma, subtotal, totalAIU, gastosGenerales, utilidad, impuestos])

  // Promedio progreso cronograma
  const promedioProgreso = cronograma.length > 0
    ? Math.round(cronograma.reduce((sum, c) => sum + (c.progreso ?? 0), 0) / cronograma.length)
    : 0

  // Duración cronograma
  const duracionTotalCronograma = cronograma.length > 0
    ? differenceInCalendarDays(
        new Date(Math.max(...cronograma.map(i => new Date(i.fechaFinal).getTime()))),
        new Date(Math.min(...cronograma.map(i => new Date(i.fechaInicio).getTime())))
      )
    : 0

  const reportes = [
    {
      nombre: "Presupuesto General",
      descripcion: "Tabla completa con totales por módulo e impuestos de ley",
      icon: FileText,
      formatos: ["PDF", "Excel"],
      key: "presupuesto",
      bgColor: "bg-blue-500/5",
      borderColor: "border-blue-500/10",
      image: (
        <svg className="w-full h-28 bg-blue-500/5 rounded-t-lg border-b border-blue-500/10" viewBox="0 0 200 100">
          <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#3b82f6" strokeWidth="1" />
          <line x1="30" y1="30" x2="170" y2="30" stroke="#93c5fd" strokeWidth="1.5" />
          <line x1="30" y1="42" x2="100" y2="42" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="140" y1="42" x2="170" y2="42" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="30" y1="52" x2="120" y2="52" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="140" y1="52" x2="170" y2="52" stroke="#3b82f6" strokeWidth="1.5" />
          <rect x="130" y="65" width="40" height="12" rx="2" fill="#3b82f6" opacity="0.1" />
          <line x1="135" y1="71" x2="165" y2="71" stroke="#3b82f6" strokeWidth="2" />
        </svg>
      ),
      preview: (
        <div className="mt-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal Materiales:</span>
            <span className="font-semibold text-foreground">Bs. {subtotal.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impuestos de Ley:</span>
            <span className="font-semibold text-foreground">Bs. {impuestos.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-t border-blue-500/10 pt-1 mt-1 font-bold text-blue-600">
            <span>Total General:</span>
            <span>Bs. {totalAIU.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )
    },
    {
      nombre: "Cómputos Métricos",
      descripcion: "Detalle de mediciones y volumen de cada elemento calculado",
      icon: Table2,
      formatos: ["PDF", "Excel"],
      key: "computos",
      bgColor: "bg-green-500/5",
      borderColor: "border-green-500/10",
      image: (
        <svg className="w-full h-28 bg-green-500/5 rounded-t-lg border-b border-green-500/10" viewBox="0 0 200 100">
          <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#22c55e" strokeWidth="1" />
          <line x1="20" y1="32" x2="180" y2="32" stroke="#22c55e" strokeWidth="0.5" />
          <line x1="20" y1="50" x2="180" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
          <line x1="20" y1="68" x2="180" y2="68" stroke="#e2e8f0" strokeWidth="0.5" />
          <line x1="60" y1="15" x2="60" y2="85" stroke="#22c55e" strokeWidth="0.5" />
          <line x1="120" y1="15" x2="120" y2="85" stroke="#22c55e" strokeWidth="0.5" />
          <circle cx="90" cy="41" r="3" fill="#22c55e" opacity="0.3" />
          <circle cx="150" cy="59" r="3" fill="#22c55e" opacity="0.3" />
        </svg>
      ),
      preview: (
        <div className="mt-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total de mediciones:</span>
            <span className="font-semibold text-foreground">{elementos.length} elementos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipos de partida:</span>
            <span className="font-semibold text-foreground">{new Set(elementos.map(e => e.tipoElemento)).size} categorías</span>
          </div>
        </div>
      )
    },
    {
      nombre: "Análisis de Precios Unitarios",
      descripcion: "Desglose pormenorizado de materiales, mano de obra y equipo",
      icon: FileBarChart,
      formatos: ["PDF"],
      key: "apu",
      bgColor: "bg-indigo-500/5",
      borderColor: "border-indigo-500/10",
      image: (
        <svg className="w-full h-28 bg-indigo-500/5 rounded-t-lg border-b border-indigo-500/10" viewBox="0 0 200 100">
          <rect x="25" y="15" width="150" height="70" rx="3" fill="white" stroke="#6366f1" strokeWidth="1" />
          <rect x="35" y="30" width="30" height="45" rx="1" fill="#818cf8" opacity="0.7" />
          <rect x="75" y="45" width="30" height="30" rx="1" fill="#a5b4fc" opacity="0.7" />
          <rect x="115" y="55" width="30" height="20" rx="1" fill="#c7d2fe" opacity="0.7" />
          <line x1="35" y1="75" x2="165" y2="75" stroke="#6366f1" strokeWidth="1" />
        </svg>
      ),
      preview: (
        <div className="mt-3 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Partidas con APU:</span>
            <span className="font-semibold text-foreground">{elementos.filter(e => e.materiales).length} analizadas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estructura:</span>
            <span className="font-semibold text-foreground">Insumos + Costos Directos</span>
          </div>
        </div>
      )
    },
    {
      nombre: "Resumen por Capítulos",
      descripcion: "Visualización gráfica y monetaria de la inversión por módulo",
      icon: BarChart3,
      formatos: ["PDF"],
      key: "capitulos",
      bgColor: "bg-orange-500/5",
      borderColor: "border-orange-500/10",
      image: (
        <svg className="w-full h-28 bg-orange-500/5 rounded-t-lg border-b border-orange-500/10" viewBox="0 0 200 100">
          <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#f97316" strokeWidth="1" />
          <circle cx="100" cy="50" r="25" fill="none" stroke="#fed7aa" strokeWidth="8" />
          <circle cx="100" cy="50" r="25" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="80 160" strokeDashoffset="20" />
          <circle cx="100" cy="50" r="25" fill="none" stroke="#fb923c" strokeWidth="8" strokeDasharray="30 160" strokeDashoffset="-60" />
        </svg>
      ),
      preview: (
        <div className="mt-3 p-3 bg-orange-500/5 rounded-lg border border-orange-500/10 space-y-1 text-xs">
          <div className="text-[10px] text-muted-foreground font-medium mb-1">Capítulos más representativos:</div>
          {Object.entries(elementos.reduce((acc, el) => {
            acc[el.tipoElemento] = (acc[el.tipoElemento] || 0) + el.costoTotal
            return acc
          }, {} as Record<string, number>)).slice(0, 2).map(([cap, val]) => (
            <div key={cap} className="flex justify-between">
              <span className="truncate max-w-[130px] font-mono">{cap}:</span>
              <span className="font-semibold text-foreground">Bs. {val.toLocaleString("es-BO", { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      nombre: "Lista de Materiales",
      descripcion: "Insumos consolidados del proyecto listos para cotizar y comprar",
      icon: Table2,
      formatos: ["Excel"],
      key: "materiales",
      bgColor: "bg-purple-500/5",
      borderColor: "border-purple-500/10",
      image: (
        <svg className="w-full h-28 bg-purple-500/5 rounded-t-lg border-b border-purple-500/10" viewBox="0 0 200 100">
          <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#a855f7" strokeWidth="1" />
          <rect x="35" y="28" width="12" height="12" rx="2" fill="#c084fc" opacity="0.8" />
          <rect x="55" y="28" width="110" height="4" rx="1" fill="#e2e8f0" />
          <rect x="55" y="36" width="60" height="3" rx="1" fill="#a855f7" opacity="0.5" />
          <rect x="35" y="48" width="12" height="12" rx="2" fill="#c084fc" opacity="0.8" />
          <rect x="55" y="48" width="110" height="4" rx="1" fill="#e2e8f0" />
          <rect x="55" y="56" width="45" height="3" rx="1" fill="#a855f7" opacity="0.5" />
        </svg>
      ),
      preview: (
        <div className="mt-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipos de insumo:</span>
            <span className="font-semibold text-foreground">{consolidarMateriales(elementos).length} materiales</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Consolidación:</span>
            <span className="font-semibold text-foreground">Por Nombre y Unidad</span>
          </div>
        </div>
      )
    },
    {
      nombre: "Cronograma de Trabajo",
      descripcion: "Actividades programadas con sus diagramas de barra Gantt",
      icon: Calendar,
      formatos: ["PDF", "Imagen"],
      key: "cronograma",
      bgColor: "bg-cyan-500/5",
      borderColor: "border-cyan-500/10",
      image: (
        <svg className="w-full h-28 bg-cyan-500/5 rounded-t-lg border-b border-cyan-500/10" viewBox="0 0 200 100">
          <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#06b6d4" strokeWidth="1" />
          <rect x="35" y="30" width="40" height="8" rx="2" fill="#06b6d4" opacity="0.7" />
          <rect x="85" y="45" width="60" height="8" rx="2" fill="#06b6d4" opacity="0.7" />
          <rect x="130" y="60" width="40" height="8" rx="2" fill="#06b6d4" opacity="0.7" />
        </svg>
      ),
      preview: (
        <div className="mt-3 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan de actividades:</span>
            <span className="font-semibold text-foreground">{cronograma.length} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duración total estimada:</span>
            <span className="font-semibold text-foreground">{duracionTotalCronograma} días</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Progreso promedio:</span>
            <span className="font-semibold text-foreground">{promedioProgreso}%</span>
          </div>
        </div>
      )
    },
    {
      nombre: "Reporte Ejecutivo",
      descripcion: "Resumen gerencial de avances físicos y financieros",
      icon: PieChart,
      formatos: ["PDF"],
      key: "ejecutivo",
      bgColor: "bg-slate-500/5",
      borderColor: "border-slate-500/10",
      image: (
        <svg className="w-full h-28 bg-slate-500/5 rounded-t-lg border-b border-slate-500/10" viewBox="0 0 200 100">
          <rect x="20" y="15" width="160" height="70" rx="4" fill="white" stroke="#64748b" strokeWidth="1" />
          <rect x="30" y="28" width="65" height="20" rx="2" fill="#f1f5f9" />
          <rect x="105" y="28" width="65" height="20" rx="2" fill="#f1f5f9" />
          <line x1="30" y1="65" x2="170" y2="65" stroke="#64748b" strokeWidth="1" />
          <line x1="30" y1="73" x2="150" y2="73" stroke="#e2e8f0" strokeWidth="1" />
        </svg>
      ),
      preview: (
        <div className="mt-3 p-3 bg-slate-500/5 rounded-lg border border-slate-500/10 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado global de obra:</span>
            <span className="font-semibold text-green-600">Activo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Inversión Final:</span>
            <span className="font-bold text-foreground">Bs. {totalAIU.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )
    },
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportes.map((r) => (
          <Card key={r.nombre} className={`hover:border-primary/50 transition-colors flex flex-col justify-between overflow-hidden`}>
            <div>
              {/* Imagen Vectorial Descriptiva */}
              {r.image}
              
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <r.icon className="h-5 w-5 text-primary" />
                  {r.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{r.descripcion}</p>
                {/* Cuadro de Vista Previa / Preview */}
                {r.preview}
              </CardContent>
            </div>
            
            <div className="p-6 pt-2 border-t mt-4">
              <div className="flex gap-2">
                {r.formatos.map(f => {
                  const exportKey = `${r.key}-${f.toLowerCase()}`
                  return (
                    <Button
                      key={f}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold"
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
            </div>
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
