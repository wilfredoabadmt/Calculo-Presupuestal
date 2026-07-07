"use client"

import { usePresupuesto } from "@/components/presupuesto/PresupuestoContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart3,
  TrendingUp,
  Calculator,
  Loader2,
  ArrowDown,
  DollarSign,
} from "lucide-react"

export default function ResumenPage() {
  const {
    presupuesto,
    capitulos,
    mediciones,
    loading,
  } = usePresupuesto()

  // Build chapter summaries
  const chapterSummaries = capitulos
    .filter(cap => cap.partidas.length > 0)
    .map(cap => {
      const subtotal = cap.partidas.reduce((sumPart, part) =>
        sumPart + mediciones
          .filter(m => m.partidaId === part.id)
          .reduce((sumMed, med) => sumMed + med.costoTotal, 0)
      , 0)
      return {
        codigo: cap.codigo,
        nombre: cap.nombre,
        subtotal,
        partidasCount: cap.partidas.length,
        medicionesCount: mediciones.filter(m =>
          cap.partidas.some(p => p.id === m.partidaId)
        ).length,
      }
    })
    .filter(ch => ch.subtotal > 0)

  const subtotalMaterial = chapterSummaries.reduce((sum, ch) => sum + ch.subtotal, 0)
  const bi = presupuesto?.porcentajeBI || 10
  const iva = presupuesto?.porcentajeIVA || 21
  const beneficioIndustrial = subtotalMaterial * (bi / 100)
  const baseImponible = subtotalMaterial + beneficioIndustrial
  const montoIVA = baseImponible * (iva / 100)
  const totalPresupuesto = baseImponible + montoIVA

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (mediciones.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-12 w-12" />}
        title="No hay datos para el resumen"
        description="Primero debes ingresar mediciones en la pestaña 'Datos'"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Resumen Ejecutivo del Presupuesto</h2>
        <p className="text-sm text-muted-foreground">
          Cascada financiera consolidada por capítulos
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subtotal Material</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(subtotalMaterial)}</div>
            <p className="text-xs text-muted-foreground">{chapterSummaries.length} capítulos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Beneficio Industrial ({bi}%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(beneficioIndustrial)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">IVA ({iva}%)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(montoIVA)}</div>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">TOTAL PRESUPUESTO</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalPresupuesto)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por capítulos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Desglose por Capítulos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">CAP.</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-20 text-center">Partidas</TableHead>
                <TableHead className="w-20 text-center">Mediciones</TableHead>
                <TableHead className="w-32 text-right">Subtotal</TableHead>
                <TableHead className="w-20 text-right">% del Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapterSummaries.map(ch => (
                <TableRow key={ch.codigo}>
                  <TableCell className="font-mono font-medium">{ch.codigo}</TableCell>
                  <TableCell>{ch.nombre}</TableCell>
                  <TableCell className="text-center">{ch.partidasCount}</TableCell>
                  <TableCell className="text-center">{ch.medicionesCount}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(ch.subtotal)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {subtotalMaterial > 0 ? ((ch.subtotal / subtotalMaterial) * 100).toFixed(1) : "0.0"}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cascada financiera */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cascada de Cierre Económico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* 1. Subtotal Material */}
            <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-t">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                <span className="font-medium">Suma de Costes Directos (Subtotal Material)</span>
              </div>
              <span className="font-bold text-lg">{formatCurrency(subtotalMaterial)}</span>
            </div>

            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* 2. Beneficio Industrial */}
            <div className="flex items-center justify-between py-3 px-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                <span className="font-medium">Beneficio Industrial ({bi}%)</span>
              </div>
              <span className="font-medium">{formatCurrency(beneficioIndustrial)}</span>
            </div>

            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* 3. Base Imponible */}
            <div className="flex items-center justify-between py-3 px-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                <span className="font-medium">Base Imponible (Costos + BI)</span>
              </div>
              <span className="font-bold">{formatCurrency(baseImponible)}</span>
            </div>

            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* 4. IVA */}
            <div className="flex items-center justify-between py-3 px-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                <span className="font-medium">I.V.A. ({iva}%)</span>
              </div>
              <span className="font-medium">{formatCurrency(montoIVA)}</span>
            </div>

            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* 5. Total Final */}
            <div className="flex items-center justify-between py-4 px-4 bg-primary/10 border-2 border-primary rounded-b">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</span>
                <span className="font-bold text-lg">TOTAL PRESUPUESTO DE CONTRATA</span>
              </div>
              <span className="font-bold text-2xl text-primary">{formatCurrency(totalPresupuesto)}</span>
            </div>
          </div>

          {/* Fórmula de verificación */}
          <div className="mt-6 p-4 bg-muted/30 rounded text-sm text-muted-foreground">
            <p className="font-medium mb-1">Fórmula de cálculo:</p>
            <p className="font-mono text-xs">
              Total = Subtotal × (1 + {bi}% BI) × (1 + {iva}% IVA) = {subtotalMaterial.toFixed(2)} × {(1 + bi/100).toFixed(4)} × {(1 + iva/100).toFixed(4)} = {totalPresupuesto.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
