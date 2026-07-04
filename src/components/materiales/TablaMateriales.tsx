"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

interface Material {
  id: string
  codigo: string
  nombre: string
  unidad: string
  precio: number
  grupo: string
}

interface TablaMaterialesProps {
  materiales: Material[]
}

export function TablaMateriales({ materiales }: TablaMaterialesProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materiales.map(m => (
            <TableRow key={m.id}>
              <TableCell className="font-mono">{m.codigo}</TableCell>
              <TableCell className="font-medium">{m.nombre}</TableCell>
              <TableCell>{m.unidad}</TableCell>
              <TableCell><span className="px-2 py-1 rounded-full text-xs bg-muted">{m.grupo}</span></TableCell>
              <TableCell className="text-right">{formatCurrency(m.precio)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
