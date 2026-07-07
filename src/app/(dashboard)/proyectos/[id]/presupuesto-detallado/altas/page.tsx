"use client"

import { useState } from "react"
import { usePresupuesto, Capitulo, Partida } from "@/components/presupuesto/PresupuestoContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { formatCurrency } from "@/lib/utils"
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Settings,
  Tag,
  Download,
  Search,
  CheckSquare,
  Square,
  Calculator,
} from "lucide-react"

const UNIDADES = ["m³", "m²", "ml", "ud", "kg", "lote", "pza", "gl", "tubo", "hr", "hja", "glb"]

const CAPITULOS_PREDEFINIDOS = [
  { codigo: 1, nombre: "DEMOLICIONES" },
  { codigo: 2, nombre: "MOVIMIENTO DE TIERRAS Y CIMENTACION" },
  { codigo: 3, nombre: "SANEAMIENTOS" },
  { codigo: 4, nombre: "ESTRUCTURAS" },
  { codigo: 5, nombre: "CUBIERTAS" },
  { codigo: 6, nombre: "ALBAÑILERIA" },
  { codigo: 7, nombre: "REVESTIMIENTOS" },
  { codigo: 8, nombre: "CARPINTERIA" },
  { codigo: 9, nombre: "INSTALACION DE FONTANERIA" },
  { codigo: 10, nombre: "INSTALACION DE ELECTRICIDAD" },
  { codigo: 11, nombre: "PINTURAS" },
]

export default function AltasPage() {
  const {
    proyectoId,
    capitulos,
    loading,
    cargarDatos,
    crearCapitulo,
    actualizarCapitulo,
    eliminarCapitulo,
    crearPartida,
    actualizarPartida,
    eliminarPartida,
    presupuesto,
    actualizarParametros,
  } = usePresupuesto()

  const [expandedCaps, setExpandedCaps] = useState<Set<string>>(new Set())
  const [capDialogOpen, setCapDialogOpen] = useState(false)
  const [partDialogOpen, setPartDialogOpen] = useState(false)
  const [editingCap, setEditingCap] = useState<Capitulo | null>(null)
  const [editingPart, setEditingPart] = useState<Partida | null>(null)
  const [selectedCapId, setSelectedCapId] = useState<string>("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<"capitulo" | "partida">("capitulo")
  const [saving, setSaving] = useState(false)

  // Importación desde calculadoras del proyecto
  const [importOpen, setImportOpen] = useState(false)
  const [importItems, setImportItems] = useState<{ id: string; tipoElemento: string; descripcion: string; cantidad: number; costoTotal: number }[]>([])
  const [importSelected, setImportSelected] = useState<Set<string>>(new Set())
  const [importLoading, setImportLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  // Capítulo form
  const [capForm, setCapForm] = useState({ codigo: "", nombre: "", descripcion: "" })
  // Partida form
  const [partForm, setPartForm] = useState({ codigo: "", descripcion: "", unidad: "m²", precioBase: "" })
  // Parámetros financieros
  const [biValue, setBiValue] = useState(presupuesto?.porcentajeBI?.toString() || "10")
  const [ivaValue, setIvaValue] = useState(presupuesto?.porcentajeIVA?.toString() || "21")

  const toggleExpand = (capId: string) => {
    setExpandedCaps(prev => {
      const next = new Set(prev)
      if (next.has(capId)) next.delete(capId)
      else next.add(capId)
      return next
    })
  }

  const expandAll = () => {
    if (expandedCaps.size === capitulos.length) {
      setExpandedCaps(new Set())
    } else {
      setExpandedCaps(new Set(capitulos.map(c => c.id)))
    }
  }

  // ====== CAPÍTULOS ======
  const openCreateCap = () => {
    setEditingCap(null)
    const nextCodigo = capitulos.length > 0 ? Math.max(...capitulos.map(c => c.codigo)) + 1 : 1
    setCapForm({ codigo: nextCodigo.toString(), nombre: "", descripcion: "" })
    setCapDialogOpen(true)
  }

  const openEditCap = (cap: Capitulo) => {
    setEditingCap(cap)
    setCapForm({ codigo: cap.codigo.toString(), nombre: cap.nombre, descripcion: cap.descripcion || "" })
    setCapDialogOpen(true)
  }

  const handleSaveCap = async () => {
    if (!capForm.codigo || !capForm.nombre) return
    setSaving(true)
    if (editingCap) {
      await actualizarCapitulo(editingCap.id, { nombre: capForm.nombre, descripcion: capForm.descripcion })
    } else {
      const nuevo = await crearCapitulo(parseInt(capForm.codigo), capForm.nombre, capForm.descripcion)
      if (nuevo) setExpandedCaps(prev => new Set([...prev, nuevo.id]))
    }
    setSaving(false)
    setCapDialogOpen(false)
  }

  const handleDeleteCapitulo = async () => {
    if (!deleteId) return
    await eliminarCapitulo(deleteId)
    setDeleteId(null)
  }

  // ====== PARTIDAS ======
  const openCreatePart = (capId: string) => {
    setEditingPart(null)
    setSelectedCapId(capId)
    const cap = capitulos.find(c => c.id === capId)
    const nextCodigo = cap && cap.partidas.length > 0
      ? (Math.max(...cap.partidas.map(p => parseFloat(p.codigo))) + 1).toString()
      : "1"
    setPartForm({ codigo: nextCodigo, descripcion: "", unidad: "m²", precioBase: "" })
    setPartDialogOpen(true)
  }

  const openEditPart = (part: Partida) => {
    setEditingPart(part)
    setSelectedCapId(part.capituloId)
    setPartForm({
      codigo: part.codigo,
      descripcion: part.descripcion,
      unidad: part.unidad,
      precioBase: part.precioBase.toString(),
    })
    setPartDialogOpen(true)
  }

  const handleSavePart = async () => {
    if (!partForm.codigo || !partForm.descripcion || !partForm.unidad) return
    setSaving(true)
    if (editingPart) {
      await actualizarPartida(editingPart.id, {
        descripcion: partForm.descripcion,
        unidad: partForm.unidad,
        precioBase: parseFloat(partForm.precioBase) || 0,
      })
    } else {
      await crearPartida(selectedCapId, {
        codigo: `${capitulos.find(c => c.id === selectedCapId)?.codigo || ""}.${partForm.codigo}`,
        descripcion: partForm.descripcion,
        unidad: partForm.unidad,
        precioBase: parseFloat(partForm.precioBase) || 0,
      })
    }
    setSaving(false)
    setPartDialogOpen(false)
  }

  const handleDeletePartida = async () => {
    if (!deleteId) return
    await eliminarPartida(deleteId)
    setDeleteId(null)
  }

  // ====== PARÁMETROS FINANCIEROS ======
  const handleSaveParametros = async () => {
    await actualizarParametros({
      porcentajeBI: parseFloat(biValue) || 10,
      porcentajeIVA: parseFloat(ivaValue) || 21,
    })
  }

  // ====== IMPORTAR DESDE CALCULADORAS DEL PROYECTO ======
  const openImportDialog = async () => {
    setImportOpen(true)
    setImportSelected(new Set())
    setImportLoading(true)
    try {
      const res = await fetch(`/api/proyectos/${proyectoId}/elementos`)
      const elementos = await res.json()
      setImportItems(Array.isArray(elementos) ? elementos.map((e: any) => ({
        id: e.id,
        tipoElemento: e.tipoElemento,
        descripcion: e.descripcion,
        cantidad: e.cantidad,
        costoTotal: e.costoTotal,
      })) : [])
    } catch {
      setImportItems([])
    }
    setImportLoading(false)
  }

  const toggleImportItem = (id: string) => {
    setImportSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (importSelected.size === importItems.length) {
      setImportSelected(new Set())
    } else {
      setImportSelected(new Set(importItems.map(i => i.id)))
    }
  }

  const handleImport = async () => {
    if (importSelected.size === 0) return
    setImporting(true)

    try {
      const res = await fetch(`/api/proyectos/${proyectoId}/importar-elementos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elementoIds: Array.from(importSelected), crearCapitulos: true }),
      })
      const data = await res.json()
      if (data.ok) {
        alert(`Importación exitosa: ${data.partidasCreadas} partidas en ${data.capitulosCreados} capítulos`)
        setImportOpen(false)
        await cargarDatos()
      } else {
        alert("Error: " + (data.error || "Error desconocido"))
      }
    } catch {
      alert("Error de conexión al importar")
    }
    setImporting(false)
  }

  const tipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      CONCRETO: "bg-blue-100 text-blue-800",
      COLUMNA: "bg-purple-100 text-purple-800",
      VIGA: "bg-indigo-100 text-indigo-800",
      LOSA: "bg-cyan-100 text-cyan-800",
      CIMIENTO: "bg-amber-100 text-amber-800",
      MURO: "bg-green-100 text-green-800",
      PARED: "bg-green-100 text-green-800",
      PARED_CONCRETO: "bg-green-100 text-green-800",
      PARED_DRYWALL: "bg-teal-100 text-teal-800",
      PISO: "bg-rose-100 text-rose-800",
      ZOCALO: "bg-pink-100 text-pink-800",
      TECHO: "bg-orange-100 text-orange-800",
      CIELO: "bg-yellow-100 text-yellow-800",
      PINTURA: "bg-red-100 text-red-800",
    }
    return colors[tipo] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Catálogo de Capítulos y Partidas</h2>
          <p className="text-sm text-muted-foreground">
            {capitulos.length} capítulos • {capitulos.reduce((sum, c) => sum + c.partidas.length, 0)} partidas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={expandAll}>
            {expandedCaps.size === capitulos.length ? "Colapsar todo" : "Expandir todo"}
          </Button>
          <Button variant="outline" onClick={openImportDialog}>
            <Download className="mr-2 h-4 w-4" />
            Importar del Proyecto
          </Button>
          <Button onClick={openCreateCap}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Capítulo
          </Button>
        </div>
      </div>

      {/* Parámetros financieros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Parámetros Financieros Globales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Beneficio Industrial (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={biValue}
                onChange={e => setBiValue(e.target.value)}
                onBlur={handleSaveParametros}
                className="w-24"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">IVA (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={ivaValue}
                onChange={e => setIvaValue(e.target.value)}
                onBlur={handleSaveParametros}
                className="w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de capítulos */}
      {capitulos.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-12 w-12" />}
          title="No hay capítulos"
          description="Crea el primer capítulo para comenzar a definir el presupuesto"
          action={
            <Button onClick={openCreateCap}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Capítulo
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {capitulos.map(cap => (
            <Card key={cap.id} className="overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpand(cap.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
                {expandedCaps.has(cap.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-mono text-sm font-medium text-muted-foreground w-8">
                  {cap.codigo}
                </span>
                <span className="font-medium flex-1">{cap.nombre}</span>
                <span className="text-sm text-muted-foreground">
                  {cap.partidas.length} partidas
                </span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCap(cap)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDeleteId(cap.id); setDeleteType("capitulo") }}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>

              {expandedCaps.has(cap.id) && (
                <div className="border-t">
                  {cap.partidas.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No hay partidas en este capítulo.
                      <Button variant="link" size="sm" onClick={() => openCreatePart(cap.id)} className="ml-2">
                        Agregar partida
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-20">Código</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="w-20">Unidad</TableHead>
                          <TableHead className="w-28 text-right">Precio Base</TableHead>
                          <TableHead className="w-20 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cap.partidas.map(part => (
                          <TableRow key={part.id}>
                            <TableCell className="font-mono text-sm">{part.codigo}</TableCell>
                            <TableCell>{part.descripcion}</TableCell>
                            <TableCell>{part.unidad}</TableCell>
                            <TableCell className="text-right">{part.precioBase.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditPart(part)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDeleteId(part.id); setDeleteType("partida") }}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <div className="px-4 py-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => openCreatePart(cap.id)}>
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      Agregar Partida
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Capítulo */}
      <Dialog open={capDialogOpen} onOpenChange={setCapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCap ? "Editar Capítulo" : "Nuevo Capítulo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={capForm.codigo}
                onChange={e => setCapForm({ ...capForm, codigo: e.target.value })}
                placeholder="1"
                disabled={!!editingCap}
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={capForm.nombre}
                onChange={e => setCapForm({ ...capForm, nombre: e.target.value })}
                placeholder="Ej: DEMOLICIONES"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={capForm.descripcion}
                onChange={e => setCapForm({ ...capForm, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCapDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveCap} disabled={saving || !capForm.codigo || !capForm.nombre}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCap ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Partida */}
      <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPart ? "Editar Partida" : "Nueva Partida"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-mono">
                  {capitulos.find(c => c.id === selectedCapId)?.codigo || "?"}.
                </span>
                <Input
                  value={partForm.codigo}
                  onChange={e => setPartForm({ ...partForm, codigo: e.target.value })}
                  placeholder="1"
                  disabled={!!editingPart}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Input
                value={partForm.descripcion}
                onChange={e => setPartForm({ ...partForm, descripcion: e.target.value })}
                placeholder="Descripción de la partida"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unidad *</Label>
                <Select value={partForm.unidad} onValueChange={v => setPartForm({ ...partForm, unidad: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Precio Unitario Base</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={partForm.precioBase}
                  onChange={e => setPartForm({ ...partForm, precioBase: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPartDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSavePart} disabled={saving || !partForm.codigo || !partForm.descripcion}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPart ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => { if (!open) setDeleteId(null) }}
        title={deleteType === "capitulo" ? "¿Eliminar capítulo?" : "¿Eliminar partida?"}
        description="Esta acción no se puede deshacer. Se eliminarán también las mediciones asociadas."
        onConfirm={deleteType === "capitulo" ? handleDeleteCapitulo : handleDeletePartida}
        confirmText="Eliminar"
      />

      {/* Dialog Importar desde Calculadoras del Proyecto */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Importar Elementos del Proyecto</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona los elementos calculados en las calculadoras para crear capítulos y partidas automáticamente
            </p>
          </DialogHeader>

          {/* Contenido */}
          <div className="flex-1 overflow-auto min-h-0">
            {importLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : importItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No hay elementos calculados en el proyecto.</p>
                <p className="text-xs mt-1">Usa las calculadoras primero para crear elementos.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b mb-3">
                  <span className="text-sm text-muted-foreground">
                    {importItems.length} elementos disponibles • {importSelected.size} seleccionados
                  </span>
                  <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                    {importSelected.size === importItems.length ? "Deseleccionar todo" : "Seleccionar todo"}
                  </Button>
                </div>

                <div className="space-y-2">
                  {importItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        importSelected.has(item.id) ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleImportItem(item.id)}
                    >
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                        {importSelected.has(item.id)
                          ? <CheckSquare className="h-4 w-4 text-primary" />
                          : <Square className="h-4 w-4" />
                        }
                      </Button>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColor(item.tipoElemento)}`}>
                        {item.tipoElemento}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.descripcion}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.cantidad} uds</span>
                      <span className="text-sm font-medium whitespace-nowrap">{formatCurrency(item.costoTotal)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              Los elementos se agruparán por tipo en capítulos automáticos
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportOpen(false)}>Cancelar</Button>
              <Button onClick={handleImport} disabled={importSelected.size === 0 || importing}>
                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Importar {importSelected.size} elementos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
