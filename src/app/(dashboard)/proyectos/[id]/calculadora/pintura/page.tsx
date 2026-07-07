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
  Droplets, 
  CheckCircle, 
  Loader2 
} from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { PlanGuard } from "@/components/shared/PlanGuard"

const PRECIO_PINTURA_LT = 4.80 // por litro de pintura látex estándar
const PRECIO_SELLADOR_LT = 3.50 // por litro de sellador acrílico

export default function PinturaCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    descripcion: "",
    area: "20.00",
    rendimiento: "8.00",
    manos: "2",
    lados: "1",
    desperdicio: "5",
    cantidad: "1",
    redondeo: "entero",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [results, setResults] = useState<{
    areaNeta: number
    areaTotalPintar: number
    pinturaLitros: number
    pinturaGalones: number
    selladorLitros: number
    costoPintura: number
    costoSellador: number
    total: number
  } | null>(null)

  const validateAllFields = (shouldSetState = false) => {
    const errors: Record<string, string> = {}

    if (!form.area || parseFloat(form.area) <= 0) {
      errors.area = "Debe ser un número mayor a 0"
    }
    if (!form.rendimiento || parseFloat(form.rendimiento) <= 0) {
      errors.rendimiento = "Debe ser un número mayor a 0"
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

    const area = parseFloat(form.area)
    const rendimiento = parseFloat(form.rendimiento)
    const manos = parseInt(form.manos)
    const lados = parseInt(form.lados)
    const cantidad = parseInt(form.cantidad)
    const desperdicio = 1 + (parseFloat(form.desperdicio) / 100)

    const areaNeta = area * cantidad
    const areaTotalPintar = area * lados * manos * cantidad

    // Pintura (Látex)
    const pinturaLitrosRaw = (areaTotalPintar / rendimiento) * desperdicio
    const pinturaLitros = form.redondeo === "entero" ? Math.ceil(pinturaLitrosRaw) : pinturaLitrosRaw
    const pinturaGalones = pinturaLitros / 3.785

    // Sellador (aprox 1 mano, rendimiento promedio 10 m²/lt)
    const areaSellador = area * lados * cantidad
    const selladorLitrosRaw = (areaSellador / 10.0) * desperdicio
    const selladorLitros = form.redondeo === "entero" ? Math.ceil(selladorLitrosRaw) : selladorLitrosRaw

    const costoPintura = pinturaLitros * PRECIO_PINTURA_LT
    const costoSellador = selladorLitros * PRECIO_SELLADOR_LT
    const total = costoPintura + costoSellador

    setResults({
      areaNeta,
      areaTotalPintar,
      pinturaLitros,
      pinturaGalones,
      selladorLitros,
      costoPintura,
      costoSellador,
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
          tipoElemento: "PINTURA",
          descripcion: form.descripcion || `Pintura en Paredes - ${form.area} m²`,
          cantidad: parseInt(form.cantidad),
          dimA: parseFloat(form.area),
          desperdicio: parseFloat(form.desperdicio),
          materiales: JSON.stringify([
            { nombre: "Pintura Látex Lavable", cantidad: results.pinturaLitros, unidad: "lt", precio: results.costoPintura },
            { nombre: "Sellador Acrílico Muro", cantidad: results.selladorLitros, unidad: "lt", precio: results.costoSellador },
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
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Droplets className="h-7 w-7 text-primary" />
                Pintura
              </h1>
              <p className="text-muted-foreground">Acabados decorativos y sellado para superficies de mampostería</p>
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
                <div className="text-sm text-muted-foreground mb-2">Superficie a Pintar</div>
                <svg className="mx-auto max-w-[300px] w-full" viewBox="0 0 300 160">
                  {/* Wall surface */}
                  <rect x="50" y="20" width="180" height="110" fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="1.5"/>
                  {/* Paint layers (manos) */}
                  {form.manos === "1" || form.manos === "2" || form.manos === "3" ? (
                    <rect x="54" y="24" width="172" height="102" fill="#f97316" opacity="0.08" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2,2"/>
                  ) : null}
                  {form.manos === "2" || form.manos === "3" ? (
                    <rect x="58" y="28" width="164" height="94" fill="#f97316" opacity="0.08" stroke="#f97316" strokeWidth="0.5" strokeDasharray="2,2"/>
                  ) : null}
                  {form.manos === "3" ? (
                    <rect x="62" y="32" width="156" height="86" fill="#f97316" opacity="0.1" stroke="#f97316" strokeWidth="0.5"/>
                  ) : null}
                  {/* Paint roller icon */}
                  <rect x="248" y="40" width="8" height="50" rx="3" fill="#f97316" opacity="0.3"/>
                  <line x1="252" y1="40" x2="252" y2="25" stroke="#f97316" strokeWidth="1.5"/>
                  <line x1="252" y1="25" x2="265" y2="25" stroke="#f97316" strokeWidth="1.5"/>
                  <text x="268" y="29" fontSize="8" fill="#f97316" opacity="0.6">1ª mano</text>
                  {/* Area label in center */}
                  <text x="140" y="75" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.3" fontWeight="600">
                    {form.area ? `${form.area} m²` : "Área"}
                  </text>
                  <text x="140" y="90" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.25">
                    {form.manos ? `${form.manos} mano${form.manos === "2" ? "s" : ""}` : ""}
                  </text>
                  {form.lados === "2" && (
                    <text x="140" y="102" textAnchor="middle" fontSize="7" fill="#22c55e" opacity="0.6">Ambos lados</text>
                  )}
                  {/* Area dimension - width */}
                  <line x1="50" y1="145" x2="230" y2="145" stroke="#f97316" strokeWidth="1.2"/>
                  <line x1="50" y1="141" x2="50" y2="149" stroke="#f97316" strokeWidth="1"/>
                  <line x1="230" y1="141" x2="230" y2="149" stroke="#f97316" strokeWidth="1"/>
                  <text x="140" y="155" textAnchor="middle" fontSize="9" fill="#f97316" fontWeight="600">
                    {form.area ? `Área = ${form.area} m²` : "(Área)"}
                  </text>
                  {/* Manos count indicator (right side) */}
                  <line x1="280" y1="45" x2="280" y2="115" stroke="#3b82f6" strokeWidth="1.2"/>
                  <line x1="276" y1="45" x2="284" y2="45" stroke="#3b82f6" strokeWidth="1"/>
                  <line x1="276" y1="115" x2="284" y2="115" stroke="#3b82f6" strokeWidth="1"/>
                  <text x="293" y="83" textAnchor="middle" fontSize="8" fill="#3b82f6" fontWeight="600" transform="rotate(-90,293,83)">
                    {form.manos ? `${form.manos} Capas` : "(Manos)"}
                  </text>
                </svg>
                <div className="flex justify-center gap-4 mt-2 flex-wrap text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#f97316"}}/>
                    <span className="text-muted-foreground">Área</span>
                    {form.area && <span className="font-bold text-orange-500">{form.area} m²</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#3b82f6"}}/>
                    <span className="text-muted-foreground">Manos</span>
                    {form.manos && <span className="font-bold text-blue-600">{form.manos}</span>}
                  </span>
                  {form.lados === "2" && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#22c55e"}}/>
                      <span className="font-bold text-green-600">Ambos lados</span>
                    </span>
                  )}
                </div>
              </div>

              <InputWithHelp
                label="Descripción del Elemento"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej. Pintado Dormitorio Principal"
              />

              <div className="grid grid-cols-2 gap-4">
                <InputWithHelp
                  label="Área de Pared"
                  unit="m²"
                  type="number"
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  error={formErrors.area}
                />
                <InputWithHelp
                  label="Rendimiento Pintura"
                  unit="m²/lt"
                  type="number"
                  value={form.rendimiento}
                  onChange={e => setForm({ ...form, rendimiento: e.target.value })}
                  error={formErrors.rendimiento}
                  helpText="Rendimiento promedio: 6 a 10 m² por litro por mano"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Manos (Capas)</Label>
                  <Select value={form.manos} onValueChange={v => setForm({ ...form, manos: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mano (Retoque)</SelectItem>
                      <SelectItem value="2">2 manos (Estándar)</SelectItem>
                      <SelectItem value="3">3 manos (Fuerte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lados a Pintar</Label>
                  <Select value={form.lados} onValueChange={v => setForm({ ...form, lados: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 lado (Solo interior)</SelectItem>
                      <SelectItem value="2">2 lados (Interior + Exterior)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputWithHelp
                  label="Cantidad de Áreas Iguales"
                  type="number"
                  value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  error={formErrors.cantidad}
                />
                <InputWithHelp
                  label="Desperdicio"
                  unit="%"
                  type="number"
                  value={form.desperdicio}
                  onChange={e => setForm({ ...form, desperdicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo Redondeo</Label>
                <Select value={form.redondeo} onValueChange={v => setForm({ ...form, redondeo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entero">Entero superior (Lts completos)</SelectItem>
                    <SelectItem value="decimal">Mantener decimales</SelectItem>
                  </SelectContent>
                </Select>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center border">
                    <div className="text-xl font-bold text-primary">{formatNumber(results.areaNeta, 1)} m²</div>
                    <div className="text-xs text-muted-foreground">Área Neta Superficie</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center border">
                    <div className="text-xl font-bold text-primary">{formatNumber(results.areaTotalPintar, 1)} m²</div>
                    <div className="text-xs text-muted-foreground">Área Acumulada Capas</div>
                  </div>
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
                        <td className="py-2 pr-4 font-medium">Pintura Látex Lavable</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.pinturaLitros, 1)}</td>
                        <td className="py-2 pr-4 text-right">lt</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.costoPintura, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Sellador Acrílico</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.selladorLitros, 1)}</td>
                        <td className="py-2 pr-4 text-right">lt</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.costoSellador, 2)}</td>
                      </tr>
                      <tr className="border-b bg-muted/40 text-xs">
                        <td className="py-1.5 pr-4 text-muted-foreground">Equivalencia Pintura Galones</td>
                        <td className="py-1.5 pr-4 text-right font-mono text-muted-foreground">{formatNumber(results.pinturaGalones, 2)}</td>
                        <td className="py-1.5 pr-4 text-right text-muted-foreground">galones</td>
                        <td className="py-1.5 text-right text-muted-foreground">-</td>
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
