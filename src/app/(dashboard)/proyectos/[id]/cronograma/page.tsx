"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { exportarCronogramaPDF } from "@/lib/exports"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calendar, Plus, Download, Loader2, Trash2, GanttChart } from "lucide-react"
import { format, addDays, differenceInCalendarDays } from "date-fns"
import { es } from "date-fns/locale"

interface CronogramaItem {
  id: string
  codigo: string
  item: string
  fechaInicio: string
  duracion: number
  fechaFinal: string
  progreso: number
  dependeDe: string | null
}

type TipoInfo = {
  color: string
  label: string
  descripcion: string
}

const tiposPorCodigo: Record<string, TipoInfo> = {
  OP: {
    color: "#f97316",
    label: "Obras Preliminares",
    descripcion: "Limpieza, excavación, demolición, trazado y replanteo",
  },
  OG: {
    color: "#3b82f6",
    label: "Obra Gruesa",
    descripcion: "Cimientos, columnas, vigas, losas, muros de concreto, zapatas",
  },
  OF: {
    color: "#22c55e",
    label: "Obra Fina / Acabados",
    descripcion: "Paredes Drywall, revoque, pintura, pisos, cielo raso, zócalos",
  },
  IHS: {
    color: "#06b6d4",
    label: "Inst. Hidrosanitarias",
    descripcion: "Tuberías de agua, desagüe, pluvial, aparatos sanitarios",
  },
  IE: {
    color: "#a855f7",
    label: "Inst. Eléctricas",
    descripcion: "Cableado, tomacorrientes, iluminación, tableros eléctricos",
  },
}

// Backward-compat map for bar color lookup
const coloresPorTipo: Record<string, string> = Object.fromEntries(
  Object.entries(tiposPorCodigo).map(([k, v]) => [k, v.color])
)

type ViewMode = "semana" | "mes" | "trimestre"

export default function CronogramaPage() {
  const params = useParams()
  const projectId = params.id as string
  const [items, setItems] = useState<CronogramaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<CronogramaItem | null>(null)
  const [form, setForm] = useState({
    codigo: "",
    item: "",
    fechaInicio: format(new Date(), "yyyy-MM-dd"),
    duracion: "5",
    dependeDe: "none",
    progreso: "0",
  })
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("semana")

  const fetchItems = useCallback(async () => {
    try {
      const r = await fetch(`/api/proyectos/${projectId}/cronograma`)
      if (!r.ok) {
        alert("Error al cargar el cronograma")
        setLoading(false)
        return
      }
      const data = await r.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      alert("Error de conexión al cargar el cronograma")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleSave = async () => {
    setSaving(true)
    const fechaInicio = new Date(form.fechaInicio)
    const duracion = parseInt(form.duracion)
    const fechaFinal = addDays(fechaInicio, duracion)
    const payload = {
      codigo: form.codigo,
      item: form.item,
      fechaInicio: fechaInicio.toISOString(),
      duracion,
      fechaFinal: fechaFinal.toISOString(),
      dependeDe: form.dependeDe === "none" ? null : form.dependeDe,
      progreso: parseFloat(form.progreso) || 0,
    }

    try {
      if (editingItem) {
        const r = await fetch(`/api/proyectos/${projectId}/cronograma/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!r.ok) {
          alert("Error al actualizar la actividad")
          setSaving(false)
          return
        }
      } else {
        const r = await fetch(`/api/proyectos/${projectId}/cronograma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!r.ok) {
          alert("Error al crear la actividad")
          setSaving(false)
          return
        }
      }
      fetchItems()
      setShowDialog(false)
      setEditingItem(null)
      resetForm()
    } catch {
      alert("Error de conexión al guardar")
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta actividad?")) return
    try {
      const r = await fetch(`/api/proyectos/${projectId}/cronograma/${id}`, { method: "DELETE" })
      if (!r.ok) {
        alert("Error al eliminar la actividad")
        return
      }
      fetchItems()
    } catch {
      alert("Error de conexión al eliminar")
    }
  }

  const resetForm = () => {
    setForm({ codigo: "", item: "", fechaInicio: format(new Date(), "yyyy-MM-dd"), duracion: "5", dependeDe: "none", progreso: "0" })
  }

  const openEdit = (item: CronogramaItem) => {
    setEditingItem(item)
    setForm({
      codigo: item.codigo,
      item: item.item,
      fechaInicio: format(new Date(item.fechaInicio), "yyyy-MM-dd"),
      duracion: item.duracion.toString(),
      dependeDe: item.dependeDe || "none",
      progreso: (item.progreso ?? 0).toString(),
    })
    setShowDialog(true)
  }

  const handleExport = () => {
    exportarCronogramaPDF(items)
  }

  const totalDias = items.length > 0
    ? differenceInCalendarDays(
        new Date(Math.max(...items.map(i => new Date(i.fechaFinal).getTime()))),
        new Date(Math.min(...items.map(i => new Date(i.fechaInicio).getTime())))
      )
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cronograma de Obra"
        description="Programación de actividades Gantt"
        backHref={`/proyectos/${projectId}`}
        icon={<Calendar className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button onClick={() => { setEditingItem(null); resetForm(); setShowDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Agregar Actividad
            </Button>
          </>
        }
      />

      {items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{items.length}</div>
              <div className="text-sm text-muted-foreground">Actividades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalDias} días</div>
              <div className="text-sm text-muted-foreground">Duración Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{items.filter(i => i.codigo.startsWith("OG")).length}</div>
              <div className="text-sm text-muted-foreground">Actividades Obra Gruesa</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GanttChart className="h-5 w-5" />
            Diagrama de Gantt
          </CardTitle>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setViewMode("semana")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${viewMode === "semana" ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >Semana</button>
            <button
              onClick={() => setViewMode("mes")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${viewMode === "mes" ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >Mes</button>
            <button
              onClick={() => setViewMode("trimestre")}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${viewMode === "trimestre" ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >Trimestre</button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title="Cronograma vacío"
              description="Agrega actividades del presupuesto para generar el cronograma Gantt con ruta crítica"
              action={
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar Primera Actividad
                </Button>
              }
            />
          ) : (
            <div className="space-y-1">
              {/* Header con fechas */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-56 text-xs font-medium text-muted-foreground">Actividad</div>
                <div className="flex-1 flex justify-between text-xs text-muted-foreground">
                  <span>{format(new Date(Math.min(...items.map(i => new Date(i.fechaInicio).getTime()))), "dd MMM yyyy", { locale: es })}</span>
                  <span>{format(new Date(Math.max(...items.map(i => new Date(i.fechaFinal).getTime()))), "dd MMM yyyy", { locale: es })}</span>
                </div>
              </div>

              {/* Barras Gantt simplificadas */}
              {items.map(item => {
                const allStart = new Date(Math.min(...items.map(i => new Date(i.fechaInicio).getTime())))
                const allEnd = new Date(Math.max(...items.map(i => new Date(i.fechaFinal).getTime())))
                const totalRange = differenceInCalendarDays(allEnd, allStart) || 1
                const viewScale = viewMode === "semana" ? 1 : viewMode === "mes" ? 0.6 : 0.35
                const itemStart = differenceInCalendarDays(new Date(item.fechaInicio), allStart)
                const startPercent = (itemStart / totalRange) * 100
                const widthPercent = (item.duracion / totalRange) * 100
                // Determine color based on code prefix or semantic matching of activity name
                const getTipoColor = (codigo: string, itemStr: string): string => {
                  const codeUpper = (codigo || "").toUpperCase().trim()
                  const itemLower = (itemStr || "").toLowerCase().trim()

                  if (codeUpper.startsWith("IHS")) return coloresPorTipo.IHS
                  if (codeUpper.startsWith("OP")) return coloresPorTipo.OP
                  if (codeUpper.startsWith("OG")) return coloresPorTipo.OG
                  if (codeUpper.startsWith("OF")) return coloresPorTipo.OF
                  if (codeUpper.startsWith("IE")) return coloresPorTipo.IE

                  // Semantic fallback
                  if (itemLower.includes("excavac") || itemLower.includes("preliminar") || itemLower.includes("limpieza") || itemLower.includes("trazo") || itemLower.includes("replanteo") || itemLower.includes("zanja") || itemLower.includes("demolic") || itemLower.includes("faena")) {
                    return coloresPorTipo.OP
                  }
                  if (itemLower.includes("pilar") || itemLower.includes("columna") || itemLower.includes("viga") || itemLower.includes("losa") || itemLower.includes("loza") || itemLower.includes("cimiento") || itemLower.includes("zapata") || itemLower.includes("hormigon") || itemLower.includes("concreto") || itemLower.includes("armado") || itemLower.includes("vaciado") || itemLower.includes("estructura") || itemLower.includes("sobrecimiento")) {
                    return coloresPorTipo.OG
                  }
                  if (itemLower.includes("muro") || itemLower.includes("pared") || itemLower.includes("revoque") || itemLower.includes("yeso") || itemLower.includes("pintura") || itemLower.includes("piso") || itemLower.includes("ceramica") || itemLower.includes("acabado") || itemLower.includes("cielo") || itemLower.includes("puerta") || itemLower.includes("ventana") || itemLower.includes("revestimiento")) {
                    return coloresPorTipo.OF
                  }
                  if (itemLower.includes("tuberia") || itemLower.includes("agua") || itemLower.includes("sanitari") || itemLower.includes("desague") || itemLower.includes("pluvial") || itemLower.includes("grifo") || itemLower.includes("inodoro") || itemLower.includes("lavaman") || itemLower.includes("alcantarillado")) {
                    return coloresPorTipo.IHS
                  }
                  if (itemLower.includes("electric") || itemLower.includes("cable") || itemLower.includes("toma") || itemLower.includes("interruptor") || itemLower.includes("iluminac") || itemLower.includes("luz") || itemLower.includes("tablero") || itemLower.includes("tomacorriente")) {
                    return coloresPorTipo.IE
                  }

                  // Numeric fallback
                  const num = parseInt(codeUpper.replace(/\D/g, ""), 10)
                  if (!isNaN(num)) {
                    if (num === 1) return coloresPorTipo.OP
                    if (num >= 2 && num <= 4) return coloresPorTipo.OG
                    if (num >= 5 && num <= 7) return coloresPorTipo.OF
                    if (num >= 8 && num <= 9) return coloresPorTipo.IHS
                    if (num >= 10) return coloresPorTipo.IE
                  }

                  return "#3b82f6" // default
                }
                const color = getTipoColor(item.codigo, item.item)

                return (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <div className="w-56 text-sm truncate font-medium">{item.codigo} {item.item}</div>
                    <div className="flex-1 h-7 bg-muted rounded overflow-hidden relative">
                      <div
                        className="absolute h-full rounded transition-all"
                        style={{
                          left: `${startPercent}%`,
                          width: `${Math.max(widthPercent * viewScale, 2)}%`,
                          backgroundColor: `${color}33`,
                        }}
                      />
                      <div
                        className="absolute h-full rounded transition-all"
                        style={{
                          left: `${startPercent}%`,
                          width: `${Math.max(widthPercent * viewScale * ((item.progreso ?? 0) / 100), 1)}%`,
                          backgroundColor: color,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium z-10">
                        {item.codigo} - {item.duracion}d
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-muted-foreground">{item.progreso ?? 0}%</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(item)}>
                        <span className="text-xs">✏️</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <>
          {/* S-Curve */}
          <Card>
            <CardHeader><CardTitle>Curva S - Inversión Acumulada</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const sorted = [...items].sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
                  const minDate = new Date(sorted[0].fechaInicio)
                  const maxDate = new Date(sorted.reduce((max, i) => Math.max(max, new Date(i.fechaFinal).getTime()), 0))
                  const totalDays = differenceInCalendarDays(maxDate, minDate) || 1
                  const maxProgress = sorted.length * 100

                  // Build cumulative points
                  const points: { date: Date; pct: number }[] = []
                  let cumulative = 0
                  for (const item of sorted) {
                    cumulative += item.progreso || 0
                    points.push({ date: new Date(item.fechaFinal), pct: cumulative })
                  }

                  // SVG dimensions (must match container)
                  const svgW = 800
                  const svgH = 128

                  return (
                    <>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{format(minDate, "dd MMM", { locale: es })}</span>
                        <span>{format(maxDate, "dd MMM yyyy", { locale: es })}</span>
                      </div>
                      <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(pct => (
                          <div key={pct} className="absolute w-full border-t border-muted" style={{ bottom: `${pct}%` }}>
                            <span className="absolute -top-4 -left-1 text-[10px] text-muted-foreground">{pct}%</span>
                          </div>
                        ))}
                        {/* S-curve line */}
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox={`0 0 ${svgW} ${svgH}`}
                          preserveAspectRatio="none"
                        >
                          <polyline
                            points={points.map((p) => {
                              const x = ((new Date(p.date).getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * svgW
                              const y = svgH - (maxProgress > 0 ? (p.pct / maxProgress) * svgH : 0)
                              return `${x},${y}`
                            }).join(" ")}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        {/* Progress indicator */}
                        <div className="absolute bottom-2 right-2 text-sm font-medium text-primary">
                          {maxProgress > 0 ? Math.round((cumulative / maxProgress) * 100) : 0}% completado
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total: {sorted.length} actividades</span>
                        <span>Duración: {totalDays} días</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leyenda de Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Compute which types are actually used in current items */}
              {(() => {
                const usedTypes = new Set<string>()
                items.forEach(item => {
                  const codeUpper = (item.codigo || "").toUpperCase().trim()
                  const itemLower = (item.item || "").toLowerCase()
                  if (codeUpper.startsWith("IHS")) usedTypes.add("IHS")
                  else if (codeUpper.startsWith("OP")) usedTypes.add("OP")
                  else if (codeUpper.startsWith("OG")) usedTypes.add("OG")
                  else if (codeUpper.startsWith("OF")) usedTypes.add("OF")
                  else if (codeUpper.startsWith("IE")) usedTypes.add("IE")
                  else if (itemLower.includes("excavac") || itemLower.includes("preliminar") || itemLower.includes("limpieza") || itemLower.includes("trazo") || itemLower.includes("zanja")) usedTypes.add("OP")
                  else if (itemLower.includes("pilar") || itemLower.includes("columna") || itemLower.includes("viga") || itemLower.includes("losa") || itemLower.includes("cimiento") || itemLower.includes("concreto") || itemLower.includes("vaciado") || itemLower.includes("armado")) usedTypes.add("OG")
                  else if (itemLower.includes("muro") || itemLower.includes("pared") || itemLower.includes("pintura") || itemLower.includes("piso") || itemLower.includes("cielo") || itemLower.includes("zócalo") || itemLower.includes("drywall") || itemLower.includes("acabado") || itemLower.includes("revoque")) usedTypes.add("OF")
                  else if (itemLower.includes("tuberia") || itemLower.includes("agua") || itemLower.includes("sanitari") || itemLower.includes("desague") || itemLower.includes("grifo")) usedTypes.add("IHS")
                  else if (itemLower.includes("electric") || itemLower.includes("cable") || itemLower.includes("tomacorriente") || itemLower.includes("iluminac") || itemLower.includes("tablero")) usedTypes.add("IE")
                  else usedTypes.add("OG") // default fallback
                })

                const tiposOrdenados = ["OP", "OG", "OF", "IHS", "IE"].filter(t => usedTypes.has(t))

                return (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {tiposOrdenados.map(tipo => {
                        const info = tiposPorCodigo[tipo]
                        const count = items.filter(item => {
                          const cu = (item.codigo || "").toUpperCase().trim()
                          return cu.startsWith(tipo)
                        }).length
                        return (
                          <div
                            key={tipo}
                            className="flex items-start gap-3 p-3 rounded-lg border"
                            style={{ borderLeftColor: info.color, borderLeftWidth: 4 }}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: info.color }}>
                                {tipo}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm">{info.label}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{info.descripcion}</div>
                              {count > 0 && (
                                <div className="mt-1.5 text-xs font-medium" style={{ color: info.color }}>
                                  {count} {count === 1 ? "actividad" : "actividades"} en este cronograma
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {tiposOrdenados.length < Object.keys(tiposPorCodigo).length && (
                      <p className="text-xs text-muted-foreground">
                        💡 Usa prefijos <strong>OP</strong>, <strong>OG</strong>, <strong>OF</strong>, <strong>IHS</strong> o <strong>IE</strong> en el código de cada actividad para clasificarla automáticamente.
                      </p>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Actividad" : "Nueva Actividad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="OG01" />
                <p className="text-xs text-muted-foreground">
                  Prefijo: <span className="font-medium" style={{ color: "#f97316" }}>OP</span> Prelim. · <span className="font-medium" style={{ color: "#3b82f6" }}>OG</span> Gruesa · <span className="font-medium" style={{ color: "#22c55e" }}>OF</span> Fina · <span className="font-medium" style={{ color: "#06b6d4" }}>IHS</span> Hidrosanitaria · <span className="font-medium" style={{ color: "#a855f7" }}>IE</span> Eléctrica
                </p>
              </div>
              <div className="space-y-2">
                <Label>Duración (días)</Label>
                <Input type="number" min="1" value={form.duracion} onChange={e => setForm({ ...form, duracion: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Actividad</Label>
              <Input value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} placeholder="Excavación de zanja" />
            </div>
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Depende de (opcional)</Label>
              <Select value={form.dependeDe} onValueChange={v => setForm({ ...form, dependeDe: v })}>
                <SelectTrigger><SelectValue placeholder="Sin dependencia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin dependencia</SelectItem>
                  {items.filter(i => i.id !== editingItem?.id).map(i => (
                    <SelectItem key={i.id} value={i.id}>{i.codigo} {i.item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Progreso: {form.progreso}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.progreso}
                onChange={e => setForm({ ...form, progreso: e.target.value })}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.codigo || !form.item}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingItem ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
