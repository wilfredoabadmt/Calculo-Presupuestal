"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { DollarSign, Plus, Download } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface APU {
  codigo: string
  descripcion: string
  unidad: string
  precioUnitario: number
}

export default function AnalisisPreciosPage() {
  const params = useParams()
  const projectId = params.id as string

  const items: APU[] = []

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
          <CardTitle>Análisis de Precios Unitarios</CardTitle>
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
                    <TableHead>Descripción</TableHead>
                    <TableHead>Und</TableHead>
                    <TableHead className="text-right">P.U.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.codigo}>
                      <TableCell className="font-mono">{item.codigo}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell>{item.unidad}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.precioUnitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Formato APU (Ejemplo)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3">A. MATERIALES</h4>
                <Table>
                  <TableHeader><TableRow><TableHead>Cod</TableHead><TableHead>Descripción</TableHead><TableHead>Und</TableHead><TableHead className="text-right">Cant</TableHead><TableHead className="text-right">P.U.</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    <TableRow><TableCell>M01</TableCell><TableCell>Cemento CP-40</TableCell><TableCell>Bls</TableCell><td className="text-right">4.20</td><td className="text-right">8.60</td><td className="text-right font-medium">36.12</td></TableRow>
                    <TableRow><TableCell>M02</TableCell><TableCell>Arena media</TableCell><TableCell>m³</TableCell><td className="text-right">0.55</td><td className="text-right">28.33</td><td className="text-right font-medium">15.58</td></TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <h4 className="font-semibold mb-3">B. MANO DE OBRA</h4>
                <Table>
                  <TableHeader><TableRow><TableHead>Profesión</TableHead><TableHead className="text-right">Horas</TableHead><TableHead className="text-right">Tarifa/hr</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    <TableRow><TableCell>Albañil</TableCell><td className="text-right">8.00</td><td className="text-right">18.75</td><td className="text-right font-medium">150.00</td></TableRow>
                    <TableRow><TableCell>Armador</TableCell><td className="text-right">4.00</td><td className="text-right">22.50</td><td className="text-right font-medium">90.00</td></TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
