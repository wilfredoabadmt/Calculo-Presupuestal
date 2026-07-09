"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface MaterialAPU {
  codigo: string
  descripcion: string
  unidad: string
  cantidad: number
  precio: number
  total: number
}

interface ManoObra {
  profesion: string
  horas: number
  tarifaHora: number
  total: number
}

interface AnalisisPrecioUnitarioProps {
  materiales: MaterialAPU[]
  manoObra: ManoObra[]
  cargasSociales?: number
  iva?: number
  equipoMaquinaria?: number
  gastosGenerales?: number
  utilidad?: number
  it?: number
}

export function AnalisisPrecioUnitario({
  materiales,
  manoObra,
  cargasSociales = 55,
  iva = 14.94,
  equipoMaquinaria = 5,
  gastosGenerales = 15,
  utilidad = 10,
  it = 3.09,
}: AnalisisPrecioUnitarioProps) {
  const subtotalMat = materiales.reduce((s, m) => s + m.total, 0)
  const subtotalMO = manoObra.reduce((s, m) => s + m.total, 0)
  const cargaSocial = subtotalMO * (cargasSociales / 100)
  const equipo = subtotalMO * (equipoMaquinaria / 100)
  const baseImponible = subtotalMat + subtotalMO + cargaSocial + equipo
  const gastos = baseImponible * (gastosGenerales / 100)
  const util = (baseImponible + gastos) * (utilidad / 100)
  const impuestoIT = (baseImponible + gastos + util) * (it / 100)
  const precioUnitario = baseImponible + gastos + util + impuestoIT

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>A. MATERIALES</CardTitle></CardHeader>
        <CardContent>
          <Table className="min-w-[560px]">
            <TableHeader><TableRow><TableHead>Cod</TableHead><TableHead>Descripción</TableHead><TableHead>Und</TableHead><th className="text-right">Cant</th><th className="text-right">P.U.</th><th className="text-right">Total</th></TableRow></TableHeader>
            <TableBody>
              {materiales.map(m => (
                <TableRow key={m.codigo}><TableCell className="font-mono">{m.codigo}</TableCell><TableCell>{m.descripcion}</TableCell><TableCell>{m.unidad}</TableCell><td className="text-right">{formatNumber(m.cantidad)}</td><td className="text-right">{formatCurrency(m.precio)}</td><td className="text-right font-medium">{formatCurrency(m.total)}</td></TableRow>
              ))}
              <TableRow className="font-bold"><TableCell colSpan={5}>SUBTOTAL MATERIALES</TableCell><td className="text-right">{formatCurrency(subtotalMat)}</td></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>B. MANO DE OBRA</CardTitle></CardHeader>
        <CardContent>
          <Table className="min-w-[480px]">
            <TableHeader><TableRow><TableHead>Profesión</TableHead><th className="text-right">Horas</th><th className="text-right">Tarifa/hr</th><th className="text-right">Total</th></TableRow></TableHeader>
            <TableBody>
              {manoObra.map(m => (
                <TableRow key={m.profesion}><TableCell>{m.profesion}</TableCell><td className="text-right">{formatNumber(m.horas)}</td><td className="text-right">{formatCurrency(m.tarifaHora)}</td><td className="text-right font-medium">{formatCurrency(m.total)}</td></TableRow>
              ))}
              <TableRow className="font-bold"><TableCell>SUBTOTAL M.O.</TableCell><td colSpan={2}></td><td className="text-right">{formatCurrency(subtotalMO)}</td></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resumen APU</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Cargas Sociales ({cargasSociales}%)</span><span>{formatCurrency(cargaSocial)}</span></div>
          <div className="flex justify-between"><span>Equipo/Maquinaria ({equipoMaquinaria}%)</span><span>{formatCurrency(equipo)}</span></div>
          <div className="flex justify-between"><span>Gastos Generales ({gastosGenerales}%)</span><span>{formatCurrency(gastos)}</span></div>
          <div className="flex justify-between"><span>Utilidad ({utilidad}%)</span><span>{formatCurrency(util)}</span></div>
          <div className="flex justify-between"><span>Imp. Transacciones ({it}%)</span><span>{formatCurrency(impuestoIT)}</span></div>
          <div className="border-t pt-2 flex justify-between text-lg font-bold"><span>PRECIO UNITARIO</span><span className="text-primary">{formatCurrency(precioUnitario)}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
