"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface Material {
  nombre: string
  cantidad: number
  unidad: string
  precioUnitario: number
  costoTotal: number
}

interface ResultadoCalculoProps {
  titulo?: string
  materiales: Material[]
  resumen?: Record<string, string>
}

export function ResultadoCalculo({ titulo = "Resultados del Cálculo", materiales, resumen }: ResultadoCalculoProps) {
  const total = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumen && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(resumen).map(([key, value]) => (
              <div key={key} className="bg-muted/50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">{key}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Unidad</TableHead>
                <TableHead className="text-right">P.U.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materiales.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{m.nombre}</TableCell>
                  <TableCell className="text-right font-mono">{formatNumber(m.cantidad, 2)}</TableCell>
                  <TableCell className="text-right">{m.unidad}</TableCell>
                  <TableCell className="text-right">{formatCurrency(m.precioUnitario)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(m.costoTotal)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-primary/5 font-bold">
                <TableCell colSpan={4}>TOTAL</TableCell>
                <TableCell className="text-right text-lg">{formatCurrency(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
