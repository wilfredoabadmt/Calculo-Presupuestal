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
import { PlanGuard } from "@/components/shared/PlanGuard"

export default function CieloCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    ancho: "4.00",
    largo: "5.00",
    separacionViguetas: "0.60",
    separacionOmegas: "0.60",
    largoAngulo: "3.00",
    despPaneles: "5",
    cantidad: "1",
  })

  const [results, setResults] = useState<{
    area: number
    paneles: number
    viguetas: number
    omegas: number
    angulos: number
    masilla: number
    tornillos: number
    total: number
  } | null>(null)

  const calculate = () => {
    const ancho = parseFloat(form.ancho)
    const largo = parseFloat(form.largo)
    const cantidad = parseInt(form.cantidad)
    if (!ancho || !largo || !cantidad) return

    const area = ancho * largo * cantidad
    const areaPanel = 1.20 * 2.40
    const paneles = Math.ceil(area / areaPanel * (1 + parseFloat(form.despPaneles) / 100))

    const viguetas = Math.ceil(largo / parseFloat(form.separacionViguetas)) * cantidad
    const omegas = Math.ceil(largo / parseFloat(form.separacionOmegas)) * cantidad
    const perimetro = 2 * (ancho + largo)
    const angulos = Math.ceil(perimetro / parseFloat(form.largoAngulo)) * cantidad
    const masilla = area * 0.5
    const tornillos = paneles * 4

    setResults({
      area, paneles, viguetas, omegas, angulos, masilla, tornillos,
      total: paneles * 65.00 + viguetas * 18.00 + omegas * 15.00 + angulos * 12.00 + masilla * 8.00 + tornillos * 0.50,
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
          tipoElemento: "CIELO_RASO",
          descripcion: `Cielo raso ${form.ancho}x${form.largo}m`,
          cantidad: parseInt(form.cantidad) || 1,
          dimAncho: parseFloat(form.ancho),
          dimLargo: parseFloat(form.largo),
          desperdicio: parseFloat(form.despPaneles),
          materiales: JSON.stringify([
            { nombre: "Paneles", cantidad: results.paneles, unidad: "pza", precio: results.paneles * 65.00 },
            { nombre: "Viguetas", cantidad: results.viguetas, unidad: "ml", precio: results.viguetas * 18.00 },
            { nombre: "Omegas", cantidad: results.omegas, unidad: "ml", precio: results.omegas * 15.00 },
            { nombre: "Ángulo", cantidad: results.angulos, unidad: "ml", precio: results.angulos * 12.00 },
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
    <PlanGuard>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/proyectos/${projectId}/calculadora`} className="p-2 hover:bg-accent rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Box className="h-7 w-7 text-primary" /> Calculadora de Cielo Raso</h1>
            <p className="text-muted-foreground">Paneles + Viguetas + Omegas + Ángulo Perimetral</p>
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
            <div className="text-sm text-muted-foreground mb-2">Cielo Raso - Vista Inferior</div>
            <svg className="mx-auto max-w-[250px]" viewBox="0 0 250 150">
              <rect x="20" y="20" width="210" height="110" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              {[0,1,2,3,4].map(i => <line key={`v${i}`} x1={62 + i * 42} y1="20" x2={62 + i * 42} y2="130" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3"/>)}
              {[0,1].map(i => <line key={`h${i}`} x1="20" y1={57 + i * 36} x2="230" y2={57 + i * 36} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3"/>)}
              <text x="125" y="148" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Viguetas horizontales</text>
              <text x="8" y="75" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6" transform="rotate(-90 8 75)">Omegas</text>
            </svg>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Ancho (m)</Label><Input type="number" step="0.01" value={form.ancho} onChange={e => setForm({...form, ancho: e.target.value})} /></div>
            <div className="space-y-2"><Label>Largo (m)</Label><Input type="number" step="0.01" value={form.largo} onChange={e => setForm({...form, largo: e.target.value})} /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Separación Viguetas (m)</Label><Input type="number" step="0.01" value={form.separacionViguetas} onChange={e => setForm({...form, separacionViguetas: e.target.value})} /></div>
            <div className="space-y-2"><Label>Separación Omegas (m)</Label><Input type="number" step="0.01" value={form.separacionOmegas} onChange={e => setForm({...form, separacionOmegas: e.target.value})} /></div>
            <div className="space-y-2"><Label>Largo Ángulo (m)</Label><Input type="number" step="0.01" value={form.largoAngulo} onChange={e => setForm({...form, largoAngulo: e.target.value})} /></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Desp. Paneles (%)</Label>
              <Select value={form.despPaneles} onValueChange={v => setForm({...form, despPaneles: v})}>
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
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(results.area, 2)}</div>
                <div className="text-sm text-muted-foreground">Area (m²)</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{results.paneles}</div>
                <div className="text-sm text-green-700">Paneles</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{results.viguetas}</div>
                <div className="text-sm text-blue-700">Viguetas</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-800">{results.omegas}</div>
                <div className="text-sm text-amber-700">Omegas</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Material</th><th className="pb-2 pr-4 text-right">Cantidad</th><th className="pb-2 pr-4 text-right">Unidad</th><th className="pb-2 text-right">Costo</th>
                </tr></thead>
                <tbody>
                  {[
                    { nombre: "Panel yeso 1.20×2.40", cantidad: results.paneles, unidad: "pza", precio: results.paneles * 65.00 },
                    { nombre: "Vigueta metálica", cantidad: results.viguetas, unidad: "pza", precio: results.viguetas * 18.00 },
                    { nombre: "Omega metálica", cantidad: results.omegas, unidad: "pza", precio: results.omegas * 15.00 },
                    { nombre: "Ángulo perimetral", cantidad: results.angulos, unidad: "pza", precio: results.angulos * 12.00 },
                    { nombre: "Masilla", cantidad: results.masilla, unidad: "kg", precio: results.masilla * 8.00 },
                    { nombre: "Tornillos", cantidad: results.tornillos, unidad: "pza", precio: results.tornillos * 0.50 },
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
                <div className="font-medium">Estructura</div>
                <div>Viguetas: {results.viguetas} pzas</div>
                <div>Omegas: {results.omegas} pzas</div>
                <div>Ángulo: {results.angulos} pzas</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Acabados</div>
                <div>Paneles: {results.paneles} pzas</div>
                <div>Masilla: {formatNumber(results.masilla, 2)} kg</div>
                <div>Tornillos: {results.tornillos} pzas</div>
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
    </PlanGuard>
  )
}
