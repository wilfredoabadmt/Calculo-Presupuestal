"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { FileBarChart, Download, FileText, Table2, Calendar, PieChart, BarChart3 } from "lucide-react"

const reportes = [
  { nombre: "Presupuesto General", descripcion: "Tabla completa con totales por módulo", icon: FileText, formatos: ["PDF", "Excel"] },
  { nombre: "Computos Métricos", descripcion: "Detalle de mediciones por elemento", icon: Table2, formatos: ["PDF", "Excel"] },
  { nombre: "Análisis de Precios Unitarios", descripcion: "Desglose material + MO + AIU", icon: FileBarChart, formatos: ["PDF"] },
  { nombre: "Resumen por Capítulos", descripcion: "Totales por capítulo con gráfico Pareto", icon: BarChart3, formatos: ["PDF"] },
  { nombre: "Lista de Materiales", descripcion: "Materiales agrupados por tipo/proveedor", icon: Table2, formatos: ["Excel"] },
  { nombre: "Cronograma", descripcion: "Gantt + Curva S de inversión", icon: Calendar, formatos: ["PDF", "Imagen"] },
  { nombre: "Reporte Ejecutivo", descripcion: "Dashboard con gráficos resumen", icon: PieChart, formatos: ["PDF"] },
]

export default function ReportesPage() {
  const params = useParams()
  const projectId = params.id as string

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
                {r.formatos.map(f => (
                  <Button key={f} variant="outline" size="sm">
                    <Download className="mr-1 h-3 w-3" />
                    {f}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
