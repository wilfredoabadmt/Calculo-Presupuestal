"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RutaCriticaProps {
  actividades: string[]
}

export function RutaCritica({ actividades }: RutaCriticaProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Ruta Crítica</CardTitle></CardHeader>
      <CardContent>
        {actividades.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No hay ruta crítica calculada</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {actividades.map((a, i) => (
              <span key={i} className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
                {a}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
