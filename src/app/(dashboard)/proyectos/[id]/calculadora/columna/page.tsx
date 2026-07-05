"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator, Save, Box, Package, Weight, Ruler, CheckCircle, Loader2 } from "lucide-react"
import { formatNumber, cn } from "@/lib/utils"
import { PlanGuard } from "@/components/shared/PlanGuard"

const dosificaciones = [
  { ratio: "1:2:2", resistencia: 280, cemento: 420, arena: 0.67, grava: 0.67 },
  { ratio: "1:2:3", resistencia: 226, cemento: 350, arena: 0.55, grava: 0.84 },
  { ratio: "1:2:4", resistencia: 200, cemento: 300, arena: 0.48, grava: 0.95 },
  { ratio: "1:3:4", resistencia: 159, cemento: 260, arena: 0.63, grava: 0.83 },
  { ratio: "1:3:5", resistencia: 140, cemento: 230, arena: 0.55, grava: 0.92 },
  { ratio: "1:3:6", resistencia: 119, cemento: 210, arena: 0.50, grava: 1.00 },
]

const diametros = [
  { value: "1/4", kgM: 0.395 },
  { value: "3/8", kgM: 0.888 },
  { value: "1/2", kgM: 1.580 },
  { value: "5/8", kgM: 2.466 },
  { value: "3/4", kgM: 3.556 },
]

const PESO_BOLSA = 42.5

export default function ColumnaCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    alto: "3.00",
    dimA: "0.30",
    dimB: "0.40",
    dosificacion: "1:3:4",
    cantidad: "1",
    desperdicioConcreto: "5",
    // Acero longitudinal
    longVarillas: "3.50",
    diametroLong: "1/2",
    cantidadVarillas: "4",
    traslapes: "si",
    largoTraslape: "0.40",
    despAcero: "5",
    // Estribos
    diametroEstribo: "3/8",
    separacionConfinada: "10",
    separacionCentral: "20",
  })

  const [results, setResults] = useState<{
    concreto: { volumen: number; cemento: { kg: number; bolsas: number }; arena: number; grava: number }
    aceroLong: number
    estribos: { cantidad: number; peso: number }
    totalAcero: number
    materiales: { nombre: string; cantidad: number; unidad: string; precio: number }[]
    total: number
  } | null>(null)

  const selectedDosificacion = dosificaciones.find(d => d.ratio === form.dosificacion) || dosificaciones[3]
  const selectedDiametroLong = diametros.find(d => d.value === form.diametroLong) || diametros[3]
  const selectedDiametroEstribo = diametros.find(d => d.value === form.diametroEstribo) || diametros[1]

  const handleSave = async () => {
    if (!results) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/proyectos/${projectId}/elementos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoElemento: "COLUMNA",
          descripcion: `Columna ${form.dimA}x${form.dimB}x${form.alto}m`,
          cantidad: parseInt(form.cantidad),
          dimA: parseFloat(form.dimA),
          dimB: parseFloat(form.dimB),
          dimH: parseFloat(form.alto),
          dosificacionConcretoId: null,
          resistencia: selectedDosificacion.resistencia,
          desperdicio: parseFloat(form.desperdicioConcreto),
          aceroLongitudinal: { diametro: form.diametroLong, cantidad: parseInt(form.cantidadVarillas), largo: form.longVarillas, peso: results.aceroLong },
          estribos: { diametro: form.diametroEstribo, cantidad: results.estribos.cantidad, peso: results.estribos.peso },
          materiales: JSON.stringify(results.materiales),
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

  const calculate = () => {
    const a = parseFloat(form.dimA)
    const b = parseFloat(form.dimB)
    const alto = parseFloat(form.alto)
    const cantidad = parseInt(form.cantidad)
    const desp = parseFloat(form.desperdicioConcreto) / 100

    if (!a || !b || !alto || !cantidad) return

    // Concreto
    const volumen = a * b * alto * cantidad
    const volDesp = volumen * (1 + desp)
    const cementoKg = volDesp * selectedDosificacion.cemento
    const cementoBolsas = Math.ceil(cementoKg / PESO_BOLSA)
    const arena = volDesp * selectedDosificacion.arena
    const grava = volDesp * selectedDosificacion.grava

    // Acero longitudinal
    const numVarillas = parseInt(form.cantidadVarillas)
    const longTotal = parseFloat(form.longVarillas) * alto * numVarillas * cantidad
    const traslapes = form.traslapes === "si" ? numVarillas * parseFloat(form.largoTraslape) * cantidad : 0
    const pesoLong = (longTotal + traslapes) * selectedDiametroLong.kgM

    // Estribos
    const perimetro = 2 * (a + b) - 8 * 0.04 + 2 * 0.12
    const zonas = 2
    const estConfinada = Math.ceil((alto * 0.15) / (parseFloat(form.separacionConfinada) / 100))
    const estCentral = Math.ceil((alto * 0.7) / (parseFloat(form.separacionCentral) / 100))
    const totalEstribos = (estConfinada + estCentral + 4) * zonas * cantidad
    const pesoEstribos = totalEstribos * perimetro * selectedDiametroEstribo.kgM

    const despAcero = parseFloat(form.despAcero) / 100
    const totalAcero = (pesoLong + pesoEstribos) * (1 + despAcero)

    const precioCemento = cementoBolsas * 8.60
    const precioArena = arena * 28.33
    const precioGrava = grava * 36.66
    const precioAcero = totalAcero * 10.50

    const materiales = [
      { nombre: "Cemento CP-40", cantidad: cementoBolsas, unidad: "bolsa", precio: precioCemento },
      { nombre: "Arena media", cantidad: arena, unidad: "m³", precio: precioArena },
      { nombre: "Grava 3/4\"", cantidad: grava, unidad: "m³", precio: precioGrava },
      { nombre: `Acero long. Ø${form.diametroLong}`, cantidad: totalAcero, unidad: "kg", precio: precioAcero },
    ]

    setResults({
      concreto: { volumen, cemento: { kg: cementoKg, bolsas: cementoBolsas }, arena, grava },
      aceroLong: pesoLong,
      estribos: { cantidad: totalEstribos, peso: pesoEstribos },
      totalAcero,
      materiales,
      total: precioCemento + precioArena + precioGrava + precioAcero,
    })
  }

  return (
    <PlanGuard>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/proyectos/${projectId}/calculadora`} className="p-2 hover:bg-accent rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ruler className="h-7 w-7 text-primary" />
              Calculadora de Columna
            </h1>
            <p className="text-muted-foreground">Concreto + Acero Longitudinal + Estribos</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleSave} disabled={!results || isSaving || saved}>
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
          ) : saved ? (
            <><CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Guardado</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Guardar en Proyecto</>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <Card>
          <CardHeader>
            <CardTitle>Parámetros de Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Esquema */}
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <div className="text-sm text-muted-foreground mb-2">Columna Rectangular</div>
              <svg className="mx-auto max-w-[200px]" viewBox="0 0 150 250">
                <rect x="40" y="20" width="70" height="210" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="45" y1="30" x2="45" y2="220" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5"/>
                <line x1="105" y1="30" x2="105" y2="220" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5"/>
                <text x="75" y="15" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Alto</text>
                <text x="25" y="125" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6" transform="rotate(-90 25 125)">a</text>
                <text x="75" y="245" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">b</text>
              </svg>
            </div>

            {/* Dimensiones */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Alto (m)</Label>
                <Input type="number" step="0.01" value={form.alto} onChange={e => setForm({...form, alto: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Dimensión A (m)</Label>
                <Input type="number" step="0.01" value={form.dimA} onChange={e => setForm({...form, dimA: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Dimensión B (m)</Label>
                <Input type="number" step="0.01" value={form.dimB} onChange={e => setForm({...form, dimB: e.target.value})} />
              </div>
            </div>

            {/* Dosificación */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Dosificación</Label>
                <Select value={form.dosificacion} onValueChange={v => setForm({...form, dosificacion: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dosificaciones.map(d => (
                      <SelectItem key={d.ratio} value={d.ratio}>{d.ratio} - {d.resistencia} kg/cm²</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Desperdicio Concreto (%)</Label>
                <Select value={form.desperdicioConcreto} onValueChange={v => setForm({...form, desperdicioConcreto: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(d => (
                      <SelectItem key={d} value={d.toString()}>{d}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cantidad de Columnas</Label>
              <Input type="number" min="1" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} />
            </div>

            {/* Acero Longitudinal */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Weight className="h-4 w-4" /> Acero Longitudinal</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Ø Varillas</Label>
                  <Select value={form.diametroLong} onValueChange={v => setForm({...form, diametroLong: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {diametros.map(d => (
                        <SelectItem key={d.value} value={d.value}>Ø{d.value} ({d.kgM} kg/m)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad Varillas</Label>
                  <Input type="number" min="1" value={form.cantidadVarillas} onChange={e => setForm({...form, cantidadVarillas: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Long. Varilla (m)</Label>
                  <Input type="number" step="0.01" value={form.longVarillas} onChange={e => setForm({...form, longVarillas: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Traslapes</Label>
                  <Select value={form.traslapes} onValueChange={v => setForm({...form, traslapes: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Con traslapes</SelectItem>
                      <SelectItem value="no">Sin traslapes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.traslapes === "si" && (
                  <div className="space-y-2">
                    <Label>Long. Traslape (m)</Label>
                    <Input type="number" step="0.01" value={form.largoTraslape} onChange={e => setForm({...form, largoTraslape: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            {/* Estribos */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Box className="h-4 w-4" /> Estribos</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Ø Estribo</Label>
                  <Select value={form.diametroEstribo} onValueChange={v => setForm({...form, diametroEstribo: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {diametros.filter(d => ["3/8","1/2"].includes(d.value)).map(d => (
                        <SelectItem key={d.value} value={d.value}>Ø{d.value} ({d.kgM} kg/m)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Separación Zona Confinada (cm)</Label>
                  <Input type="number" value={form.separacionConfinada} onChange={e => setForm({...form, separacionConfinada: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Separación Zona Central (cm)</Label>
                  <Input type="number" value={form.separacionCentral} onChange={e => setForm({...form, separacionCentral: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Desperdicio Acero (%)</Label>
                <Select value={form.despAcero} onValueChange={v => setForm({...form, despAcero: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(d => (
                      <SelectItem key={d} value={d.toString()}>{d}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calculate} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Calcular Materiales
            </Button>
          </CardContent>
        </Card>

        {/* Referencia dosificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Dosificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-2">Ratio</th>
                    <th className="pb-2 pr-2">Cem.</th>
                    <th className="pb-2 pr-2">Are.</th>
                    <th className="pb-2">Grv.</th>
                  </tr>
                </thead>
                <tbody>
                  {dosificaciones.map(d => (
                    <tr key={d.ratio} className={cn("border-b text-sm", form.dosificacion === d.ratio && "bg-primary/10 font-medium")}>
                      <td className="py-1.5 pr-2 font-mono">{d.ratio}</td>
                      <td className="py-1.5 pr-2">{d.cemento}</td>
                      <td className="py-1.5 pr-2">{d.arena}</td>
                      <td className="py-1.5">{d.grava}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {results && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Resultados del Cálculo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(results.concreto.volumen, 3)}</div>
                <div className="text-sm text-muted-foreground">Volumen (m³)</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{results.concreto.cemento.bolsas}</div>
                <div className="text-sm text-green-700">Bolsas Cemento</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{formatNumber(results.totalAcero, 2)}</div>
                <div className="text-sm text-blue-700">Peso Acero (kg)</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-800">{results.estribos.cantidad}</div>
                <div className="text-sm text-amber-700">Estribos</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Material</th>
                    <th className="pb-2 pr-4 text-right">Cantidad</th>
                    <th className="pb-2 pr-4 text-right">Unidad</th>
                    <th className="pb-2 text-right">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {results.materiales.map((m, i) => (
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

            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Concreto</div>
                <div>Cemento: {formatNumber(results.concreto.cemento.kg, 1)} kg</div>
                <div>Arena: {formatNumber(results.concreto.arena, 3)} m³</div>
                <div>Grava: {formatNumber(results.concreto.grava, 3)} m³</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Acero Longitudinal</div>
                <div>Peso: {formatNumber(results.aceroLong, 2)} kg</div>
                <div>Desperdicio: {form.despAcero}%</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Estribos</div>
                <div>Cantidad: {results.estribos.cantidad} pzas</div>
                <div>Peso: {formatNumber(results.estribos.peso, 2)} kg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!results && (
        <Card className="text-center py-12 border-dashed">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Ingresa los parámetros y haz clic en Calcular</h3>
          <p className="text-muted-foreground mt-1">Columna: Concreto + Acero Longitudinal + Estribos</p>
        </Card>
      )}
    </div>
    </PlanGuard>
  )
}
