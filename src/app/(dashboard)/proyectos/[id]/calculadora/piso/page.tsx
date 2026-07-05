"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator, Save, Box, CheckCircle, Loader2 } from "lucide-react"
import { formatNumber } from "@/lib/utils"

const tiposCeramica = [
  { nombre: "Cerámica 30x30", areaM2: 0.09, unidadesCaja: 11, precioCaja: 45 },
  { nombre: "Cerámica 40x40", areaM2: 0.16, unidadesCaja: 6, precioCaja: 55 },
  { nombre: "Cerámica 60x60", areaM2: 0.36, unidadesCaja: 3, precioCaja: 85 },
  { nombre: "Porcelanato 60x60", areaM2: 0.36, unidadesCaja: 3, precioCaja: 120 },
  { nombre: "Porcelanato 80x80", areaM2: 0.64, unidadesCaja: 2, precioCaja: 180 },
]

export default function PisoCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [form, setForm] = useState({
    ancho: "4.00",
    largo: "5.00",
    tipoCeramica: "Cerámica 60x60",
    despCeramica: "5",
    despAdhesivo: "5",
    despBoquilla: "5",
    cantidad: "1",
  })

  const [results, setResults] = useState<{
    area: number
    piezas: number
    cajas: number
    adhesivo: number
    boquilla: number
    agua: number
    total: number
  } | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedCeramica = tiposCeramica.find(t => t.nombre === form.tipoCeramica) || tiposCeramica[2]

  const calculate = () => {
    const ancho = parseFloat(form.ancho)
    const largo = parseFloat(form.largo)
    const cantidad = parseInt(form.cantidad)
    if (!ancho || !largo || !cantidad) return

    const area = ancho * largo * cantidad
    const piezas = Math.ceil(area / selectedCeramica.areaM2 * (1 + parseFloat(form.despCeramica) / 100))
    const cajas = Math.ceil(piezas / selectedCeramica.unidadesCaja)
    const adhesivo = area * 5 * (1 + parseFloat(form.despAdhesivo) / 100)
    const perimeterJuntas = area * 2 / 0.6
    const boquilla = perimeterJuntas * 0.5 * (1 + parseFloat(form.despBoquilla) / 100)
    const agua = area * 3

    setResults({
      area, piezas, cajas, adhesivo, boquilla, agua,
      total: cajas * selectedCeramica.precioCaja + adhesivo * 4.50 + boquilla * 6.00,
    })
  }

  const handleSave = async () => {
    if (!results) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/proyectos/${projectId}/elementos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoElemento: "PISO",
          descripcion: `Piso ${form.tipoCeramica} - ${form.ancho}x${form.largo}m`,
          cantidad: parseInt(form.cantidad) || 1,
          dimAncho: parseFloat(form.ancho),
          dimLargo: parseFloat(form.largo),
          tipoCeramicaId: null,
          desperdicio: parseFloat(form.despCeramica),
          materiales: JSON.stringify([
            { nombre: "Cerámica", cantidad: results.cajas, unidad: "caja", precio: results.cajas * selectedCeramica.precioCaja },
            { nombre: "Adhesivo", cantidad: results.adhesivo, unidad: "kg", precio: results.adhesivo * 4.5 },
            { nombre: "Boquilla", cantidad: results.boquilla, unidad: "kg", precio: results.boquilla * 6.00 },
          ]),
          costoTotal: results.total,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push(`/proyectos/${projectId}/elementos`), 1500)
      }
    } catch {
      alert("Error al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/proyectos/${projectId}/calculadora`} className="p-2 hover:bg-accent rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Box className="h-7 w-7 text-primary" /> Calculadora de Piso</h1>
            <p className="text-muted-foreground">Cerámicas + Adhesivo + Boquilla + Agua</p>
          </div>
        </div>
        <Button
          variant="outline"
          disabled={!results || isSaving || saved}
          onClick={handleSave}
        >
          {saved ? (
            <><CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Guardado</>
          ) : isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Guardar</>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Parámetros de Entrada</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Piso Cerámico</div>
            <svg className="mx-auto max-w-[200px]" viewBox="0 0 200 120">
              <rect x="20" y="20" width="160" height="80" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="60" y1="20" x2="60" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4"/>
              <line x1="100" y1="20" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4"/>
              <line x1="140" y1="20" x2="140" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4"/>
              <line x1="20" y1="45" x2="180" y2="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4"/>
              <line x1="20" y1="75" x2="180" y2="75" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4"/>
              <text x="100" y="115" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Ancho × Largo</text>
            </svg>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Ancho (m)</Label><Input type="number" step="0.01" value={form.ancho} onChange={e => setForm({...form, ancho: e.target.value})} /></div>
            <div className="space-y-2"><Label>Largo (m)</Label><Input type="number" step="0.01" value={form.largo} onChange={e => setForm({...form, largo: e.target.value})} /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Tipo de Cerámica</Label>
              <Select value={form.tipoCeramica} onValueChange={v => setForm({...form, tipoCeramica: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tiposCeramica.map(t => <SelectItem key={t.nombre} value={t.nombre}>{t.nombre} ({t.unidadesCaja} pzas/caja)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Cantidad</Label><Input type="number" min="1" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Desp. Cerámica (%)</Label>
              <Select value={form.despCeramica} onValueChange={v => setForm({...form, despCeramica: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(d => <SelectItem key={d} value={d.toString()}>{d}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Desp. Adhesivo (%)</Label>
              <Select value={form.despAdhesivo} onValueChange={v => setForm({...form, despAdhesivo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(d => <SelectItem key={d} value={d.toString()}>{d}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Desp. Boquilla (%)</Label>
              <Select value={form.despBoquilla} onValueChange={v => setForm({...form, despBoquilla: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(d => <SelectItem key={d} value={d.toString()}>{d}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculate} className="w-full" size="lg"><Calculator className="mr-2 h-4 w-4" /> Calcular</Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-primary">Resultados</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(results.area, 2)}</div>
                <div className="text-sm text-muted-foreground">Area (m²)</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{results.cajas}</div>
                <div className="text-sm text-green-700">Cajas</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{formatNumber(results.adhesivo, 2)}</div>
                <div className="text-sm text-blue-700">Adhesivo (kg)</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-800">{formatNumber(results.boquilla, 2)}</div>
                <div className="text-sm text-amber-700">Boquilla (kg)</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Material</th><th className="pb-2 pr-4 text-right">Cantidad</th><th className="pb-2 pr-4 text-right">Unidad</th><th className="pb-2 text-right">Costo</th>
                </tr></thead>
                <tbody>
                  {[
                    { nombre: "Cerámica", cantidad: results.cajas, unidad: "caja", precio: results.cajas * selectedCeramica.precioCaja },
                    { nombre: "Adhesivo", cantidad: results.adhesivo, unidad: "kg", precio: results.adhesivo * 4.50 },
                    { nombre: "Boquilla", cantidad: results.boquilla, unidad: "kg", precio: results.boquilla * 6.00 },
                    { nombre: "Agua", cantidad: results.agua, unidad: "lt", precio: 0 },
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
