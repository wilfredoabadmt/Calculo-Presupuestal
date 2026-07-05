"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ParetoItem {
  nombre: string
  valor: number
  porcentaje: number
}

interface GraficoParetoProps {
  items: ParetoItem[]
}

export function GraficoPareto({ items }: GraficoParetoProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Diagrama de Pareto</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Sin datos para mostrar</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={items} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="nombre" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number, name: string) => name === "valor" ? `Bs. ${value.toFixed(2)}` : `${value.toFixed(1)}%`} />
              <Bar yAxisId="left" dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} name="valor" />
              <Line yAxisId="right" dataKey="porcentaje" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} name="porcentaje" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
