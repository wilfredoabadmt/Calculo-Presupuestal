"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TortaItem {
  nombre: string
  valor: number
  color: string
}

interface GraficoTortaProps {
  items: TortaItem[]
}

export function GraficoTorta({ items }: GraficoTortaProps) {
  const total = items.reduce((s, i) => s + i.valor, 0)

  return (
    <Card>
      <CardHeader><CardTitle>Composición de Costos</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
              <div className="flex-1 text-sm">{item.nombre}</div>
              <div className="w-20 text-right text-sm font-medium">{((item.valor / total) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
