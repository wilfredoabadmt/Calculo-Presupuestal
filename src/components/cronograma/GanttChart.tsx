"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GanttItem {
  id: string
  codigo: string
  item: string
  fechaInicio: string
  duracion: number
  fechaFin: string
  progreso: number
  esCritico: boolean
}

interface GanttChartProps {
  items: GanttItem[]
}

export function GanttChart({ items }: GanttChartProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Diagrama de Gantt</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Sin actividades programadas</div>
        ) : (
          <div className="space-y-2 overflow-x-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 min-w-[480px]">
                <div className="w-48 text-sm truncate">{item.codigo} {item.item}</div>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${item.esCritico ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${item.progreso}%` }}
                  />
                </div>
                <div className="w-20 text-right text-sm text-muted-foreground">{item.progreso}%</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
