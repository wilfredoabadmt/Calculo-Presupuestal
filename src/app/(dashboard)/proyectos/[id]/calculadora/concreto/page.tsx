"use client"

import { useState, useEffect } from "react"
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
  Box,
  Package,
  Droplets,
  Weight,
  CheckCircle,
  Loader2
} from "lucide-react"
import { formatNumber, cn } from "@/lib/utils"

const dosificaciones = [
  { ratio: "1:2:2", resistencia: 280, cemento: 420, arena: 0.67, grava: 0.67, agua: 190 },
  { ratio: "1:2:2.5", resistencia: 240, cemento: 380, arena: 0.60, grava: 0.76, agua: 180 },
  { ratio: "1:2:3", resistencia: 226, cemento: 350, arena: 0.55, grava: 0.84, agua: 170 },
  { ratio: "1:2:3.5", resistencia: 210, cemento: 320, arena: 0.52, grava: 0.90, agua: 170 },
  { ratio: "1:2:4", resistencia: 200, cemento: 300, arena: 0.48, grava: 0.95, agua: 158 },
  { ratio: "1:2.5:4", resistencia: 189, cemento: 280, arena: 0.55, grava: 0.89, agua: 158 },
  { ratio: "1:3:3", resistencia: 168, cemento: 300, arena: 0.72, grava: 0.72, agua: 158 },
  { ratio: "1:3:4", resistencia: 159, cemento: 260, arena: 0.63, grava: 0.83, agua: 163 },
  { ratio: "1:3:5", resistencia: 140, cemento: 230, arena: 0.55, grava: 0.92, agua: 148 },
  { ratio: "1:3:6", resistencia: 119, cemento: 210, arena: 0.50, grava: 1.00, agua: 143 },
  { ratio: "1:4:7", resistencia: 109, cemento: 175, arena: 0.55, grava: 0.98, agua: 133 },
  { ratio: "1:4:8", resistencia: 99, cemento: 160, arena: 0.55, grava: 1.03, agua: 125 },
]

const PESO_BOLSA = 42.5
const LT_POR_BARRIL = 158.98
const LT_POR_GALON = 3.785

export default function ConcretoCalculatorPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [form, setForm] = useState({
    descripcion: "",
    dimA: "",
    dimB: "",
    dimH: "",
    dosificacion: "1:3:4",
    cantidad: "",
    desperdicio: "5",
    redondeo: "entero",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!form.dimA || parseFloat(form.dimA) <= 0) {
      errors.dimA = "Debe ser un número mayor a 0"
    }
    if (!form.dimB || parseFloat(form.dimB) <= 0) {
      errors.dimB = "Debe ser un número mayor a 0"
    }
    if (!form.dimH || parseFloat(form.dimH) <= 0) {
      errors.dimH = "Debe ser un número mayor a 0"
    }
    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      errors.cantidad = "Debe ser mayor a 0"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAllFields = () => {
    const errors: Record<string, string> = {}

    if (!form.dimA || parseFloat(form.dimA) <= 0) {
      errors.dimA = "Debe ser un número mayor a 0"
    }
    if (!form.dimB || parseFloat(form.dimB) <= 0) {
      errors.dimB = "Debe ser un número mayor a 0"
    }
    if (!form.dimH || parseFloat(form.dimH) <= 0) {
      errors.dimH = "Debe ser un número mayor a 0"
    }
    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      errors.cantidad = "Debe ser mayor a 0"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const getFieldError = (field: string) => formErrors[field]

  const getFieldSuccess = (field: string) => {
    const value = form[field as keyof typeof form]
    if (!value) return false
    if (field === "dimA" || field === "dimB" || field === "dimH") {
      return parseFloat(value) > 0
    }
    if (field === "cantidad") {
      return parseInt(value) > 0
    }
    return true
  }

  const [results, setResults] = useState<{
    volumen: number
    cemento: { kg: number; bolsas: number; precio: number }
    arena: { m3: number; precio: number }
    grava: { m3: number; precio: number }
    agua: { lt: number; barriles: number; galones: number; precio: number }
    total: number
  } | null>(null)

  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedDosificacion = dosificaciones.find(d => d.ratio === form.dosificacion) || { ratio: "1:3:4", resistencia: 159, cemento: 260, arena: 0.63, grava: 0.83, agua: 163 }

  const calculate = () => {
    if (!validateAllFields()) {
      return
    }
    
    setIsCalculating(true)
    
    const a = parseFloat(form.dimA)
    const b = parseFloat(form.dimB)
    const h = parseFloat(form.dimH)
    const cantidad = parseInt(form.cantidad)
    const desperdicio = parseFloat(form.desperdicio) / 100

    const volA = a * b * h
    const volDesp = volA * cantidad
    const factorDesperdicio = 1 + desperdicio

    const volumen = a * b * h
    const volumenTotal = volA * cantidad

    const cementoKg = volumenTotal * selectedDosificacion.cemento * factorDesperdicio
    const cementoBolsas = Math.ceil(cementoKg / PESO_BOLSA)
    
    const arenaM3 = volumenTotal * selectedDosificacion.arena * factorDesperdicio
    const gravaM3 = volumenTotal * selectedDosificacion.grava * factorDesperdicio
    const aguaLt = volumenTotal * selectedDosificacion.agua * factorDesperdicio

    // Precios de referencia
    const precioCemento = 8.60
    const precioArena = 28.33
    const precioGrava = 36.66
    const precioAgua = 0.003

    const cementoPrecio = (form.redondeo === "entero" ? cementoBolsas : cementoKg / PESO_BOLSA) * precioCemento
    const arenaPrecio = arenaM3 * precioArena
    const gravaPrecio = gravaM3 * precioGrava
    const aguaPrecio = aguaLt * precioAgua

    const total = cementoPrecio + arenaPrecio + gravaPrecio + aguaPrecio

    setResults({
      volumen: volumenTotal,
      cemento: { kg: cementoKg, bolsas: cementoBolsas, precio: cementoPrecio },
      arena: { m3: arenaM3, precio: arenaPrecio },
      grava: { m3: gravaM3, precio: gravaPrecio },
      agua: { 
        lt: aguaLt, 
        barriles: aguaLt / LT_POR_BARRIL, 
        galones: aguaLt / LT_POR_GALON, 
        precio: aguaPrecio 
      },
      total,
    })

    setIsCalculating(false)
  }

  const handleSave = async () => {
    if (!results) return
    setIsSaving(true)
    try {
      const dosRes = await fetch(`/api/dosificaciones?tipo=concreto&ratio=${encodeURIComponent(form.dosificacion)}`)
      const dosData = await dosRes.json()
      const dosificacionId = dosData?.id || null

      const res = await fetch(`/api/proyectos/${projectId}/elementos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoElemento: "CONCRETO",
          descripcion: form.descripcion || `Concreto ${form.dosificacion} - ${form.dimA}x${form.dimB}x${form.dimH}m`,
          cantidad: parseInt(form.cantidad),
          dimA: parseFloat(form.dimA),
          dimB: parseFloat(form.dimB),
          dimH: parseFloat(form.dimH),
          dosificacionConcretoId: dosificacionId,
          resistencia: selectedDosificacion.resistencia,
          desperdicio: parseFloat(form.desperdicio),
          materiales: JSON.stringify({
            cemento: { kg: results.cemento.kg, bolsas: results.cemento.bolsas, precio: results.cemento.precio },
            arena: { m3: results.arena.m3, precio: results.arena.precio },
            grava: { m3: results.grava.m3, precio: results.grava.precio },
            agua: { lt: results.agua.lt, precio: results.agua.precio },
          }),
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
          <Link href={`/proyectos/${projectId}/calculadora`} className="p-2 hover:bg-accent rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Box className="h-7 w-7 text-primary" />
              Calculadora de Concreto
            </h1>
            <p className="text-muted-foreground">Columnas, vigas, losas, cimientos - Cálculo de materiales</p>
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
        {/* Formulario */}
<Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Parámetros de Entrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Esquema visual */}
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Esquema Guía: Elemento de Concreto</div>
            <svg className="mx-auto max-w-xs" viewBox="0 0 300 200" style={{ strokeWidth: 1.5 }}>
              <rect x="50" y="50" width="200" height="100" fill="none" stroke="currentColor" strokeDasharray="5,5" opacity="0.3"/>
              <text x="150" y="40" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.6">Alto (h)</text>
              <text x="30" y="105" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.6" transform="rotate(-90 30 105)">Largo (a)</text>
              <text x="150" y="170" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.6">Ancho (b)</text>
              <line x1="150" y1="50" x2="150" y2="40" stroke="currentColor" opacity="0.6" strokeWidth="0.5"/>
              <line x1="150" y1="150" x2="150" y2="160" stroke="currentColor" opacity="0.6" strokeWidth="0.5"/>
              <line x1="50" y1="100" x2="40" y2="100" stroke="currentColor" opacity="0.6" strokeWidth="0.5"/>
              <line x1="250" y1="100" x2="260" y2="100" stroke="currentColor" opacity="0.6" strokeWidth="0.5"/>
            </svg>
          </div>

          {/* Descripción */}
          <InputWithHelp
            label="Descripción del Elemento (opcional)"
            helpText="Da un nombre identificable al elemento de concreto para referencia rápida"
            example="Ej: Columna C1 - Nivel 1, Viga V2 - Tramo Norte"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Ej: Columna C1 - Nivel 1"
          />

          {/* Dimensiones */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">Dimensiones del Elemento (en metros)</div>
            <div className="grid gap-4 md:grid-cols-3">
              <InputWithHelp
                label="Alto (a)"
                helpText="Dimensión vertical del elemento"
                example="0.30 para columna de 30cm"
                unit="m"
                value={form.dimA}
                onChange={(e) => setForm({ ...form, dimA: e.target.value })}
                min="0.01"
                step="0.01"
                success={!!form.dimA && parseFloat(form.dimA) > 0}
              />
              <InputWithHelp
                label="Ancho (b)"
                helpText="Dimensión lateral del elemento"
                example="0.40 para columna de 40cm"
                unit="m"
                value={form.dimB}
                onChange={(e) => setForm({ ...form, dimB: e.target.value })}
                min="0.01"
                step="0.01"
                success={!!form.dimB && parseFloat(form.dimB) > 0}
              />
              <InputWithHelp
                label="Largo (h)"
                helpText="Dimensión longitudinal del elemento"
                example="3.00 para columna de 3m"
                unit="m"
                value={form.dimH}
                onChange={(e) => setForm({ ...form, dimH: e.target.value })}
                min="0.01"
                step="0.01"
                success={!!form.dimH && parseFloat(form.dimH) > 0}
              />
            </div>
          </div>

          {/* Dosificación */}
          <div className="space-y-2">
            <Label htmlFor="dosificacion">Dosificación de Concreto</Label>
            <Select value={form.dosificacion} onValueChange={(v) => setForm({ ...form, dosificacion: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar dosificación" />
              </SelectTrigger>
              <SelectContent>
                {dosificaciones.map((d) => (
                  <SelectItem key={d.ratio} value={d.ratio}>
                    {d.ratio} - {d.resistencia} kg/cm²
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Dosificación seleccionada: <span className="font-medium text-foreground">{selectedDosificacion.ratio}</span> - 
              {selectedDosificacion.resistencia} kg/cm² | 
              Cemento: {selectedDosificacion.cemento} kg/m³ | 
              Arena: {selectedDosificacion.arena} m³/m³ | 
              Grava: {selectedDosificacion.grava} m³/m³ | 
              Agua: {selectedDosificacion.agua} lt/m³
            </p>
          </div>

          {/* Cantidad y desperdicio en una fila */}
          <div className="grid gap-4 md:grid-cols-3">
            <InputWithHelp
              label="Cantidad de Elementos"
              helpText="Número de elementos idénticos a calcular"
              example="1 para un solo elemento, 3 para tres columnas"
              unit="unidades"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              min="1"
              success={!!form.cantidad && parseInt(form.cantidad) > 0}
            />
            <InputWithHelp
              label="Desperdicio (%)"
              helpText="Material extra para pérdidas, roturas, errores de corte"
              example="5% es estándar en obras"
              unit="%"
              value={form.desperdicio}
              onChange={(e) => setForm({ ...form, desperdicio: e.target.value })}
              min="0"
              max="100"
              success={parseFloat(form.desperdicio) >= 0 && parseFloat(form.desperdicio) <= 100}
            />
            <div className="space-y-2">
              <Label htmlFor="redondeo">Redondeo de Cemento</Label>
              <Select value={form.redondeo} onValueChange={(v) => setForm({ ...form, redondeo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entero">Bolsas enteras (redondear hacia arriba)</SelectItem>
                  <SelectItem value="exacto">Exacto (decimal - calcula peso preciso)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {form.redondeo === "entero" ? "Siempre redondea hacia arriba" : "Permite cálculos decimales precisos"}
              </p>
            </div>
          </div>

          <Button onClick={calculate} className="w-full" disabled={isCalculating} size="lg">
            {isCalculating ? "Calculando..." : "Calcular Materiales"}
          </Button>
        </CardContent>
      </Card>

        {/* Tabla de referencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Tabla de Dosificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Ratio</th>
                    <th className="pb-2 pr-4">Resist.</th>
                    <th className="pb-2 pr-4">Cemento</th>
                    <th className="pb-2 pr-4">Arena</th>
                    <th className="pb-2 pr-4">Grava</th>
                    <th className="pb-2">Agua</th>
                  </tr>
                </thead>
                <tbody>
                  {dosificaciones.map((d) => (
                    <tr key={d.ratio} className={cn("border-b hover:bg-accent/50", form.dosificacion === d.ratio && "bg-primary/10 font-medium")}>
                      <td className="py-2 pr-4 font-mono">{d.ratio}</td>
                      <td className="py-2 pr-4">{d.resistencia}</td>
                      <td className="py-2 pr-4">{d.cemento} kg</td>
                      <td className="py-2 pr-4">{d.arena} m³</td>
                      <td className="py-2 pr-4">{d.grava} m³</td>
                      <td className="py-2">{d.agua} lt</td>
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
            <CardTitle className="flex items-center gap-2 text-primary">Resultados del Cálculo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(results.volumen, 3)}</div>
                <div className="text-sm text-muted-foreground">Volumen Total (m³)</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{results.cemento.bolsas}</div>
                <div className="text-sm text-green-700">Bolsas Cemento</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{formatNumber(results.arena.m3, 3)}</div>
                <div className="text-sm text-blue-700">Arena (m³)</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-800">{formatNumber(results.grava.m3, 3)}</div>
                <div className="text-sm text-amber-700">Grava (m³)</div>
              </div>
              <div className="bg-cyan-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-cyan-800">{formatNumber(results.agua.lt, 1)}</div>
                <div className="text-sm text-cyan-700">Agua (litros)</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 w-40">Material</th>
                    <th className="pb-2 pr-4 text-right">Cantidad</th>
                    <th className="pb-2 pr-4 text-right">Unidad</th>
                    <th className="pb-2 pr-4 text-right">Precio Unit.</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 flex items-center gap-2"><Package className="h-4 w-4" /> Cemento</td>
                    <td className="py-2 pr-4 text-right font-mono">{form.redondeo === "entero" ? results.cemento.bolsas : formatNumber(results.cemento.kg / PESO_BOLSA, 2)}</td>
                    <td className="py-2 pr-4 text-right">bolsa</td>
                    <td className="py-2 pr-4 text-right">Bs. 8.60</td>
                    <td className="py-2 text-right font-medium">Bs. {formatNumber(results.cemento.precio, 2)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 flex items-center gap-2"><Box className="h-4 w-4" /> Arena</td>
                    <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.arena.m3, 3)}</td>
                    <td className="py-2 pr-4 text-right">m³</td>
                    <td className="py-2 pr-4 text-right">Bs. 28.33</td>
                    <td className="py-2 text-right font-medium">Bs. {formatNumber(results.arena.precio, 2)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 flex items-center gap-2"><Weight className="h-4 w-4" /> Grava</td>
                    <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.grava.m3, 3)}</td>
                    <td className="py-2 pr-4 text-right">m³</td>
                    <td className="py-2 pr-4 text-right">Bs. 36.66</td>
                    <td className="py-2 text-right font-medium">Bs. {formatNumber(results.grava.precio, 2)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 flex items-center gap-2"><Droplets className="h-4 w-4" /> Agua</td>
                    <td className="py-2 pr-4 text-right font-mono">{formatNumber(results.agua.lt, 1)}</td>
                    <td className="py-2 pr-4 text-right">lt</td>
                    <td className="py-2 pr-4 text-right">Bs. 0.003</td>
                    <td className="py-2 text-right font-medium">Bs. {formatNumber(results.agua.precio, 2)}</td>
                  </tr>
                  <tr className="bg-primary/5 font-bold">
                    <td className="py-3 pr-4" colSpan={4}>TOTAL CONCRETO</td>
                    <td className="py-3 text-right text-lg">Bs. {formatNumber(results.total, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Conversiones de Agua</div>
                <div>{formatNumber(results.agua.lt, 1)} litros</div>
                <div>{formatNumber(results.agua.barriles, 2)} barriles</div>
                <div>{formatNumber(results.agua.galones, 1)} galones</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Cemento en kg</div>
                <div>{formatNumber(results.cemento.kg, 1)} kg total</div>
                <div>{formatNumber(results.cemento.kg / PESO_BOLSA, 2)} bolsas exactas</div>
                <div>{results.cemento.bolsas} bolsas (redondeo)</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">Dosificación Usada</div>
                <div>{selectedDosificacion.ratio} - {selectedDosificacion.resistencia} kg/cm²</div>
                <div>Desperdicio: {form.desperdicio}%</div>
                <div>Elementos: {form.cantidad}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!results && (
        <Card className="text-center py-12 border-dashed">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Ingresa los parámetros y haz clic en Calcular</h3>
          <p className="text-muted-foreground mt-1">El sistema calculará automáticamente todos los materiales necesarios</p>
        </Card>
      )}
    </div>
  )
}