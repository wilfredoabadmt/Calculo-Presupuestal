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
  Square, 
  CheckCircle, 
  Loader2 
} from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { PlanGuard } from "@/components/shared/PlanGuard"

const tiposCeramica = [
  { nombre: "Cerámica 30x30", side: 0.30, unidadesCaja: 11, precioCaja: 45 },
  { nombre: "Cerámica 40x40", side: 0.40, unidadesCaja: 6, precioCaja: 55 },
  { nombre: "Cerámica 60x60", side: 0.60, unidadesCaja: 3, precioCaja: 85 },
  { nombre: "Porcelanato 60x60", side: 0.60, unidadesCaja: 3, precioCaja: 120 },
  { nombre: "Porcelanato 80x80", side: 0.80, unidadesCaja: 2, precioCaja: 180 },
]

const PRECIO_ADHESIVO_KG = 4.50 // Bs. por kg
const PRECIO_BOQUILLA_KG = 6.00 // Bs. por kg

export default function ZocaloCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    descripcion: "",
    longitud: "15.00",
    alturaZocalo: "0.07",
    tipoCeramica: "Cerámica 30x30",
    despCeramica: "5",
    despAdhesivo: "5",
    despBoquilla: "5",
    cantidad: "1",
    redondeo: "entero",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [results, setResults] = useState<{
    longitudTotal: number
    tirasPorPieza: number
    piezasCeramica: number
    cajasCeramica: number
    adhesivoKg: number
    boquillaKg: number
    costoCeramica: number
    costoAdhesivo: number
    costoBoquilla: number
    total: number
  } | null>(null)

  const validateAllFields = (shouldSetState = false) => {
    const errors: Record<string, string> = {}

    if (!form.longitud || parseFloat(form.longitud) <= 0) {
      errors.longitud = "Debe ser un número mayor a 0"
    }
    if (!form.alturaZocalo || parseFloat(form.alturaZocalo) <= 0) {
      errors.alturaZocalo = "Debe ser mayor a 0"
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

    const longitud = parseFloat(form.longitud)
    const alturaZocalo = parseFloat(form.alturaZocalo)
    const cantidad = parseInt(form.cantidad)
    const despCer = 1 + (parseFloat(form.despCeramica) / 100)
    const despAdh = 1 + (parseFloat(form.despAdhesivo) / 100)
    const despBoq = 1 + (parseFloat(form.despBoquilla) / 100)

    const longitudTotal = longitud * cantidad

    const selectedCer = tiposCeramica.find(c => c.nombre === form.tipoCeramica) || tiposCeramica[0]

    // Cuántas tiras de zócalo salen de 1 pieza
    const tirasPorPieza = Math.floor(selectedCer.side / alturaZocalo) || 1
    // Longitud lineal producida por una sola pieza
    const longPorPieza = selectedCer.side * tirasPorPieza

    const piezasCeramicaRaw = (longitudTotal / longPorPieza) * despCer
    const piezasCeramica = form.redondeo === "entero" ? Math.ceil(piezasCeramicaRaw) : piezasCeramicaRaw

    const cajasCeramicaRaw = piezasCeramica / selectedCer.unidadesCaja
    const cajasCeramica = form.redondeo === "entero" ? Math.ceil(cajasCeramicaRaw) : cajasCeramicaRaw

    // Rendimientos promedio: Pegamento = 0.2 kg/m lineal por 7cm, Boquilla = 0.05 kg/m lineal
    const adhesivoKgRaw = longitudTotal * 0.2 * despAdh
    const adhesivoKg = form.redondeo === "entero" ? Math.ceil(adhesivoKgRaw) : adhesivoKgRaw

    const boquillaKgRaw = longitudTotal * 0.05 * despBoq
    const boquillaKg = form.redondeo === "entero" ? Math.ceil(boquillaKgRaw) : boquillaKgRaw

    // Costos
    const costoCeramica = cajasCeramica * selectedCer.precioCaja
    const costoAdhesivo = adhesivoKg * PRECIO_ADHESIVO_KG
    const costoBoquilla = boquillaKg * PRECIO_BOQUILLA_KG
    const total = costoCeramica + costoAdhesivo + costoBoquilla

    setResults({
      longitudTotal,
      tirasPorPieza,
      piezasCeramica,
      cajasCeramica,
      adhesivoKg,
      boquillaKg,
      costoCeramica,
      costoAdhesivo,
      costoBoquilla,
      total,
    })
  }

  const handleSave = async () => {
    if (!results) return
    setIsSaving(true)

    try {
      const selectedCer = tiposCeramica.find(c => c.nombre === form.tipoCeramica) || tiposCeramica[0]
      const res = await fetch(`/api/proyectos/${projectId}/elementos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoElemento: "ZOCALO",
          descripcion: form.descripcion || `Zócalos de ${selectedCer.nombre} - ${form.longitud}m`,
          cantidad: parseInt(form.cantidad),
          dimA: parseFloat(form.longitud),
          dimB: parseFloat(form.alturaZocalo),
          desperdicio: parseFloat(form.despCeramica),
          materiales: JSON.stringify([
            { nombre: `Cerámica ${selectedCer.nombre} (Zócalo)`, cantidad: results.cajasCeramica, unidad: "caja", precio: results.costoCeramica },
            { nombre: "Pegamento Adhesivo Zócalo", cantidad: results.adhesivoKg, unidad: "kg", precio: results.costoAdhesivo },
            { nombre: "Boquilla de Color", cantidad: results.boquillaKg, unidad: "kg", precio: results.costoBoquilla },
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
                <Square className="h-7 w-7 text-primary" />
                Zócalos Cerámicos
              </h1>
              <p className="text-muted-foreground">Cálculo de rodapiés/zócalos y cortes de cerámica o porcelanato</p>
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
                <div className="text-sm text-muted-foreground mb-2">Zócalo Cerámico</div>
                <svg className="mx-auto max-w-[320px] w-full" viewBox="0 0 320 140">
                  {/* Base wall */}
                  <rect x="60" y="30" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,3" opacity="0.4"/>
                  {/* Zocalo strip on bottom of wall */}
                  <rect x="60" y="80" width="200" height="30" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.5"/>
                  {/* Tile lines inside zocalo */}
                  <line x1="110" y1="80" x2="110" y2="110" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
                  <line x1="160" y1="80" x2="160" y2="110" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
                  <line x1="210" y1="80" x2="210" y2="110" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
                  {/* Longitud (top) */}
                  <line x1="60" y1="17" x2="260" y2="17" stroke="#f97316" strokeWidth="1.2"/>
                  <line x1="60" y1="13" x2="60" y2="21" stroke="#f97316" strokeWidth="1"/>
                  <line x1="260" y1="13" x2="260" y2="21" stroke="#f97316" strokeWidth="1"/>
                  <text x="160" y="11" textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="600">
                    Largo {form.longitud ? `= ${form.longitud} m` : "(L)"}
                  </text>
                  {/* Altura zocalo (right) */}
                  <line x1="275" y1="80" x2="275" y2="110" stroke="#3b82f6" strokeWidth="1.2"/>
                  <line x1="271" y1="80" x2="279" y2="80" stroke="#3b82f6" strokeWidth="1"/>
                  <line x1="271" y1="110" x2="279" y2="110" stroke="#3b82f6" strokeWidth="1"/>
                  <text x="298" y="98" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="600">
                    H {form.alturaZocalo ? `= ${form.alturaZocalo}` : "(H)"}
                  </text>
                  {/* Label */}
                  <text x="160" y="100" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">ZÓCALO</text>
                  <text x="160" y="60" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.3">PARED</text>
                </svg>
                <div className="flex justify-center gap-4 mt-2 flex-wrap text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#f97316"}}/>
                    <span className="text-muted-foreground">Largo</span>
                    {form.longitud && <span className="font-bold text-orange-500">{form.longitud} m</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#3b82f6"}}/>
                    <span className="text-muted-foreground">Altura Zócalo</span>
                    {form.alturaZocalo && <span className="font-bold text-blue-600">{form.alturaZocalo} m</span>}
                  </span>
                </div>
              </div>

              <InputWithHelp
                label="Descripción del Elemento"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej. Rodapié Cerámico Sala Estar"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithHelp
                  label="Longitud Lineal"
                  unit="m"
                  type="number"
                  value={form.longitud}
                  onChange={e => setForm({ ...form, longitud: e.target.value })}
                  error={formErrors.longitud}
                />
                <InputWithHelp
                  label="Altura del Zócalo"
                  unit="m"
                  type="number"
                  value={form.alturaZocalo}
                  onChange={e => setForm({ ...form, alturaZocalo: e.target.value })}
                  error={formErrors.alturaZocalo}
                  helpText="Ej. 0.07 para 7 cm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo Cerámica a Cortar</Label>
                  <Select value={form.tipoCeramica} onValueChange={v => setForm({ ...form, tipoCeramica: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tiposCeramica.map(c => (
                        <SelectItem key={c.nombre} value={c.nombre}>
                          {c.nombre} ({c.unidadesCaja} uds/caja)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <InputWithHelp
                  label="Cantidad Elementos Iguales"
                  type="number"
                  value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                  error={formErrors.cantidad}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <InputWithHelp
                  label="Desp. Cerámica"
                  unit="%"
                  type="number"
                  value={form.despCeramica}
                  onChange={e => setForm({ ...form, despCeramica: e.target.value })}
                />
                <InputWithHelp
                  label="Desp. Pegamento"
                  unit="%"
                  type="number"
                  value={form.despAdhesivo}
                  onChange={e => setForm({ ...form, despAdhesivo: e.target.value })}
                />
                <InputWithHelp
                  label="Desp. Boquilla"
                  unit="%"
                  type="number"
                  value={form.despBoquilla}
                  onChange={e => setForm({ ...form, despBoquilla: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo Redondeo</Label>
                <Select value={form.redondeo} onValueChange={v => setForm({ ...form, redondeo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entero">Entero superior (Cajas completas)</SelectItem>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center border">
                    <div className="text-xl font-bold text-primary">{formatNumber(results.longitudTotal, 1)} m</div>
                    <div className="text-xs text-muted-foreground">Longitud Total Perímetro</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center border">
                    <div className="text-xl font-bold text-primary">{results.tirasPorPieza} tiras</div>
                    <div className="text-xs text-muted-foreground">Cortes por Baldosa</div>
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
                        <td className="py-2 pr-4 font-medium">Cerámica (Cajas de material)</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.cajasCeramica, 1)}</td>
                        <td className="py-2 pr-4 text-right">cajas</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.costoCeramica, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Pegamento Adhesivo</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.adhesivoKg, 1)}</td>
                        <td className="py-2 pr-4 text-right">kg</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.costoAdhesivo, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Boquilla de Color</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.boquillaKg, 2)}</td>
                        <td className="py-2 pr-4 text-right">kg</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.costoBoquilla, 2)}</td>
                      </tr>
                      <tr className="border-b bg-muted/40 text-xs">
                        <td className="py-1.5 pr-4 text-muted-foreground">Piezas Cerámicas Necesarias</td>
                        <td className="py-1.5 pr-4 text-right font-mono text-muted-foreground">{results.piezasCeramica}</td>
                        <td className="py-1.5 pr-4 text-right text-muted-foreground">piezas</td>
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
