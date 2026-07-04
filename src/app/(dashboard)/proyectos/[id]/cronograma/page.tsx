"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calendar, Plus, Download } from "lucide-react"

export default function CronogramaPage() {
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cronograma de Obra"
        description="Programación de actividades Gantt"
        backHref={`/proyectos/${projectId}`}
        icon={<Calendar className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Agregar Actividad</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diagrama de Gantt</CardTitle>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 rounded bg-primary/10 text-primary">Semana</span>
            <span className="px-3 py-1 rounded bg-muted text-muted-foreground">Mes</span>
            <span className="px-3 py-1 rounded bg-muted text-muted-foreground">Trimestre</span>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title="Cronograma vacío"
            description="Agrega actividades del presupuesto para generar el cronograma Gantt con ruta crítica"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Leyenda</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary" /> Actividad normal</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-destructive" /> Ruta crítica</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500" /> Completada</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500" /> En progreso</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
