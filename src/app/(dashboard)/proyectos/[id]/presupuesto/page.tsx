"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calculator, FileText, Download, Plus, Loader2 } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { exportarPDF, exportarExcel } from "@/lib/exports"

interface Elemento {
  id: string
  tipoElemento: string
  descripcion: string
  cantidad: number
  costoTotal: number
}

export default function PresupuestoPage() {
  const params = useParams()
  const projectId = params.id as string
  const [elementos, setElementos] = useState<Elemento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/proyectos/${projectId}/elementos`)
      .then(r => r.json())
      .then(data => {
        setElementos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  const subtotal = elementos.reduce((sum, e) => sum + e.costoTotal, 0)
  const gastosGenerales = subtotal * 0.15
  const utilidad = subtotal * 0.10
  const cargasSociales = subtotal * 0.55
  const iva = subtotal * 0.1494
  const impuestos = subtotal * 0.0309
  const totalGeneral = subtotal + gastosGenerales + utilidad + impuestos

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuesto General"
        description="Análisis de costos del proyecto"
        backHref={`/proyectos/${projectId}`}
        icon={<FileText className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline" onClick={() => {
              const items = elementos.map(e => ({ codigo: e.tipoElemento, descripcion: e.descripcion, unidad: "ud", cantidad: e.cantidad, costoTotal: e.costoTotal }))
              const resumen = { "Subtotal": subtotal, "Gastos Generales (15%)": gastosGenerales, "Utilidad (10%)": utilidad, "IT (3.09%)": impuestos, "Total General": totalGeneral }
              exportarPDF(items, "Presupuesto General", resumen)
            }}><Download className="mr-2 h-4 w-4" /> Exportar PDF</Button>
            <Button variant="outline" onClick={() => {
              const items = elementos.map(e => ({ codigo: e.tipoElemento, descripcion: e.descripcion, unidad: "ud", cantidad: e.cantidad, precioUnitario: e.costoTotal / e.cantidad, costoTotal: e.costoTotal }))
              exportarExcel(items, "Presupuesto General")
            }}><Download className="mr-2 h-4 w-4" /> Exportar Excel</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Agregar Ítem</Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Desglose de Costos por Elemento</CardTitle>
        </CardHeader>
        <CardContent>
          {elementos.length === 0 ? (
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
                    <TableHead>#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elementos.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{item.tipoElemento}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.costoTotal / item.cantidad)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.costoTotal)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-primary/5 font-bold">
                    <TableCell colSpan={5}>SUBTOTAL MATERIALES</TableCell>
                    <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {elementos.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Resumen de Costos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Subtotal Materiales</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Cargas Sociales (55%)</span><span className="font-medium">{formatCurrency(cargasSociales)}</span></div>
              <div className="flex justify-between"><span>IVA (14.94%)</span><span className="font-medium">{formatCurrency(iva)}</span></div>
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
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p><strong>Equipo y Maquinaria:</strong> 5% sobre MO</p>
                <p><strong>Gastos Generales:</strong> 15%</p>
                <p><strong>Utilidad:</strong> 10%</p>
                <p><strong>Imp. Transacciones:</strong> 3.09%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
