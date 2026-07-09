"use client"

import { useMemo } from "react"
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

function round2(n: number) { return Math.round(n * 100) / 100 }

export default function ResumenPage() {
  const {
    presupuesto,
    capitulos,
    mediciones,
    loading,
  } = usePresupuesto()

  const chapterSummaries = useMemo(() => {
    return capitulos
      .filter(cap => cap.partidas.length > 0)
      .map(cap => {
        const medicionesPartidas = cap.partidas.map(part => {
          const unit = (part.unidad || "").toLowerCase()
          const isDimensioned = ["m³", "m²", "ml", "m3", "m2"].includes(unit)
          
          return mediciones
            .filter(m => m.partidaId === part.id)
            .map(med => {
              let parcial = 0
              if (isDimensioned && med.largo === 0 && med.ancho === 0 && med.alto === 0) {
                parcial = 0
              } else {
                const l = med.largo > 0 ? med.largo : 1
                const a = med.ancho > 0 ? med.ancho : 1
                const h = med.alto > 0 ? med.alto : 1
                parcial = med.veces * l * a * h
              }
              const costoTotal = parcial * med.precioUnitario
              return costoTotal || 0
            })
            .reduce((sum, cost) => sum + cost, 0)
        })
        const subtotal = medicionesPartidas.reduce((sum, cost) => sum + cost, 0)
        
        const partidasConMedicion = cap.partidas.filter(part => 
          mediciones.some(m => m.partidaId === part.id)
        )
        
        return {
          codigo: cap.codigo,
          nombre: cap.nombre,
          subtotal: round2(subtotal),
          partidasCount: partidasConMedicion.length,
          medicionesCount: partidasConMedicion.reduce((sum, part) => 
            sum + mediciones.filter(m => m.partidaId === part.id).length, 0
          ),
        }
      })
      .filter(ch => ch.subtotal > 0 && ch.partidasCount > 0)
  }, [capitulos, mediciones])

  const subtotalMaterial = useMemo(() => {
    return round2(chapterSummaries.reduce((sum, ch) => sum + ch.subtotal, 0))
  }, [chapterSummaries])

  const bi = presupuesto?.porcentajeBI || 10
  const iva = presupuesto?.porcentajeIVA || 21

  const totales = useMemo(() => {
    const cd = subtotalMaterial
    const biMonto = round2(cd * bi / 100)
    const base = round2(cd + biMonto)
    const ivaMonto = round2(base * iva / 100)
    const total = round2(base + ivaMonto)
    return {
      costoDirecto: round2(cd),
      beneficioIndustrial: biMonto,
      baseImponible: base,
      iva: ivaMonto,
      totalGeneral: total,
    }
  }, [subtotalMaterial, bi, iva])

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
          Cascada financiera consolidada por capitulos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subtotal Material</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(subtotalMaterial)}</div>
            <p className="text-xs text-muted-foreground">{chapterSummaries.length} capitulos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Beneficio Industrial ({bi}%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totales.beneficioIndustrial)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">IVA ({iva}%)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totales.iva)}</div>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">TOTAL PRESUPUESTO</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totales.totalGeneral)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Desglose por Capitulos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">CAP.</TableHead>
                <TableHead>Descripcion</TableHead>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cascada de Cierre Economico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
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

            <div className="flex items-center justify-between py-3 px-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                <span className="font-medium">Beneficio Industrial ({bi}%)</span>
              </div>
              <span className="font-medium">{formatCurrency(totales.beneficioIndustrial)}</span>
            </div>

            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                <span className="font-medium">Base Imponible (Costos + BI)</span>
              </div>
              <span className="font-bold">{formatCurrency(totales.baseImponible)}</span>
            </div>

            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                <span className="font-medium">I.V.A. ({iva}%)</span>
              </div>
              <span className="font-medium">{formatCurrency(totales.iva)}</span>
            </div>

            <div className="flex justify-center py-1">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between py-4 px-4 bg-primary/10 border-2 border-primary rounded-b">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</span>
                <span className="font-bold text-lg">TOTAL PRESUPUESTO CONTRATADO</span>
              </div>
              <span className="font-bold text-2xl text-primary">{formatCurrency(totales.totalGeneral)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded text-sm text-muted-foreground">
            <p className="font-medium mb-1">Formula de calculo:</p>
            <p className="font-mono text-xs">
              Total = CD + BI + IVA = {totales.costoDirecto.toFixed(2)} + {totales.beneficioIndustrial.toFixed(2)} + {totales.iva.toFixed(2)} = {totales.totalGeneral.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
