"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputWithHelp } from "@/components/ui/input-with-help"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Calculator, 
  Save, 
  Layers, 
  CheckCircle, 
  Loader2 
} from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { PlanGuard } from "@/components/shared/PlanGuard"

const PRECIO_PANEL = 85.00 // por unidad de 1.22x2.44m
const PRECIO_CANAL = 22.00 // por unidad de 2.44m
const PRECIO_PARANTE = 25.00 // por unidad de 2.44m
const PRECIO_TORNILLO_ESTR = 0.08 // por unidad
const PRECIO_TORNILLO_PANEL = 0.06 // por unidad
const PRECIO_CHAZO = 0.15 // por chazo/puntilla

export default function ParedDrywallCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    descripcion: "",
    alto: "2.44",
    largo: "6.00",
    separacionParantes: "0.60",
    desperdicioPanel: "5",
    desperdicioOtros: "5",
    panelDoble: "no",
    cantidad: "1",
    redondeo: "entero",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [results, setResults] = useState<{
    areaTotal: number
    paneles: { cantidad: number; precio: number }
    canales: { cantidad: number; precio: number }
    parantes: { cantidad: number; precio: number }
    tornillosEstructura: { cantidad: number; precio: number }
    tornillosPanel: { cantidad: number; precio: number }
    chazos: { cantidad: number; precio: number }
    total: number
  } | null>(null)

  const validateAllFields = (shouldSetState = false) => {
    const errors: Record<string, string> = {}

    if (!form.alto || parseFloat(form.alto) <= 0) {
      errors.alto = "Debe ser un número mayor a 0"
    }
    if (!form.largo || parseFloat(form.largo) <= 0) {
      errors.largo = "Debe ser un número mayor a 0"
    }
    if (!form.separacionParantes || parseFloat(form.separacionParantes) <= 0) {
      errors.separacionParantes = "Debe ser mayor a 0"
    }
    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      errors.cantidad = "Debe ser mayor a 0"
    }

    if (shouldSetState) {
      setFormErrors(errors)
    }
    return Object.keys(errors).length === 0
  }

  const calculate = () => {
    if (!validateAllFields(true)) return

    const alto = parseFloat(form.alto)
    const largo = parseFloat(form.largo)
    const separacion = parseFloat(form.separacionParantes)
    const cantidad = parseInt(form.cantidad)
    const despPanel = 1 + (parseFloat(form.desperdicioPanel) / 100)
    const despOtros = 1 + (parseFloat(form.desperdicioOtros) / 100)
    const esDoble = form.panelDoble === "si"

    const areaTotal = alto * largo * cantidad
    const perimetro = 2 * (alto + largo) * cantidad

    const panelFactor = esDoble ? 2 : 1
    const areaPanelComercial = 1.22 * 2.44 // 2.9768 m²

    // 1. Paneles (Placas de Yeso)
    const panelQtyRaw = (areaTotal * panelFactor / areaPanelComercial) * despPanel
    const panelQty = form.redondeo === "entero" ? Math.ceil(panelQtyRaw) : panelQtyRaw

    // 2. Canales (Guías superior e inferior)
    // Se colocan horizontalmente abajo y arriba.
    const canalMetros = (largo * 2) * cantidad * despOtros
    const canalQtyRaw = canalMetros / 2.44
    const canalQty = form.redondeo === "entero" ? Math.ceil(canalQtyRaw) : canalQtyRaw

    // 3. Parantes (Montantes verticales)
    const parantesCountUnaPared = (largo / separacion) + 1
    const paranteMetros = parantesCountUnaPared * alto * cantidad * despOtros
    const paranteQtyRaw = paranteMetros / 2.44
    const paranteQty = form.redondeo === "entero" ? Math.ceil(paranteQtyRaw) : paranteQtyRaw

    // 4. Tornillos Estructura (metal a metal, aprox 10 por m²)
    const tornillosEstrRaw = areaTotal * 10 * despOtros
    const tornillosEstr = Math.ceil(tornillosEstrRaw)

    // 5. Tornillos Panel (placa a parante, aprox 30 por m² por panel)
    const tornillosPanelRaw = areaTotal * panelFactor * 20 * despOtros
    const tornillosPanel = Math.ceil(tornillosPanelRaw)

    // 6. Chazos / Puntillas para fijar canales (cada 60cm en perímetro)
    const chazosRaw = (perimetro / 0.60) * despOtros
    const chazos = Math.ceil(chazosRaw)

    // Costos
    const costPanel = panelQty * PRECIO_PANEL
    const costCanal = canalQty * PRECIO_CANAL
    const costParante = paranteQty * PRECIO_PARANTE
    const costTornillosEstr = tornillosEstr * PRECIO_TORNILLO_ESTR
    const costTornillosPanel = tornillosPanel * PRECIO_TORNILLO_PANEL
    const costChazos = chazos * PRECIO_CHAZO

    const total = costPanel + costCanal + costParante + costTornillosEstr + costTornillosPanel + costChazos

    setResults({
      areaTotal,
      paneles: { cantidad: panelQty, precio: costPanel },
      canales: { cantidad: canalQty, precio: costCanal },
      parantes: { cantidad: paranteQty, precio: costParante },
      tornillosEstructura: { cantidad: tornillosEstr, precio: costTornillosEstr },
      tornillosPanel: { cantidad: tornillosPanel, precio: costTornillosPanel },
      chazos: { cantidad: chazos, precio: costChazos },
      total,
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
          tipoElemento: "PARED_DRYWALL",
          descripcion: form.descripcion || `Pared Drywall - ${form.alto}x${form.largo}m`,
          cantidad: parseInt(form.cantidad),
          dimA: parseFloat(form.alto),
          dimB: parseFloat(form.largo),
          desperdicio: parseFloat(form.desperdicioPanel),
          materiales: JSON.stringify([
            { nombre: "Placa Drywall 1.22x2.44m", cantidad: results.paneles.cantidad, unidad: "unid", precio: results.paneles.precio },
            { nombre: "Canal Metálico 2.44m", cantidad: results.canales.cantidad, unidad: "unid", precio: results.canales.precio },
            { nombre: "Parante Metálico 2.44m", cantidad: results.parantes.cantidad, unidad: "unid", precio: results.parantes.precio },
            { nombre: "Tornillo Estructura 6x1", cantidad: results.tornillosEstructura.cantidad, unidad: "unid", precio: results.tornillosEstructura.precio },
            { nombre: "Tornillo Panel 7x7/16", cantidad: results.tornillosPanel.cantidad, unidad: "unid", precio: results.tornillosPanel.precio },
            { nombre: "Chazo y Puntilla", cantidad: results.chazos.cantidad, unidad: "unid", precio: results.chazos.precio },
          ]),
          costoTotal: results.total,
        }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push(`/proyectos/${projectId}/elementos`), 1500)
      } else {
        alert("Error al guardar en el presupuesto")
      }
    } catch {
      alert("Error de conexión al guardar")
    } finally {
      setIsSaving(false)
    }
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
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Layers className="h-7 w-7 text-primary" />
                Paredes Drywall
              </h1>
              <p className="text-muted-foreground">Tabiquería interior con paneles de yeso y perfiles metálicos</p>
            </div>
          </div>
          <div className="flex gap-2">
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
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <Card>
            <CardHeader><CardTitle>Parámetros de Entrada</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Pared Drywall (Estructura)</div>
                <svg className="mx-auto max-w-[320px] w-full" viewBox="0 0 320 160">
                  {/* Top canal (guia superior) */}
                  <rect x="50" y="22" width="220" height="6" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1"/>
                  <text x="160" y="18" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.5">Canal Superior</text>
                  {/* Bottom canal (guia inferior) */}
                  <rect x="50" y="122" width="220" height="6" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1"/>
                  <text x="160" y="142" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.5">Canal Inferior</text>
                  {/* Panel (placa de yeso) - semi-transparent */}
                  <rect x="50" y="28" width="220" height="94" fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4,3"/>
                  {/* Parantes (vertical studs) */}
                  <rect x="70" y="28" width="4" height="94" fill="#3b82f6" opacity="0.25" stroke="#3b82f6" strokeWidth="0.8"/>
                  <rect x="120" y="28" width="4" height="94" fill="#3b82f6" opacity="0.25" stroke="#3b82f6" strokeWidth="0.8"/>
                  <rect x="170" y="28" width="4" height="94" fill="#3b82f6" opacity="0.25" stroke="#3b82f6" strokeWidth="0.8"/>
                  <rect x="220" y="28" width="4" height="94" fill="#3b82f6" opacity="0.25" stroke="#3b82f6" strokeWidth="0.8"/>
                  <rect x="266" y="28" width="4" height="94" fill="#3b82f6" opacity="0.25" stroke="#3b82f6" strokeWidth="0.8"/>
                  {/* Separation dimension between parantes */}
                  <line x1="74" y1="150" x2="120" y2="150" stroke="#a855f7" strokeWidth="1"/>
                  <line x1="74" y1="146" x2="74" y2="154" stroke="#a855f7" strokeWidth="0.8"/>
                  <line x1="120" y1="146" x2="120" y2="154" stroke="#a855f7" strokeWidth="0.8"/>
                  <text x="97" y="158" textAnchor="middle" fontSize="8" fill="#a855f7" fontWeight="600">
                    {form.separacionParantes ? `${form.separacionParantes} m` : "(Sep)"}
                  </text>
                  {/* Largo (top) */}
                  <line x1="50" y1="9" x2="270" y2="9" stroke="#f97316" strokeWidth="1.2"/>
                  <line x1="50" y1="5" x2="50" y2="13" stroke="#f97316" strokeWidth="1"/>
                  <line x1="270" y1="5" x2="270" y2="13" stroke="#f97316" strokeWidth="1"/>
                  <text x="160" y="5" textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="600">
                    Largo {form.largo ? `= ${form.largo} m` : "(L)"}
                  </text>
                  {/* Alto (left vertical) */}
                  <line x1="35" y1="28" x2="35" y2="122" stroke="#3b82f6" strokeWidth="1.2"/>
                  <line x1="31" y1="28" x2="39" y2="28" stroke="#3b82f6" strokeWidth="1"/>
                  <line x1="31" y1="122" x2="39" y2="122" stroke="#3b82f6" strokeWidth="1"/>
                  <text x="22" y="80" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="600" transform="rotate(-90,22,80)">
                    Alto {form.alto ? `= ${form.alto} m` : "(A)"}
                  </text>
                  {/* Labels */}
                  <text x="72" y="80" textAnchor="middle" fontSize="7" fill="#3b82f6" opacity="0.7" transform="rotate(-90,72,80)">Parante</text>
                </svg>
                <div className="flex justify-center gap-3 mt-2 flex-wrap text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#f97316"}}/>
                    <span className="text-muted-foreground">Largo</span>
                    {form.largo && <span className="font-bold text-orange-500">{form.largo} m</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#3b82f6"}}/>
                    <span className="text-muted-foreground">Alto</span>
                    {form.alto && <span className="font-bold text-blue-600">{form.alto} m</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#a855f7"}}/>
                    <span className="text-muted-foreground">Separación</span>
                    {form.separacionParantes && <span className="font-bold text-purple-600">{form.separacionParantes} m</span>}
                  </span>
                </div>
              </div>

              <InputWithHelp
                label="Descripción del Elemento"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej. Tabique divisorio Dormitorio"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithHelp
                  label="Alto"
                  unit="m"
                  type="number"
                  value={form.alto}
                  onChange={e => setForm({ ...form, alto: e.target.value })}
                  error={formErrors.alto}
                />
                <InputWithHelp
                  label="Largo"
                  unit="m"
                  type="number"
                  value={form.largo}
                  onChange={e => setForm({ ...form, largo: e.target.value })}
                  error={formErrors.largo}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Separación de Parantes (m)</Label>
                  <Select value={form.separacionParantes} onValueChange={v => setForm({ ...form, separacionParantes: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.40">0.40 m</SelectItem>
                      <SelectItem value="0.48">0.48 m</SelectItem>
                      <SelectItem value="0.60">0.60 m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Placa Doble Cara</Label>
                  <Select value={form.panelDoble} onValueChange={v => setForm({ ...form, panelDoble: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Una cara (Revoco simple)</SelectItem>
                      <SelectItem value="si">Doble cara (Tabique completo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithHelp
                  label="Desperdicio Placas"
                  unit="%"
                  type="number"
                  value={form.desperdicioPanel}
                  onChange={e => setForm({ ...form, desperdicioPanel: e.target.value })}
                />
                <InputWithHelp
                  label="Desperdicio Perfiles"
                  unit="%"
                  type="number"
                  value={form.desperdicioOtros}
                  onChange={e => setForm({ ...form, desperdicioOtros: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithHelp
                  label="Cantidad de Divisiones"
                  type="number"
                  value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  error={formErrors.cantidad}
                />
                <div className="space-y-2">
                  <Label>Tipo Redondeo</Label>
                  <Select value={form.redondeo} onValueChange={v => setForm({ ...form, redondeo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entero">Entero superior</SelectItem>
                      <SelectItem value="decimal">Mantener decimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculate} className="w-full" size="lg" disabled={!validateAllFields()}>
                <Calculator className="mr-2 h-4 w-4" /> Calcular Materiales
              </Button>
            </CardContent>
          </Card>

          {results ? (
            <Card className="h-fit">
              <CardHeader><CardTitle>Resultados Obtenidos</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-lg text-center border">
                  <div className="text-xl font-bold text-primary">{formatNumber(results.areaTotal, 2)} m²</div>
                  <div className="text-xs text-muted-foreground">Área Total Calculada</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Material / Insumo</th>
                        <th className="pb-2 pr-4 text-right">Cant.</th>
                        <th className="pb-2 pr-4 text-right">Unidad</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Placa de Yeso Drywall</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.paneles.cantidad, 1)}</td>
                        <td className="py-2 pr-4 text-right">unid</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.paneles.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Canal Metálico 2.44m</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.canales.cantidad, 1)}</td>
                        <td className="py-2 pr-4 text-right">unid</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.canales.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Parante Metálico 2.44m</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.parantes.cantidad, 1)}</td>
                        <td className="py-2 pr-4 text-right">unid</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.parantes.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Tornillos Estructura 6x1"</td>
                        <td className="py-2 pr-4 text-right font-mono">{results.tornillosEstructura.cantidad}</td>
                        <td className="py-2 pr-4 text-right">unid</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.tornillosEstructura.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Tornillos Placa 7x7/16"</td>
                        <td className="py-2 pr-4 text-right font-mono">{results.tornillosPanel.cantidad}</td>
                        <td className="py-2 pr-4 text-right">unid</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.tornillosPanel.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Chazo y Puntilla metal</td>
                        <td className="py-2 pr-4 text-right font-mono">{results.chazos.cantidad}</td>
                        <td className="py-2 pr-4 text-right">unid</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.chazos.precio, 2)}</td>
                      </tr>
                      <tr className="bg-primary/5 font-bold text-base">
                        <td className="py-3 pr-4" colSpan={3}>TOTAL COSTO</td>
                        <td className="py-3 text-right text-primary">Bs. {formatNumber(results.total, 2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12 border-dashed flex flex-col justify-center items-center">
              <Calculator className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-sm font-medium">Ingresa los parámetros y haz clic en Calcular</h3>
            </Card>
          )}
        </div>
      </div>
    </PlanGuard>
  )
}
