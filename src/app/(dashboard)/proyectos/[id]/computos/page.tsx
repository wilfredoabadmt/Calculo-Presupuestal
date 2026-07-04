"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Ruler, Plus, Download } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface ComputoItem {
  codigo: string
  item: string
  ejes: string
  unidad: string
  nElem: number
  largo: number
  ancho: number
  alto: number
  parcial: number
  total: number
}

export default function ComputosPage() {
  const params = useParams()
  const projectId = params.id as string

  const items: ComputoItem[] = []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Computos Métricos"
        description="Detalle de mediciones por elemento"
        backHref={`/proyectos/${projectId}`}
        icon={<Ruler className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Agregar Medición</Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Tabla de Mediciones</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={<Ruler className="h-12 w-12" />}
              title="No hay mediciones"
              description="Los computos métricos se generan automáticamente al agregar elementos al presupuesto"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cód.</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Ejes</TableHead>
                    <TableHead>Und</TableHead>
                    <TableHead className="text-right">N.Elem</TableHead>
                    <TableHead className="text-right">Largo</TableHead>
                    <TableHead className="text-right">Ancho</TableHead>
                    <TableHead className="text-right">Alto</TableHead>
                    <TableHead className="text-right">Parcial</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.codigo}>
                      <TableCell className="font-mono">{item.codigo}</TableCell>
                      <TableCell>{item.item}</TableCell>
                      <TableCell>{item.ejes}</TableCell>
                      <TableCell>{item.unidad}</TableCell>
                      <TableCell className="text-right">{item.nElem}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.largo)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.ancho)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.alto)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.parcial)}</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(item.total)}</TableCell>
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
