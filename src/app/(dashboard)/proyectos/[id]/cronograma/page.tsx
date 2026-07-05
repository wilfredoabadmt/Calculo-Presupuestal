"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies?: string
  customStyles?: { progressColor?: string; barBackgroundColor?: string }
}

const coloresPorTipo: Record<string, string> = {
  OP: "#f97316",
  OG: "#3b82f6",
  OF: "#22c55e",
  IHS: "#06b6d4",
  IE: "#a855f7",
}

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
    dependeDe: "",
  })
  const [saving, setSaving] = useState(false)

  const fetchItems = useCallback(() => {
    fetch(`/api/proyectos/${projectId}/cronograma`)
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const ganttTasks: GanttTask[] = items.map(item => {
    const start = new Date(item.fechaInicio)
    const end = addDays(start, item.duracion)
    const tipo = item.codigo.substring(0, 2)
    return {
      id: item.id,
      name: `${item.codigo} ${item.item}`,
      start,
      end,
      progress: item.progreso || 0,
      dependencies: item.dependeDe || undefined,
      customStyles: {
        progressColor: coloresPorTipo[tipo] || "#3b82f6",
        barBackgroundColor: coloresPorTipo[tipo] ? `${coloresPorTipo[tipo]}33` : "#3b82f633",
      },
    }
  })

  const handleSave = async () => {
    setSaving(true)
    const fechaInicio = new Date(form.fechaInicio)
    const duracion = parseInt(form.duracion)
    const fechaFinal = addDays(fechaInicio, duracion)

    try {
      if (editingItem) {
        await fetch(`/api/proyectos/${projectId}/cronograma/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: form.codigo,
            item: form.item,
            fechaInicio: fechaInicio.toISOString(),
            duracion,
            fechaFinal: fechaFinal.toISOString(),
            dependeDe: form.dependeDe || null,
          }),
        })
      } else {
        await fetch(`/api/proyectos/${projectId}/cronograma`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: form.codigo,
            item: form.item,
            fechaInicio: fechaInicio.toISOString(),
            duracion,
            fechaFinal: fechaFinal.toISOString(),
            dependeDe: form.dependeDe || null,
          }),
        })
      }
      fetchItems()
      setShowDialog(false)
      setEditingItem(null)
      setForm({ codigo: "", item: "", fechaInicio: format(new Date(), "yyyy-MM-dd"), duracion: "5", dependeDe: "" })
    } catch {
      alert("Error al guardar")
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta actividad?")) return
    try {
      await fetch(`/api/proyectos/${projectId}/cronograma/${id}`, { method: "DELETE" })
      fetchItems()
    } catch {
      alert("Error al eliminar")
    }
  }

  const openEdit = (item: CronogramaItem) => {
    setEditingItem(item)
    setForm({
      codigo: item.codigo,
      item: item.item,
      fechaInicio: format(new Date(item.fechaInicio), "yyyy-MM-dd"),
      duracion: item.duracion.toString(),
      dependeDe: item.dependeDe || "",
    })
    setShowDialog(true)
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
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button onClick={() => { setEditingItem(null); setForm({ codigo: "", item: "", fechaInicio: format(new Date(), "yyyy-MM-dd"), duracion: "5", dependeDe: "" }); setShowDialog(true) }}>
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
            <span className="px-3 py-1 rounded bg-primary/10 text-primary">Semana</span>
            <span className="px-3 py-1 rounded bg-muted text-muted-foreground">Mes</span>
            <span className="px-3 py-1 rounded bg-muted text-muted-foreground">Trimestre</span>
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
                const itemStart = differenceInCalendarDays(new Date(item.fechaInicio), allStart)
                const startPercent = (itemStart / totalRange) * 100
                const widthPercent = (item.duracion / totalRange) * 100
                const tipo = item.codigo.substring(0, 2)
                const color = coloresPorTipo[tipo] || "#3b82f6"

                return (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <div className="w-56 text-sm truncate font-medium">{item.codigo} {item.item}</div>
                    <div className="flex-1 h-7 bg-muted rounded overflow-hidden relative">
                      <div
                        className="absolute h-full rounded transition-all"
                        style={{
                          left: `${startPercent}%`,
                          width: `${Math.max(widthPercent, 2)}%`,
                          backgroundColor: `${color}33`,
                        }}
                      />
                      <div
                        className="absolute h-full rounded transition-all"
                        style={{
                          left: `${startPercent}%`,
                          width: `${Math.max(widthPercent * (item.progreso / 100), 1)}%`,
                          backgroundColor: color,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium z-10">
                        {item.codigo} - {item.duracion}d
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-muted-foreground">{item.progreso}%</div>
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
                  const totalCost = sorted.reduce((sum, i) => sum + (i.progreso || 0), 0)
                  const maxProgress = sorted.length * 100

                  // Build cumulative points
                  const points: { date: Date; pct: number }[] = []
                  let cumulative = 0
                  for (const item of sorted) {
                    cumulative += item.progreso || 0
                    points.push({ date: new Date(item.fechaFinal), pct: cumulative })
                  }

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
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          <polyline
                            points={points.map((p, i) => {
                              const x = ((new Date(p.date).getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100
                              const y = 100 - (maxProgress > 0 ? (p.pct / maxProgress) * 100 : 0)
                              return `${x}%,${y}%`
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
            <CardHeader><CardTitle>Leyenda</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                {Object.entries(coloresPorTipo).map(([tipo, color]) => (
                  <div key={tipo} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                    {tipo === "OP" && "Obras Preliminares"}
                    {tipo === "OG" && "Obra Gruesa"}
                    {tipo === "OF" && "Obra Fina"}
                    {tipo === "IHS" && "Inst. Hidrosanitarias"}
                    {tipo === "IE" && "Inst. Eléctricas"}
                  </div>
                ))}
              </div>
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
