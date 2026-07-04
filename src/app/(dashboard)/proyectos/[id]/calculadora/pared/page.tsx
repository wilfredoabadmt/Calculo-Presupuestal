"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  ChevronDown
} from "lucide-react"
import { formatNumber, cn } from "@/lib/utils"

const tiposBloque = [
  { nombre: "B-10x20x40", unidadesM2: 12.5, morteroM3M2: 0.00775 },
  { nombre: "B-12x20x40", unidadesM2: 12.5, morteroM3M2: 0.009025 },
  { nombre: "B-15x20x40", unidadesM2: 12.5, morteroM3M2: 0.0115 },
  { nombre: "B-20x20x40", unidadesM2: 12.5, morteroM3M2: 0.01525 },
  { nombre: "Ladrillo 6 huecos", unidadesM2: 55, morteroM3M2: 0.025 },
  { nombre: "Ladrillo 8 huecos", unidadesM2: 50, morteroM3M2: 0.028 },
]

const dosificacionesMortero = [
  { ratio: "1:2", cemento: 610, arena: 0.97, agua: 250 },
  { ratio: "1:3", cemento: 600, arena: 1.10, agua: 250 },
  { ratio: "1:4", cemento: 364, arena: 1.16, agua: 240 },
  { ratio: "1:5", cemento: 302, arena: 1.20, agua: 240 },
  { ratio: "1:6", cemento: 261, arena: 1.20, agua: 235 },
]

const afinados = [
  { tipo: "GROSOR", espesor: 19, rendimiento: 1.5, agua: 18 },
  { tipo: "SEMIGROSOR", espesor: 7, rendimiento: 2.5, agua: 16 },
  { tipo: "FINO", espesor: 5, rendimiento: 3.5, agua: 15 },
  { tipo: "EXTRAFINO", espesor: 2, rendimiento: 7.0, agua: 12 },
]

const PESO_BOLSA = 42.5

export default function ParedCalculatorPage() {
  const params = useParams()
  const projectId = params.id as string

  const [form, setForm] = useState({
    area: "10.00",
    tipoBloque: "B-15x20x40",
    dosificacionPega: "1:4",
    dosificacionRepello: "1:4",
    espesorRepello: "1.5",
    dosificacionAfinado: "FINO",
    espesorAfinado: "5",
    desperdicioBloques: "5",
    desperdicioAcabados: "10",
    incluirAcabados: "si",
    cantidad: "1",
    redondeo: "entero",
  })

  const [results, setResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const bloque = tiposBloque.find(b => b.nombre === form.tipoBloque) || tiposBloque[2]
  const pega = dosificacionesMortero.find(d => d.ratio === form.dosificacionPega) || dosificacionesMortero[2]
  const repello = dosificacionesMortero.find(d => d.ratio === form.dosificacionRepello) || dosificacionesMortero[2]
  const afinado = afinados.find(a => a.tipo === form.dosificacionAfinado) || afinados[2]

  const calculate = () => {
    setIsCalculating(true)
    
    const area = parseFloat(form.area)
    const cantidad = parseInt(form.cantidad)
    const desBloques = parseFloat(form.desperdicioBloques) / 100
    const desAcabados = parseFloat(form.desperdicioAcabados) / 100
    const incluirAcabados = form.incluirAcabados === "si"

    if (!area || !cantidad) {
      setIsCalculating(false)
      return
    }

    const areaTotal = area * cantidad

    // Bloques
    const bloques = Math.ceil(areaTotal * bloque.unidadesM2 * (1 + desBloques))

    // Pega
    const volPega = areaTotal * bloque.morteroM3M2
    const cementoPegaKg = volPega * pega.cemento * (1 + desAcabados)
    const arenaPegaM3 = volPega * pega.arena * (1 + desAcabados)
    const aguaPegaLt = volPega * pega.agua * (1 + desAcabados)

    // Repello
    const espesorRepelloM = parseFloat(form.espesorRepello) / 100
    const volRepello = areaTotal * 2 * espesorRepelloM // 2 caras
    const cementoRepKg = volRepello * repello.cemento * (1 + desAcabados)
    const arenaRepM3 = volRepello * repello.arena * (1 + desAcabados)
    const aguaRepLt = volRepello * repello.agua * (1 + desAcabados)

    // Afinado
    const espesorAfinadoM = parseFloat(form.espesorAfinado) / 1000
    const volAfinado = areaTotal * 2 * espesorAfinadoM // 2 caras
    const bolsasAfinado = Math.ceil(volAfinado * 1000 / afinado.rendimiento) // m3 a m2 * bolsas/m2
    const cementoAfinadoKg = bolsasAfinado * PESO_BOLSA
    const arenaAfinadoM3 = bolsasAfinado * 0.02 // aprox
    const aguaAfinadoLt = bolsasAfinado * afinado.agua

    // Totales
    const totalCementoKg = cementoPegaKg + (incluirAcabados ? cementoRepKg + cementoAfinadoKg : 0)
    const totalArenaM3 = arenaPegaM3 + (incluirAcabados ? arenaRepM3 + arenaAfinadoM3 : 0)
    const totalAguaLt = aguaPegaLt + (incluirAcabados ? aguaRepLt + aguaAfinadoLt : 0)
    const bolsasCemento = Math.ceil(totalCementoKg / PESO_BOLSA)

    // Precios
    const precioCemento = 8.60
    const precioArena = 28.33
    const precioAgua = 0.003
    const precioBloque = 3.80

    setResults({
      areaTotal,
      bloques,
      costoBloques: bloques * precioBloque,
      cementoPegaKg, arenaPegaM3, aguaPegaLt,
      cementoRepKg, arenaRepM3, aguaRepLt,
      cementoAfinadoKg, arenaAfinadoM3, aguaAfinadoLt,
      totalCementoKg,
      bolsasCemento,
      totalArenaM3,
      totalAguaLt,
      totalCosto: bolsasCemento * precioCemento + totalArenaM3 * precioArena + totalAguaLt * precioAgua + bloques * precioBloque,
    })

    setIsCalculating(false)
  }

  const handleSave = async () => {
    if (!results) return
    alert("Elemento guardado en el proyecto!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/proyectos/${projectId}/calculadora`} className="p-2 hover:bg-accent rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Box className="h-7 w-7 text-primary" />
              Calculadora de Paredes / Mampostería
            </h1>
            <p className="text-muted-foreground">Bloques, ladrillos, pega, repello y afinado</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={!results}>
            <Save className="mr-2 h-4 w-4" />
            Guardar en Proyecto
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle>Parámetros de Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="area">Área del Muro (m²)</Label>
                <Input id="area" value={form.area} onChange={e => setForm({...form, area: e.target.value})} placeholder="10.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad de Muros</Label>
                <Input id="cantidad" type="number" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} placeholder="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Bloque / Ladrillo</Label>
              <Select value={form.tipoBloque} onValueChange={v => setForm({...form, tipoBloque: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {tiposBloque.map(b => (
                    <SelectItem key={b.nombre} value={b.nombre}>{b.nombre} ({b.unidadesM2} un/m²)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Dosificación Pega</Label>
                <Select value={form.dosificacionPega} onValueChange={v => setForm({...form, dosificacionPega: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dosificacionesMortero.map(d => <SelectItem key={d.ratio} value={d.ratio}>{d.ratio}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dosificación Repello</Label>
                <Select value={form.dosificacionRepello} onValueChange={v => setForm({...form, dosificacionRepello: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dosificacionesMortero.map(d => <SelectItem key={d.ratio} value={d.ratio}>{d.ratio}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Espesor Repello (cm)</Label>
                <Input value={form.espesorRepello} onChange={e => setForm({...form, espesorRepello: e.target.value})} placeholder="1.5" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Afinado</Label>
                <Select value={form.dosificacionAfinado} onValueChange={v => setForm({...form, dosificacionAfinado: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {afinados.map(a => <SelectItem key={a.tipo} value={a.tipo}>{a.tipo} ({a.espesor}mm)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Espesor Afinado (mm)</Label>
                <Input value={form.espesorAfinado} onChange={e => setForm({...form, espesorAfinado: e.target.value})} placeholder="5" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Desperdicio Bloques (%)</Label>
                <Input type="number" value={form.desperdicioBloques} onChange={e => setForm({...form, desperdicioBloques: e.target.value})} placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label>Desperdicio Acabados (%)</Label>
                <Input type="number" value={form.desperdicioAcabados} onChange={e => setForm({...form, desperdicioAcabados: e.target.value})} placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label>Incluir Acabados</Label>
                <Select value={form.incluirAcabados} onValueChange={v => setForm({...form, incluirAcabados: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Sí (Repello + Afinado)</SelectItem>
                    <SelectItem value="no">Solo Bloques + Pega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Redondeo Cemento</Label>
                <Select value={form.redondeo} onValueChange={v => setForm({...form, redondeo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entero">Bolsas enteras (ceil)</SelectItem>
                    <SelectItem value="exacto">Exacto (decimal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full" onClick={calculate} disabled={isCalculating} size="lg">
              {isCalculating ? "Calculando..." : "Calcular Materiales"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="sticky top-24 h-fit" style={{ background: "hsl(var(--muted)/0.3)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Área Total</div>
                  <div className="text-2xl font-bold">{formatNumber(results.areaTotal, 2)} m²</div>
                </div>

                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" /> Bloques/Ladrillos
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between"><span>Unidades</span><span className="font-medium">{formatNumber(results.bloques)} uds</span></div>
                    <div className="flex justify-between"><span>Costo</span><span className="font-medium">{formatNumber(results.costoBloques, 2)} Bs.</span></div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Weight className="h-4 w-4" /> Cemento Total
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between"><span>Kg totales</span><span className="font-medium">{formatNumber(results.totalCementoKg, 1)} kg</span></div>
                    <div className="flex justify-between"><span>Bolsas (42.5kg)</span><span className="font-medium">{results.bolsasCemento} bolsas</span></div>
                    <div className="flex justify-between"><span>Costo</span><span className="font-medium">{formatNumber(results.bolsasCemento * 8.60, 2)} Bs.</span></div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Box className="h-4 w-4" /> Arena Total
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between"><span>m³</span><span className="font-medium">{formatNumber(results.totalArenaM3, 4)} m³</span></div>
                    <div className="flex justify-between"><span>Costo</span><span className="font-medium">{formatNumber(results.totalArenaM3 * 28.33, 2)} Bs.</span></div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Droplets className="h-4 w-4" /> Agua Total
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between"><span>Litros</span><span className="font-medium">{formatNumber(results.totalAguaLt, 1)} lt</span></div>
                    <div className="flex justify-between"><span>Barriles</span><span className="font-medium">{formatNumber(results.totalAguaLt / 158.98, 2)} barriles</span></div>
                    <div className="flex justify-between"><span>Galones</span><span className="font-medium">{formatNumber(results.totalAguaLt / 3.785, 1)} gal</span></div>
                    <div className="flex justify-between"><span>Costo</span><span className="font-medium">{formatNumber(results.totalAguaLt * 0.003, 2)} Bs.</span></div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>TOTAL ESTIMADO</span>
                    <span>{formatNumber(results.totalCosto, 2)} Bs.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Ingresa los parámetros y presiona Calcular</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}