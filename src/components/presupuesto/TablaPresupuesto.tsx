"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface ItemPresupuesto {
  codigo: string
  descripcion: string
  unidad: string
  cantidad: number
  precioUnitario: number
  total: number
}

interface TablaPresupuestoProps {
  items: ItemPresupuesto[]
}

export function TablaPresupuesto({ items }: TablaPresupuestoProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[560px]">
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
          <TableRow className="bg-primary/5 font-bold">
            <TableCell colSpan={5}>TOTAL</TableCell>
            <TableCell className="text-right">{formatCurrency(items.reduce((s, i) => s + i.total, 0))}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
