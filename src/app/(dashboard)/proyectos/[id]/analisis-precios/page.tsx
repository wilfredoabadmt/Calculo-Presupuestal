"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { DollarSign, Plus, Download, Loader2 } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface APU {
  id: string
  codigo: string
  actividad: string
  descripcion: string
  unidad: string
  categoria?: string
  subcategoria?: string
  precioUnitario: number
  materiales: string | null
  manoObra: string | null
}

export default function AnalisisPreciosPage() {
  const params = useParams()
  const projectId = params.id as string
  const [items, setItems] = useState<APU[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/banco-precios`)
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data.items) ? data.items.slice(0, 20) : Array.isArray(data) ? data.slice(0, 20) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
        title="Análisis de Precios Unitarios"
        description="Desglose de costos por actividad"
        backHref={`/proyectos/${projectId}`}
        icon={<DollarSign className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo APU</Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Banco de Precios Unitarios</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-12 w-12" />}
              title="No hay análisis de precios"
              description="Los APU se generan a partir de los elementos del presupuesto"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">P.U.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.codigo || item.id.slice(0, 8)}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell>{item.unidad}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.categoria || "-"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.precioUnitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
