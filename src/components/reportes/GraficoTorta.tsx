"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

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
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Sin datos para mostrar</div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={items}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="valor"
                  nameKey="nombre"
                >
                  {items.map((item, i) => (
                    <Cell key={i} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full md:w-auto md:min-w-[200px]">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 truncate">{item.nombre}</span>
                  <span className="font-medium">{((item.valor / total) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
