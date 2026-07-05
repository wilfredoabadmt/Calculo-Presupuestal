"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputWithHelp } from "@/components/ui/input-with-help"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator, Save, Box, Weight, CheckCircle, Loader2 } from "lucide-react"
import { formatNumber, cn } from "@/lib/utils"
import { PlanGuard } from "@/components/shared/PlanGuard"

const dosificaciones = [
  { ratio: "1:2:2", cemento: 420, arena: 0.67, grava: 0.67 },
  { ratio: "1:2:3", cemento: 350, arena: 0.55, grava: 0.84 },
  { ratio: "1:2:4", cemento: 300, arena: 0.48, grava: 0.95 },
  { ratio: "1:3:4", cemento: 260, arena: 0.63, grava: 0.83 },
  { ratio: "1:3:5", cemento: 230, arena: 0.55, grava: 0.92 },
  { ratio: "1:3:6", cemento: 210, arena: 0.50, grava: 1.00 },
]

const diametros = [
  { value: "1/4", kgM: 0.395 },
  { value: "3/8", kgM: 0.888 },
  { value: "1/2", kgM: 1.580 },
  { value: "5/8", kgM: 2.466 },
  { value: "3/4", kgM: 3.556 },
]

const PESO_BOLSA = 42.5


export default function VigaCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [form, setForm] = useState({
    largo: "",
    dimA: "",
    dimB: "",
    dosificacion: "1:3:4",
    cantidad: "",
    desperdicioConcreto: "5",
    // Acero positivo
    diametroPos: "1/2",
    varillasPos: "",
    longVarillasPos: "",
    // Acero negativo
    diametroNeg: "1/2",
    varillasNeg: "",
    longVarillasNeg: "",
    // Estribos
    diametroEstribo: "3/8",
    separacionConfinada: "10",
    separacionCentral: "20",
    despAcero: "5",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateAllFields = (shouldSetState = false) => {
    const errors: Record<string, string> = {}

    if (!form.largo || parseFloat(form.largo) <= 0) {
      errors.largo = "Debe ser un número mayor a 0"
    }
    if (!form.dimA || parseFloat(form.dimA) <= 0) {
      errors.dimA = "Debe ser un número mayor a 0"
    }
    if (!form.dimB || parseFloat(form.dimB) <= 0) {
      errors.dimB = "Debe ser un número mayor a 0"
    }
    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      errors.cantidad = "Debe ser mayor a 0"
    }
    if (!form.varillasPos || parseInt(form.varillasPos) <= 0) {
      errors.varillasPos = "Debe ser mayor a 0"
    }
    if (!form.longVarillasPos || parseFloat(form.longVarillasPos) <= 0) {
      errors.longVarillasPos = "Debe ser un número mayor a 0"
    }
    if (!form.varillasNeg || parseInt(form.varillasNeg) <= 0) {
      errors.varillasNeg = "Debe ser mayor a 0"
    }
    if (!form.longVarillasNeg || parseFloat(form.longVarillasNeg) <= 0) {
      errors.longVarillasNeg = "Debe ser un número mayor a 0"
    }

    if (shouldSetState) {
      setFormErrors(errors)
    }
    return Object.keys(errors).length === 0
  }

  const getFieldError = (field: string) => formErrors[field]

  const getFieldSuccess = (field: string) => {
    const value = form[field as keyof typeof form]
    if (!value) return false
    if (field === "largo" || field === "dimA" || field === "dimB" || field === "longVarillasPos" || field === "longVarillasNeg") {
      return parseFloat(value) > 0
    }
    if (field === "cantidad" || field === "varillasPos" || field === "varillasNeg") {
      return parseInt(value) > 0
    }
    return true
  }

  const [results, setResults] = useState<{
    concreto: { volumen: number; cemento: { kg: number; bolsas: number }; arena: number; grava: number }
    aceroPos: number
    aceroNeg: number
    estribos: { cantidad: number; peso: number }
    totalAcero: number
    materiales: { nombre: string; cantidad: number; unidad: string; precio: number }[]
    total: number
  } | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedDos = dosificaciones.find(d => d.ratio === form.dosificacion) || dosificaciones[3]
  const dPos = diametros.find(d => d.value === form.diametroPos) || diametros[3]
  const dNeg = diametros.find(d => d.value === form.diametroNeg) || diametros[3]
  const dEst = diametros.find(d => d.value === form.diametroEstribo) || diametros[1]

  const calculate = () => {
    if (!validateAllFields(true)) {
      return
    }

    const largo = parseFloat(form.largo)
    const a = parseFloat(form.dimA)
    const b = parseFloat(form.dimB)
    const cantidad = parseInt(form.cantidad)
    const desp = parseFloat(form.desperdicioConcreto) / 100

    if (!largo || !a || !b || !cantidad) return

    const volumen = largo * a * b * cantidad
    const volDesp = volumen * (1 + desp)
    const cementoKg = volDesp * selectedDos.cemento
    const cementoBolsas = Math.ceil(cementoKg / PESO_BOLSA)
    const arena = volDesp * selectedDos.arena
    const grava = volDesp * selectedDos.grava

    const numPos = parseInt(form.varillasPos)
    const numNeg = parseInt(form.varillasNeg)
    const longPos = parseFloat(form.longVarillasPos)
    const longNeg = parseFloat(form.longVarillasNeg)

    const pesoPos = numPos * longPos * dPos.kgM * cantidad
    const pesoNeg = numNeg * longNeg * dNeg.kgM * cantidad

    const perimetro = 2 * (a + b) - 8 * 0.04 + 2 * 0.12
    const estConf = Math.ceil((largo * 0.30) / (parseFloat(form.separacionConfinada) / 100))
    const estCen = Math.ceil((largo * 0.7) / (parseFloat(form.separacionCentral) / 100))
    const totalEst = (estConf + estCen + 4) * cantidad
    const pesoEst = totalEst * perimetro * dEst.kgM

    const despAcero = parseFloat(form.despAcero) / 100
    const totalAcero = (pesoPos + pesoNeg + pesoEst) * (1 + despAcero)

    const precioCem = cementoBolsas * 8.60
    const precioAre = arena * 28.33
    const precioGrv = grava * 36.66
    const precioAce = totalAcero * 10.50

    setResults({
      concreto: { volumen, cemento: { kg: cementoKg, bolsas: cementoBolsas }, arena, grava },
      aceroPos: pesoPos,
      aceroNeg: pesoNeg,
      estribos: { cantidad: totalEst, peso: pesoEst },
      totalAcero,
      materiales: [
        { nombre: "Cemento CP-40", cantidad: cementoBolsas, unidad: "bolsa", precio: precioCem },
        { nombre: "Arena media", cantidad: arena, unidad: "m³", precio: precioAre },
        { nombre: "Grava 3/4\"", cantidad: grava, unidad: "m³", precio: precioGrv },
        { nombre: `Acero (+) Ø${form.diametroPos}`, cantidad: pesoPos, unidad: "kg", precio: pesoPos * 10.50 },
        { nombre: `Acero (-) Ø${form.diametroNeg}`, cantidad: pesoNeg, unidad: "kg", precio: pesoNeg * 10.50 },
        { nombre: `Estribos Ø${form.diametroEstribo}`, cantidad: pesoEst, unidad: "kg", precio: pesoEst * 10.50 },
      ],
      total: precioCem + precioAre + precioGrv + precioAce,
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
          tipoElemento: "VIGA",
          descripcion: `Viga ${form.dimA}x${form.dimB}x${form.largo}m`,
          cantidad: parseInt(form.cantidad),
          dimA: parseFloat(form.dimA),
          dimB: parseFloat(form.dimB),
          dimLargo: parseFloat(form.largo),
          dosificacionConcretoId: null,
          resistencia: 0,
          desperdicio: parseFloat(form.desperdicioConcreto),
          aceroLongitudinal: { peso: results.totalAcero },
          estribos: { cantidad: results.estribos?.cantidad, peso: results.estribos?.peso },
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
              <Box className="h-7 w-7 text-primary" />
              Calculadora de Viga
            </h1>
            <p className="text-muted-foreground">Concreto + Acero (+) + Acero (-) + Estribos</p>
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

      <Card>
        <CardHeader><CardTitle>Parámetros de Entrada</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Viga Rectangular</div>
            <svg className="mx-auto max-w-[300px]" viewBox="0 0 300 120">
              <rect x="20" y="30" width="260" height="60" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <text x="150" y="20" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Largo</text>
              <text x="10" y="65" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6" transform="rotate(-90 10 65)">a</text>
              <text x="150" y="105" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">b</text>
            </svg>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InputWithHelp
              label="Largo (m)"
              helpText="Longitud longitudinal de la viga"
              example="4.00 para viga de 4 metros"
              unit="m"
              value={form.largo}
              onChange={(e) => setForm({...form, largo: e.target.value})}
              placeholder="4.00"
              error={getFieldError("largo")}
              success={getFieldSuccess("largo")}
              min="0.01"
              step="0.01"
            />
            <InputWithHelp
              label="Alto a (m)"
              helpText="Dimensión vertical de la viga"
              example="0.40 para viga de 40cm"
              unit="m"
              value={form.dimA}
              onChange={(e) => setForm({...form, dimA: e.target.value})}
              placeholder="0.40"
              error={getFieldError("dimA")}
              success={getFieldSuccess("dimA")}
              min="0.01"
              step="0.01"
            />
            <InputWithHelp
              label="Ancho b (m)"
              helpText="Dimensión horizontal de la viga"
              example="0.25 para viga de 25cm"
              unit="m"
              value={form.dimB}
              onChange={(e) => setForm({...form, dimB: e.target.value})}
              placeholder="0.25"
              error={getFieldError("dimB")}
              success={getFieldSuccess("dimB")}
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Dosificación</Label>
              <Select value={form.dosificacion} onValueChange={v => setForm({...form, dosificacion: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{dosificaciones.map(d => <SelectItem key={d.ratio} value={d.ratio}>{d.ratio}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Selecione la dosificación de concreto para resistencia y proporciones</p>
            </div>
            <InputWithHelp
              label="Desp. Concreto (%)"
              helpText="Material extra para pérdidas, roturas"
              example="5% es estándar en obras"
              unit="%"
              value={form.desperdicioConcreto}
              onChange={(e) => setForm({...form, desperdicioConcreto: e.target.value})}
              placeholder="5"
              min="0"
              max="100"
              success={parseFloat(form.desperdicioConcreto) >= 0 && parseFloat(form.desperdicioConcreto) <= 100}
            />
            <InputWithHelp
              label="Cantidad"
              helpText="Número de vigas idénticas a calcular"
              example="1 para una sola viga, 3 para tres vigas"
              unit="unidades"
              value={form.cantidad}
              onChange={(e) => setForm({...form, cantidad: e.target.value})}
              placeholder="1"
              error={getFieldError("cantidad")}
              success={getFieldSuccess("cantidad")}
              min="1"
            />
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Weight className="h-4 w-4" /> Acero Positivo (+)</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Ø Varillas</Label>
                <Select value={form.diametroPos} onValueChange={v => setForm({...form, diametroPos: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{diametros.map(d => <SelectItem key={d.value} value={d.value}>Ø{d.value}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Diámetro de las varillas de refuerzo positivo (superior)</p>
              </div>
              <InputWithHelp
                label="Varillas"
                helpText="Número de varillas de acero longitudinal positivo"
                example="3 para tres varillas"
                unit="uds"
                value={form.varillasPos}
                onChange={(e) => setForm({...form, varillasPos: e.target.value})}
                placeholder="3"
                error={getFieldError("varillasPos")}
                success={getFieldSuccess("varillasPos")}
                min="1"
              />
              <InputWithHelp
                label="Long. (m)"
                helpText="Longitud de cada varilla de acero"
                example="4.50 para varillas de 4.5 metros"
                unit="m"
                value={form.longVarillasPos}
                onChange={(e) => setForm({...form, longVarillasPos: e.target.value})}
                placeholder="4.50"
                error={getFieldError("longVarillasPos")}
                success={getFieldSuccess("longVarillasPos")}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Weight className="h-4 w-4" /> Acero Negativo (-)</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Ø Varillas</Label>
                <Select value={form.diametroNeg} onValueChange={v => setForm({...form, diametroNeg: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{diametros.map(d => <SelectItem key={d.value} value={d.value}>Ø{d.value}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Diámetro de las varillas de refuerzo negativo (inferior)</p>
              </div>
              <InputWithHelp
                label="Varillas"
                helpText="Número de varillas de acero longitudinal negativo"
                example="2 para dos varillas"
                unit="uds"
                value={form.varillasNeg}
                onChange={(e) => setForm({...form, varillasNeg: e.target.value})}
                placeholder="2"
                error={getFieldError("varillasNeg")}
                success={getFieldSuccess("varillasNeg")}
                min="1"
              />
              <InputWithHelp
                label="Long. (m)"
                helpText="Longitud de cada varilla de acero negativo"
                example="4.50 para varillas de 4.5 metros"
                unit="m"
                value={form.longVarillasNeg}
                onChange={(e) => setForm({...form, longVarillasNeg: e.target.value})}
                placeholder="4.50"
                error={getFieldError("longVarillasNeg")}
                success={getFieldSuccess("longVarillasNeg")}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Estribos</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Ø Estribo</Label>
                <Select value={form.diametroEstribo} onValueChange={v => setForm({...form, diametroEstribo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{diametros.filter(d => ["3/8","1/2"].includes(d.value)).map(d => <SelectItem key={d.value} value={d.value}>Ø{d.value}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Diámetro de los estribos de confinamiento</p>
              </div>
              <InputWithHelp
                label="Separación Confinada (cm)"
                helpText="Distancia entre estribos en zona confinada (inicio a 0.15m)"
                example="10cm para separación típica"
                unit="cm"
                value={form.separacionConfinada}
                onChange={(e) => setForm({...form, separacionConfinada: e.target.value})}
                min="1"
                success={parseFloat(form.separacionConfinada) > 0}
              />
              <InputWithHelp
                label="Separación Central (cm)"
                helpText="Distancia entre estribos en zona central (0.15m a 0.7m)"
                example="20cm para zona central"
                unit="cm"
                value={form.separacionCentral}
                onChange={(e) => setForm({...form, separacionCentral: e.target.value})}
                min="1"
                success={parseFloat(form.separacionCentral) > 0}
              />
            </div>
            <InputWithHelp
              label="Desp. Acero (%)"
              helpText="Extra por pérdidas, recubrimiento, errores"
              example="5% es estándar en estructuras"
              unit="%"
              value={form.despAcero}
              onChange={(e) => setForm({...form, despAcero: e.target.value})}
              placeholder="5"
              min="0"
              max="100"
              success={parseFloat(form.despAcero) >= 0 && parseFloat(form.despAcero) <= 100}
            />
          </div>

          <Button onClick={calculate} className="w-full" size="lg" disabled={!validateAllFields()}><Calculator className="mr-2 h-4 w-4" /> Calcular Materiales</Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-primary">Resultados</CardTitle></CardHeader>
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
                <div className="text-sm text-blue-700">Acero Total (kg)</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-800">{results.estribos.cantidad}</div>
                <div className="text-sm text-amber-700">Estribos</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Material</th><th className="pb-2 pr-4 text-right">Cantidad</th><th className="pb-2 pr-4 text-right">Unidad</th><th className="pb-2 text-right">Costo</th>
                </tr></thead>
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
              <div className="p-3 bg-muted/50 rounded-lg"><div className="font-medium">Acero (+)</div><div>{formatNumber(results.aceroPos, 2)} kg</div></div>
              <div className="p-3 bg-muted/50 rounded-lg"><div className="font-medium">Acero (-)</div><div>{formatNumber(results.aceroNeg, 2)} kg</div></div>
              <div className="p-3 bg-muted/50 rounded-lg"><div className="font-medium">Estribos</div><div>{results.estribos.cantidad} pzas ({formatNumber(results.estribos.peso, 2)} kg)</div></div>
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
