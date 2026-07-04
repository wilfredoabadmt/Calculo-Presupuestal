"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ParetoItem {
  nombre: string
  valor: number
  porcentaje: number
}

interface GraficoParetoProps {
  items: ParetoItem[]
}

export function GraficoPareto({ items }: GraficoParetoProps) {
  const maxValor = Math.max(...items.map(i => i.valor))

  return (
    <Card>
      <CardHeader><CardTitle>Diagrama de Pareto</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-40 text-sm truncate">{item.nombre}</div>
              <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary rounded" style={{ width: `${(item.valor / maxValor) * 100}%` }} />
              </div>
              <div className="w-16 text-right text-sm">{item.porcentaje.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
