"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface TablaComputosProps {
  items: ComputoItem[]
}

export function TablaComputos({ items }: TablaComputosProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cód.</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Ejes</TableHead>
            <TableHead>Und</TableHead>
            <th className="text-right">N.Elem</th>
            <th className="text-right">Largo</th>
            <th className="text-right">Ancho</th>
            <th className="text-right">Alto</th>
            <th className="text-right">Parcial</th>
            <th className="text-right">Total</th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.codigo}>
              <TableCell className="font-mono">{item.codigo}</TableCell>
              <TableCell>{item.item}</TableCell>
              <TableCell>{item.ejes}</TableCell>
              <TableCell>{item.unidad}</TableCell>
              <td className="text-right">{item.nElem}</td>
              <td className="text-right">{formatNumber(item.largo)}</td>
              <td className="text-right">{formatNumber(item.ancho)}</td>
              <td className="text-right">{formatNumber(item.alto)}</td>
              <td className="text-right">{formatNumber(item.parcial)}</td>
              <td className="text-right font-medium">{formatNumber(item.total)}</td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
