"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={items} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => `Bs. ${value.toFixed(2)}`} />
              <ReferenceLine y={totalProyecto} stroke="#ef4444" strokeDasharray="5 5" label={`Total: ${totalProyecto.toFixed(0)}`} />
              <Area type="monotone" dataKey="acumulado" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="inversion" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
