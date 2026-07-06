"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputWithHelp } from "@/components/ui/input-with-help"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator, Save, Box, CheckCircle, Loader2 } from "lucide-react"
import { formatNumber, cn } from "@/lib/utils"

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
    ancho: "",
    largo: "",
    tipoCeramica: "Cerámica 60x60",
    despCeramica: "5",
    despAdhesivo: "5",
    despBoquilla: "5",
    cantidad: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateAllFields = (shouldSetState = false) => {
    const errors: Record<string, string> = {}

    if (!form.ancho || parseFloat(form.ancho) <= 0) {
      errors.ancho = "Debe ser un número mayor a 0"
    }
    if (!form.largo || parseFloat(form.largo) <= 0) {
      errors.largo = "Debe ser un número mayor a 0"
    }
    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      errors.cantidad = "Debe ser mayor a 0"
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
    if (field === "ancho" || field === "largo") {
      return parseFloat(value) > 0
    }
    if (field === "cantidad") {
      return parseInt(value) > 0
    }
    return true
  }

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
    if (!validateAllFields(true)) {
      return
    }

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
            <svg className="mx-auto max-w-[240px] w-full" viewBox="0 0 240 140">
              {/* Floor rectangle */}
              <rect x="30" y="20" width="160" height="80" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              {/* Tile grid lines */}
              <line x1="70" y1="20" x2="70" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.35"/>
              <line x1="110" y1="20" x2="110" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.35"/>
              <line x1="150" y1="20" x2="150" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.35"/>
              <line x1="30" y1="47" x2="190" y2="47" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.35"/>
              <line x1="30" y1="74" x2="190" y2="74" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.35"/>
              {/* Ancho (bottom) */}
              <line x1="30" y1="112" x2="190" y2="112" stroke="#f97316" strokeWidth="1.2"/>
              <text x="110" y="128" textAnchor="middle" fontSize="11" fill="#f97316" fontWeight="600">
                Ancho {form.ancho ? `= ${form.ancho} m` : "(A)"}
              </text>
              {/* Largo (right vertical) */}
              <line x1="205" y1="20" x2="205" y2="100" stroke="#3b82f6" strokeWidth="1.2"/>
              <text x="222" y="62" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="600" transform="rotate(90,222,62)">
                Largo {form.largo ? `= ${form.largo} m` : "(L)"}
              </text>
            </svg>
            <div className="flex justify-center gap-4 mt-1 flex-wrap text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#f97316"}}/>
                <span className="text-muted-foreground">Ancho</span>
                {form.ancho && <span className="font-bold text-orange-500">{form.ancho} m</span>}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#3b82f6"}}/>
                <span className="text-muted-foreground">Largo</span>
                {form.largo && <span className="font-bold text-blue-600">{form.largo} m</span>}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputWithHelp
              label="Ancho (m)"
              helpText="Longitud horizontal del área a pavimentar"
              example="4.00 para área de 4 metros de ancho"
              unit="m"
              value={form.ancho}
              onChange={(e) => setForm({...form, ancho: e.target.value})}
              placeholder="4.00"
              error={getFieldError("ancho")}
              success={getFieldSuccess("ancho")}
              min="0.01"
              step="0.01"
            />
            <InputWithHelp
              label="Largo (m)"
              helpText="Longitud vertical del área a pavimentar"
              example="5.00 para área de 5 metros de largo"
              unit="m"
              value={form.largo}
              onChange={(e) => setForm({...form, largo: e.target.value})}
              placeholder="5.00"
              error={getFieldError("largo")}
              success={getFieldSuccess("largo")}
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Cerámica</Label>
              <Select value={form.tipoCeramica} onValueChange={v => setForm({...form, tipoCeramica: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tiposCeramica.map(t => <SelectItem key={t.nombre} value={t.nombre}>{t.nombre} ({t.unidadesCaja} pzas/caja)</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Selecione el tipo de cerámica para cálculo de cantidad y costo</p>
            </div>
            <InputWithHelp
              label="Cantidad"
              helpText="Número de áreas idénticas a pavimentar"
              example="1 para un área individual, 3 para tres áreas"
              unit="unidades"
              value={form.cantidad}
              onChange={(e) => setForm({...form, cantidad: e.target.value})}
              placeholder="1"
              error={getFieldError("cantidad")}
              success={getFieldSuccess("cantidad")}
              min="1"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InputWithHelp
              label="Desp. Cerámica (%)"
              helpText="Material extra por pérdidas, roturas, errores de corte en cerámica"
              example="5% es estándar en pavimentos"
              unit="%"
              value={form.despCeramica}
              onChange={(e) => setForm({...form, despCeramica: e.target.value})}
              min="0"
              max="100"
              success={parseFloat(form.despCeramica) >= 0 && parseFloat(form.despCeramica) <= 100}
            />
            <InputWithHelp
              label="Desp. Adhesivo (%)"
              helpText="Extra por pérdidas en adhesivo de pegado"
              example="5% para aplicación típica de adhesivo"
              unit="%"
              value={form.despAdhesivo}
              onChange={(e) => setForm({...form, despAdhesivo: e.target.value})}
              min="0"
              max="100"
              success={parseFloat(form.despAdhesivo) >= 0 && parseFloat(form.despAdhesivo) <= 100}
            />
            <InputWithHelp
              label="Desp. Boquilla (%)"
              helpText="Extra por pérdidas en mortero de juntas para baldosa"
              example="5% para juntas estándar de baldosa"
              unit="%"
              value={form.despBoquilla}
              onChange={(e) => setForm({...form, despBoquilla: e.target.value})}
              min="0"
              max="100"
              success={parseFloat(form.despBoquilla) >= 0 && parseFloat(form.despBoquilla) <= 100}
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
