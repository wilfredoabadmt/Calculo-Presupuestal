"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ResumenCostosProps {
  subtotal: number
  gastosGenerales?: number
  utilidad?: number
  impuestos?: number
}

export function ResumenCostos({ subtotal, gastosGenerales = 0, utilidad = 0, impuestos = 0 }: ResumenCostosProps) {
  const total = subtotal + gastosGenerales + utilidad + impuestos

  return (
    <Card>
      <CardHeader><CardTitle>Resumen de Costos</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
        {gastosGenerales > 0 && <div className="flex justify-between"><span>Gastos Generales</span><span className="font-medium">{formatCurrency(gastosGenerales)}</span></div>}
        {utilidad > 0 && <div className="flex justify-between"><span>Utilidad</span><span className="font-medium">{formatCurrency(utilidad)}</span></div>}
        {impuestos > 0 && <div className="flex justify-between"><span>Impuestos</span><span className="font-medium">{formatCurrency(impuestos)}</span></div>}
        <div className="border-t pt-3 flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
