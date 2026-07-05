"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface BarraItem {
  nombre: string
  valor: number
}

interface GraficoBarrasProps {
  items: BarraItem[]
  titulo?: string
  color?: string
}

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#06b6d4", "#eab308", "#ec4899"]

export function GraficoBarras({ items, titulo = "Gráfico de Barras", color }: GraficoBarrasProps) {
  return (
    <Card>
      <CardHeader><CardTitle>{titulo}</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Sin datos para mostrar</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(250, items.length * 35)}>
            <BarChart data={items} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {items.map((_, i) => (
                  <Cell key={i} fill={color || COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
