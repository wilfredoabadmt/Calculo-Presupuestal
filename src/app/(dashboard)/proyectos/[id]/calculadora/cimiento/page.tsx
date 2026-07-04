"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator, Save, Box } from "lucide-react"
import { formatNumber } from "@/lib/utils"

const dosificaciones = [
  { ratio: "1:2", cemento: 400, arena: 1.00 },
  { ratio: "1:3", cemento: 300, arena: 1.00 },
  { ratio: "1:4", cemento: 240, arena: 1.00 },
  { ratio: "1:5", cemento: 200, arena: 1.00 },
  { ratio: "1:6", cemento: 170, arena: 1.00 },
]

const PESO_BOLSA = 42.5

export default function CimientoCalculatorPage() {
  const params = useParams()
  const projectId = params.id as string

  const [form, setForm] = useState({
    base: "0.60",
    altura: "0.40",
    largo: "10.00",
    dosificacion: "1:4",
    porcentajePiedra: "60",
    porcentajeMortero: "40",
    cantidad: "1",
  })

  const [results, setResults] = useState<{
    volumen: number
    piedra: number
    mortero: number
    cemento: { kg: number; bolsas: number }
    arena: number
    total: number
  } | null>(null)

  const selectedDos = dosificaciones.find(d => d.ratio === form.dosificacion) || dosificaciones[2]

  const calculate = () => {
    const base = parseFloat(form.base)
    const altura = parseFloat(form.altura)
    const largo = parseFloat(form.largo)
    const cantidad = parseInt(form.cantidad)
    if (!base || !altura || !largo || !cantidad) return

    const volumen = base * altura * largo * cantidad
    const pctPiedra = parseFloat(form.porcentajePiedra) / 100
    const pctMortero = parseFloat(form.porcentajeMortero) / 100

    const piedra = volumen * pctPiedra
    const mortero = volumen * pctMortero
    const cementoKg = mortero * selectedDos.cemento
    const cementoBolsas = Math.ceil(cementoKg / PESO_BOLSA)
    const arena = mortero * selectedDos.arena

    setResults({
      volumen, piedra, mortero,
      cemento: { kg: cementoKg, bolsas: cementoBolsas },
      arena,
      total: piedra * 35.00 + cementoBolsas * 8.60 + arena * 28.33,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/proyectos/${projectId}/calculadora`} className="p-2 hover:bg-accent rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Box className="h-7 w-7 text-primary" /> Calculadora de Cimiento</h1>
            <p className="text-muted-foreground">Piedra + Mortero con dosificación</p>
          </div>
        </div>
        <Button variant="outline" disabled={!results}><Save className="mr-2 h-4 w-4" /> Guardar</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Parámetros de Entrada</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Cimiento</div>
            <svg className="mx-auto max-w-[250px]" viewBox="0 0 250 120">
              <rect x="50" y="30" width="150" height="60" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <text x="125" y="20" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Largo</text>
              <text x="30" y="65" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6" transform="rotate(-90 30 65)">Altura</text>
              <text x="125" y="110" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Base</text>
            </svg>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Base (m)</Label><Input type="number" step="0.01" value={form.base} onChange={e => setForm({...form, base: e.target.value})} /></div>
            <div className="space-y-2"><Label>Altura (m)</Label><Input type="number" step="0.01" value={form.altura} onChange={e => setForm({...form, altura: e.target.value})} /></div>
            <div className="space-y-2"><Label>Largo (m)</Label><Input type="number" step="0.01" value={form.largo} onChange={e => setForm({...form, largo: e.target.value})} /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Dosificación Mortero</Label>
              <Select value={form.dosificacion} onValueChange={v => setForm({...form, dosificacion: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{dosificaciones.map(d => <SelectItem key={d.ratio} value={d.ratio}>{d.ratio}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>% Piedra</Label><Input type="number" min="0" max="100" value={form.porcentajePiedra} onChange={e => setForm({...form, porcentajePiedra: e.target.value})} /></div>
            <div className="space-y-2"><Label>% Mortero</Label><Input type="number" min="0" max="100" value={form.porcentajeMortero} onChange={e => setForm({...form, porcentajeMortero: e.target.value})} /></div>
          </div>

          <div className="space-y-2"><Label>Cantidad</Label><Input type="number" min="1" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>

          <Button onClick={calculate} className="w-full" size="lg"><Calculator className="mr-2 h-4 w-4" /> Calcular</Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-primary">Resultados</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(results.volumen, 3)}</div>
                <div className="text-sm text-muted-foreground">Volumen (m³)</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-800">{formatNumber(results.piedra, 3)}</div>
                <div className="text-sm text-amber-700">Piedra (m³)</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{results.cemento.bolsas}</div>
                <div className="text-sm text-green-700">Bolsas Cemento</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{formatNumber(results.arena, 3)}</div>
                <div className="text-sm text-blue-700">Arena (m³)</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Material</th><th className="pb-2 pr-4 text-right">Cantidad</th><th className="pb-2 pr-4 text-right">Unidad</th><th className="pb-2 text-right">Costo</th>
                </tr></thead>
                <tbody>
                  {[
                    { nombre: "Piedra", cantidad: results.piedra, unidad: "m³", precio: results.piedra * 35.00 },
                    { nombre: "Cemento CP-40", cantidad: results.cemento.bolsas, unidad: "bolsa", precio: results.cemento.bolsas * 8.60 },
                    { nombre: "Arena media", cantidad: results.arena, unidad: "m³", precio: results.arena * 28.33 },
                  ].map((m, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 pr-4">{m.nombre}</td>
                      <td className="py-2 pr-4 text-right font-mono">{formatNumber(m.cantidad, 2)}</td>
                      <td className="py-2 pr-4 text-right">{m.unidad}</td>
                      <td className="py-2 text-right font-medium">Bs. {formatNumber(m.precio, 2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5 font-bold">
                    <td className="py-3 pr-4" colSpan={3}>TOTAL</td>
                    <td className="py-3 text-right text-lg">Bs. {formatNumber(results.total, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Piedra: {formatNumber(results.piedra, 3)} m³ ({form.porcentajePiedra}%)</div>
                <div className="font-medium">Mortero: {formatNumber(results.mortero, 3)} m³ ({form.porcentajeMortero}%)</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Cemento: {formatNumber(results.cemento.kg, 1)} kg</div>
                <div className="font-medium">Arena: {formatNumber(results.arena, 3)} m³</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!results && (
        <Card className="text-center py-12 border-dashed">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Ingresa los parámetros y haz clic en Calcular</h3>
        </Card>
      )}
    </div>
  )
}
