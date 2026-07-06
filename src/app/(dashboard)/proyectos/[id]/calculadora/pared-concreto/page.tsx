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
  Building2, 
  CheckCircle, 
  Loader2 
} from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { PlanGuard } from "@/components/shared/PlanGuard"

const dosificaciones = [
  { ratio: "1:2:2", resistencia: 280, cemento: 420, arena: 0.67, grava: 0.67, agua: 190 },
  { ratio: "1:2:2.5", resistencia: 240, cemento: 380, arena: 0.60, grava: 0.76, agua: 180 },
  { ratio: "1:2:3", resistencia: 226, cemento: 350, arena: 0.55, grava: 0.84, agua: 170 },
  { ratio: "1:2:3.5", resistencia: 210, cemento: 320, arena: 0.52, grava: 0.90, agua: 170 },
  { ratio: "1:2:4", resistencia: 200, cemento: 300, arena: 0.48, grava: 0.95, agua: 158 },
  { ratio: "1:3:3", resistencia: 168, cemento: 300, arena: 0.72, grava: 0.72, agua: 158 },
  { ratio: "1:3:4", resistencia: 159, cemento: 260, arena: 0.63, grava: 0.83, agua: 163 },
]

const PESO_BOLSA = 42.5
const PRECIO_CEMENTO = 8.60 // por bolsa
const PRECIO_ARENA = 28.33 // por m³
const PRECIO_GRAVA = 36.66 // por m³
const PRECIO_AGUA = 0.003 // por litro
const PRECIO_ACERO = 9.79 // por kg

export default function ParedConcretoCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    descripcion: "",
    alto: "2.50",
    largo: "10.00",
    espesor: "0.20",
    dosificacion: "1:2:3",
    proporcionAcero: "1.0",
    desperdicioConcreto: "5",
    desperdicioAcero: "10",
    cantidad: "1",
    redondeo: "entero",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [results, setResults] = useState<{
    volumenConcreto: number
    pesoAcero: number
    cemento: { kg: number; bolsas: number; precio: number }
    arena: { m3: number; precio: number }
    grava: { m3: number; precio: number }
    agua: { lt: number; precio: number }
    acero: { kg: number; precio: number }
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
    if (!form.espesor || parseFloat(form.espesor) <= 0) {
      errors.espesor = "Debe ser un número mayor a 0"
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
    const espesor = parseFloat(form.espesor)
    const cantidad = parseInt(form.cantidad)
    const proporcionAcero = parseFloat(form.proporcionAcero) || 0
    const despConcreto = 1 + (parseFloat(form.desperdicioConcreto) / 100)
    const despAcero = 1 + (parseFloat(form.desperdicioAcero) / 100)

    const vol = alto * largo * espesor * cantidad
    const volConDesp = vol * despConcreto

    const selectedDos = dosificaciones.find(d => d.ratio === form.dosificacion) || dosificaciones[2]

    // Densidad del acero = 7850 kg/m³
    const pesoAcero = vol * (proporcionAcero / 100) * 7850 * despAcero

    const cementoKg = volConDesp * selectedDos.cemento
    const cementoBolsas = form.redondeo === "entero" ? Math.ceil(cementoKg / PESO_BOLSA) : cementoKg / PESO_BOLSA

    const arenaM3 = volConDesp * selectedDos.arena
    const gravaM3 = volConDesp * selectedDos.grava
    const aguaLt = volConDesp * selectedDos.agua

    const costCemento = cementoBolsas * PRECIO_CEMENTO
    const costArena = arenaM3 * PRECIO_ARENA
    const costGrava = gravaM3 * PRECIO_GRAVA
    const costAgua = aguaLt * PRECIO_AGUA
    const costAcero = pesoAcero * PRECIO_ACERO

    const total = costCemento + costArena + costGrava + costAgua + costAcero

    setResults({
      volumenConcreto: volConDesp,
      pesoAcero,
      cemento: { kg: cementoKg, bolsas: cementoBolsas, precio: costCemento },
      arena: { m3: arenaM3, precio: costArena },
      grava: { m3: gravaM3, precio: costGrava },
      agua: { lt: aguaLt, precio: costAgua },
      acero: { kg: pesoAcero, precio: costAcero },
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
          tipoElemento: "PARED_CONCRETO",
          descripcion: form.descripcion || `Pared de Concreto - ${form.alto}x${form.largo}x${form.espesor}m`,
          cantidad: parseInt(form.cantidad),
          dimA: parseFloat(form.alto),
          dimB: parseFloat(form.largo),
          dimH: parseFloat(form.espesor),
          desperdicio: parseFloat(form.desperdicioConcreto),
          resistencia: 210, // valor representativo
          materiales: JSON.stringify({
            cemento: { kg: results.cemento.kg, bolsas: results.cemento.bolsas, precio: results.cemento.precio },
            arena: { m3: results.arena.m3, precio: results.arena.precio },
            grava: { m3: results.grava.m3, precio: results.grava.precio },
            agua: { lt: results.agua.lt, precio: results.agua.precio },
            acero: { kg: results.acero.kg, precio: results.acero.precio },
          }),
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
                <Building2 className="h-7 w-7 text-primary" />
                Paredes de Concreto
              </h1>
              <p className="text-muted-foreground">Estructuras vaciadas de hormigón armado y simple</p>
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
              <div className="space-y-2">
                <Label>Descripción del Elemento</Label>
                <InputWithHelp
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Ej. Pared de Contención Sótano"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Alto (m)</Label>
                  <InputWithHelp
                    type="number"
                    value={form.alto}
                    onChange={e => setForm({ ...form, alto: e.target.value })}
                    error={formErrors.alto}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Largo (m)</Label>
                  <InputWithHelp
                    type="number"
                    value={form.largo}
                    onChange={e => setForm({ ...form, largo: e.target.value })}
                    error={formErrors.largo}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Espesor (m)</Label>
                  <InputWithHelp
                    type="number"
                    value={form.espesor}
                    onChange={e => setForm({ ...form, espesor: e.target.value })}
                    error={formErrors.espesor}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dosificación Concreto</Label>
                  <Select value={form.dosificacion} onValueChange={v => setForm({ ...form, dosificacion: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {dosificaciones.map(d => (
                        <SelectItem key={d.ratio} value={d.ratio}>
                          {d.ratio} ({d.resistencia} kg/cm²)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Acero de Refuerzo (%)</Label>
                  <InputWithHelp
                    type="number"
                    step="0.1"
                    value={form.proporcionAcero}
                    onChange={e => setForm({ ...form, proporcionAcero: e.target.value })}
                    helpText="Porcentaje de volumen de acero en el concreto (1% es común)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Desperdicio Concreto (%)</Label>
                  <InputWithHelp
                    type="number"
                    value={form.desperdicioConcreto}
                    onChange={e => setForm({ ...form, desperdicioConcreto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desperdicio Acero (%)</Label>
                  <InputWithHelp
                    type="number"
                    value={form.desperdicioAcero}
                    onChange={e => setForm({ ...form, desperdicioAcero: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad de Elementos</Label>
                  <InputWithHelp
                    type="number"
                    value={form.cantidad}
                    onChange={e => setForm({ ...form, cantidad: e.target.value })}
                    error={formErrors.cantidad}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redondeo de Bolsas</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center border">
                    <div className="text-xl font-bold text-primary">{formatNumber(results.volumenConcreto, 2)} m³</div>
                    <div className="text-xs text-muted-foreground">Volumen Concreto</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg text-center border">
                    <div className="text-xl font-bold text-primary">{formatNumber(results.pesoAcero, 1)} Kg</div>
                    <div className="text-xs text-muted-foreground">Armadura Acero</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Material</th>
                        <th className="pb-2 pr-4 text-right">Cant.</th>
                        <th className="pb-2 pr-4 text-right">Unidad</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Cemento CP-40</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.cemento.bolsas, 1)}</td>
                        <td className="py-2 pr-4 text-right">bolsas</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.cemento.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Arena corriente</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.arena.m3, 2)}</td>
                        <td className="py-2 pr-4 text-right">m³</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.arena.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Grava clasificada</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.grava.m3, 2)}</td>
                        <td className="py-2 pr-4 text-right">m³</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.grava.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Agua de obra</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.agua.lt, 1)}</td>
                        <td className="py-2 pr-4 text-right">lt</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.agua.precio, 2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">Acero de refuerzo</td>
                        <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.acero.kg, 1)}</td>
                        <td className="py-2 pr-4 text-right">Kg</td>
                        <td className="py-2 text-right font-medium">Bs. {formatNumber(results.acero.precio, 2)}</td>
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
