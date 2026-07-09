"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Ruler, Plus, Download, Loader2 } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface Elemento {
  id: string
  tipoElemento: string
  descripcion: string
  cantidad: number
  dimA: number | null
  dimB: number | null
  dimH: number | null
  dimLargo: number | null
  dimAncho: number | null
  dimEspesor: number | null
}

export default function ComputosPage() {
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
        title="Computos Métricos"
        description="Detalle de mediciones por elemento"
        backHref={`/proyectos/${projectId}`}
        icon={<Ruler className="h-7 w-7 text-primary" />}
        actions={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button className="flex-1 sm:flex-none"><Plus className="mr-2 h-4 w-4" /> Agregar Medición</Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Tabla de Mediciones</CardTitle>
        </CardHeader>
        <CardContent>
          {elementos.length === 0 ? (
            <EmptyState
              icon={<Ruler className="h-12 w-12" />}
              title="No hay mediciones"
              description="Los computos métricos se generan automáticamente al agregar elementos al presupuesto"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cant</TableHead>
                    <TableHead className="text-right">Dim A/Largo</TableHead>
                    <TableHead className="text-right">Dim B/Ancho</TableHead>
                    <TableHead className="text-right">Dim H/Espesor</TableHead>
                    <TableHead className="text-right">Vol/Área</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elementos.map((el, idx) => {
                    const dimA = el.dimA || el.dimLargo || 0
                    const dimB = el.dimB || el.dimAncho || 0
                    const dimH = el.dimH || el.dimEspesor || 0
                    const volumen = dimA * dimB * dimH * el.cantidad
                    const area = dimA * dimB * el.cantidad
                    const calcValue = el.tipoElemento === "TECHO" || el.tipoElemento === "PISO" || el.tipoElemento === "CIELO" || el.tipoElemento === "PARED"
                      ? area
                      : volumen

                    return (
                      <TableRow key={el.id}>
                        <TableCell className="font-mono">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{el.tipoElemento}</TableCell>
                        <TableCell>{el.descripcion}</TableCell>
                        <TableCell className="text-right">{el.cantidad}</TableCell>
                        <TableCell className="text-right">{formatNumber(dimA)}</TableCell>
                        <TableCell className="text-right">{formatNumber(dimB)}</TableCell>
                        <TableCell className="text-right">{formatNumber(dimH)}</TableCell>
                        <TableCell className="text-right font-medium">{formatNumber(calcValue, 3)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
