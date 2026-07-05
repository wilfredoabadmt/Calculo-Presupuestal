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

const tiposTeja = [
  { nombre: "Teja romana", unidadesM2: 10 },
  { nombre: "Teja americana", unidadesM2: 8 },
  { nombre: "Teja tipo colonial", unidadesM2: 12 },
  { nombre: "Teja industrial", unidadesM2: 6 },
]

export default function TechoCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    ancho: "6.00",
    largo: "10.00",
    alto: "3.00",
    tipoTeja: "Teja romana",
    desperdicio: "5",
    cantidad: "1",
  })

  const [results, setResults] = useState<{
    areaReal: number
    areaTotal: number
    tejas: number
    total: number
  } | null>(null)

  const selectedTeja = tiposTeja.find(t => t.nombre === form.tipoTeja) || tiposTeja[0]

  const calculate = () => {
    const ancho = parseFloat(form.ancho)
    const largo = parseFloat(form.largo)
    const alto = parseFloat(form.alto)
    const cantidad = parseInt(form.cantidad)
    const desp = parseFloat(form.desperdicio) / 100
    if (!ancho || !largo || !alto || !cantidad) return

    const areaReal = Math.sqrt(Math.pow(largo, 2) + Math.pow(alto, 2)) * ancho
    const areaTotal = areaReal * cantidad
    const tejas = Math.ceil(areaTotal * selectedTeja.unidadesM2 * (1 + desp))

    setResults({
      areaReal,
      areaTotal,
      tejas,
      total: tejas * 15.00,
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
          tipoElemento: "TECHO",
          descripcion: `Techo ${form.tipoTeja} - ${form.ancho}x${form.largo}m`,
          cantidad: 1,
          dimAncho: parseFloat(form.ancho),
          dimLargo: parseFloat(form.largo),
          tipoTejaId: null,
          desperdicio: parseFloat(form.desperdicio),
          materiales: JSON.stringify([
            { nombre: "Tejas", cantidad: results.tejas, unidad: "pza", precio: results.tejas * 15 },
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
            <h1 className="text-3xl font-bold flex items-center gap-2"><Box className="h-7 w-7 text-primary" /> Calculadora de Techo</h1>
            <p className="text-muted-foreground">Tejas - area = √(L²+H²) × A</p>
          </div>
        </div>
        <Button variant="outline" disabled={!results || isSaving || saved} onClick={handleSave}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Parámetros de Entrada</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Techo con Pendiente</div>
            <svg className="mx-auto max-w-[300px]" viewBox="0 0 300 150">
              <polygon points="50,120 250,120 250,40" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <text x="150" y="140" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Ancho (A)</text>
              <text x="270" y="85" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Alto (H)</text>
              <text x="150" y="30" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Largo (L)</text>
              <line x1="50" y1="120" x2="250" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
            </svg>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Ancho (m)</Label><Input type="number" step="0.01" value={form.ancho} onChange={e => setForm({...form, ancho: e.target.value})} /></div>
            <div className="space-y-2"><Label>Largo (m)</Label><Input type="number" step="0.01" value={form.largo} onChange={e => setForm({...form, largo: e.target.value})} /></div>
            <div className="space-y-2"><Label>Alto pendiente (m)</Label><Input type="number" step="0.01" value={form.alto} onChange={e => setForm({...form, alto: e.target.value})} /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Tipo de Teja</Label>
              <Select value={form.tipoTeja} onValueChange={v => setForm({...form, tipoTeja: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tiposTeja.map(t => <SelectItem key={t.nombre} value={t.nombre}>{t.nombre} ({t.unidadesM2} u/m²)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Desperdicio (%)</Label>
              <Select value={form.desperdicio} onValueChange={v => setForm({...form, desperdicio: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(d => <SelectItem key={d} value={d.toString()}>{d}%</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Cantidad</Label><Input type="number" min="1" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} /></div>
          </div>

          <Button onClick={calculate} className="w-full" size="lg"><Calculator className="mr-2 h-4 w-4" /> Calcular</Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-primary">Resultados</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(results.areaReal, 2)}</div>
                <div className="text-sm text-muted-foreground">Area Real (m²)</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{results.tejas}</div>
                <div className="text-sm text-green-700">Tejas</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-800">Bs. {formatNumber(results.total, 2)}</div>
                <div className="text-sm text-amber-700">Costo Total</div>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <div>Area real = √({form.largo}² + {form.alto}²) × {form.ancho} = {formatNumber(results.areaReal, 2)} m²</div>
              <div>Area total = {formatNumber(results.areaReal, 2)} × {form.cantidad} = {formatNumber(results.areaTotal, 2)} m²</div>
              <div>Tejas = {formatNumber(results.areaTotal, 2)} × {selectedTeja.unidadesM2} × (1 + {form.desperdicio}%) = {results.tejas} pzas</div>
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
