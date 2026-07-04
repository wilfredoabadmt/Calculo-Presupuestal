"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calculator, FileText, Download, Plus } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface ItemPresupuesto {
  codigo: string
  descripcion: string
  unidad: string
  cantidad: number
  precioUnitario: number
  total: number
}

export default function PresupuestoPage() {
  const params = useParams()
  const projectId = params.id as string

  const items: ItemPresupuesto[] = []

  const subtotal = items.reduce((sum, i) => sum + i.total, 0)
  const gastosGenerales = subtotal * 0.15
  const utilidad = subtotal * 0.10
  const impuestos = subtotal * 0.0309
  const totalGeneral = subtotal + gastosGenerales + utilidad + impuestos

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuesto General"
        description="Análisis de costos del proyecto"
        backHref={`/proyectos/${projectId}`}
        icon={<FileText className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Agregar Ítem</Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Desglose de Costos</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={<Calculator className="h-12 w-12" />}
              title="Presupuesto vacío"
              description="Agrega elementos desde las calculadoras para generar el presupuesto"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Und</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">P.U.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.codigo}>
                      <TableCell className="font-mono">{item.codigo}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell>{item.unidad}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.cantidad)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.precioUnitario)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Resumen de Costos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Subtotal Materiales</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Gastos Generales (15%)</span><span className="font-medium">{formatCurrency(gastosGenerales)}</span></div>
              <div className="flex justify-between"><span>Utilidad (10%)</span><span className="font-medium">{formatCurrency(utilidad)}</span></div>
              <div className="flex justify-between"><span>Impuesto IT (3.09%)</span><span className="font-medium">{formatCurrency(impuestos)}</span></div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>TOTAL GENERAL</span>
                <span className="text-primary">{formatCurrency(totalGeneral)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Información AIU</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Administración (15%)</span><span>{formatCurrency(subtotal * 0.15)}</span></div>
              <div className="flex justify-between"><span>Imprevistos (5%)</span><span>{formatCurrency(subtotal * 0.05)}</span></div>
              <div className="flex justify-between"><span>Utilidad (10%)</span><span>{formatCurrency(subtotal * 0.10)}</span></div>
              <div className="border-t pt-3 flex justify-between font-medium">
                <span>Total AIU</span>
                <span>{formatCurrency(subtotal * 0.30)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
