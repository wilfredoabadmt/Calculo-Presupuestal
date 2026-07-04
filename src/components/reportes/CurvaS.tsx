"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CurvaSItem {
  periodo: string
  inversion: number
  acumulado: number
}

interface CurvaSProps {
  items: CurvaSItem[]
  totalProyecto: number
}

export function CurvaS({ items, totalProyecto }: CurvaSProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Curva S - Inversión Acumulada</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Sin datos de inversión</div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-sm">{item.periodo}</div>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div className="h-full bg-green-500 rounded" style={{ width: `${(item.acumulado / totalProyecto) * 100}%` }} />
                </div>
                <div className="w-24 text-right text-sm">{item.acumulado.toFixed(0)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
