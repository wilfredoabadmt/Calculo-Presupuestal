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

  // Importación del banco de precios
  const [importOpen, setImportOpen] = useState(false)
  const [importSearch, setImportSearch] = useState("")
  const [importCategoria, setImportCategoria] = useState("ALL")
  const [importItems, setImportItems] = useState<{ id: string; codigo: string; actividad: string; unidad: string; precioUnitario: number; categoria: string }[]>([])
  const [importSelected, setImportSelected] = useState<Set<string>>(new Set())
  const [importLoading, setImportLoading] = useState(false)
  const [importCategorias, setImportCategorias] = useState<{ nombre: string; count: number }[]>([])
  const [importPage, setImportPage] = useState(1)
  const [importTotal, setImportTotal] = useState(0)
  const [importTargetCap, setImportTargetCap] = useState<string>("NEW")
  const [importNewCapName, setImportNewCapName] = useState("")
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

  // ====== IMPORTAR DEL BANCO DE PRECIOS ======
  const openImportDialog = async () => {
    setImportOpen(true)
    setImportSearch("")
    setImportCategoria("ALL")
    setImportSelected(new Set())
    setImportPage(1)
    setImportTargetCap("NEW")
    setImportNewCapName("")
    await loadBancoCategorias()
    await loadBancoItems()
  }

  const loadBancoCategorias = async () => {
    try {
      const res = await fetch("/api/banco-precios?categorias=true")
      const data = await res.json()
      setImportCategorias(data.categorias || [])
    } catch {
      setImportCategorias([])
    }
  }

  const loadBancoItems = async (page = 1, search = "", categoria = "") => {
    setImportLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "30" })
      if (search) params.set("search", search)
      if (categoria && categoria !== "ALL") params.set("categoria", categoria)
      const res = await fetch(`/api/banco-precios?${params}`)
      const data = await res.json()
      setImportItems(data.items || [])
      setImportTotal(data.total || 0)
      setImportPage(data.page || 1)
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

    const items = Array.from(importSelected).map(id => {
      const item = importItems.find(i => i.id === id)
      const cap = importTargetCap === "NEW" ? null : capitulos.find(c => c.id === importTargetCap)
      return {
        bancoPrecioId: id,
        capituloId: cap?.id || undefined,
        capituloNombre: importTargetCap === "NEW" ? (importNewCapName || item?.categoria || "SIN NOMBRE") : undefined,
        capituloCodigo: importTargetCap === "NEW" ? (capitulos.length > 0 ? Math.max(...capitulos.map(c => c.codigo)) + 1 : 1) : undefined,
      }
    })

    try {
      const res = await fetch(`/api/proyectos/${proyectoId}/importar-banco`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, crearCapitulos: true }),
      })
      const data = await res.json()
      if (data.ok) {
        alert(`Importación exitosa: ${data.partidasCreadas} partidas en ${data.capitulosCreados} capítulos nuevos`)
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
            Importar Banco
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

      {/* Dialog Importar Banco de Precios */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Importar del Banco de Precios</DialogTitle>
          </DialogHeader>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 pb-3 border-b">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar actividad..."
                value={importSearch}
                onChange={e => setImportSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") loadBancoItems(1, importSearch, importCategoria) }}
                className="pl-9"
              />
            </div>
            <Select value={importCategoria} onValueChange={v => { setImportCategoria(v); loadBancoItems(1, importSearch, v) }}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las categorías</SelectItem>
                {importCategorias.map(c => (
                  <SelectItem key={c.nombre} value={c.nombre}>
                    {c.nombre} ({c.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => loadBancoItems(1, importSearch, importCategoria)}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>

          {/* Destino de importación */}
          <div className="flex flex-wrap items-center gap-3 py-3 border-b bg-muted/30 px-3 rounded">
            <span className="text-sm font-medium">Importar a:</span>
            <Select value={importTargetCap} onValueChange={setImportTargetCap}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">+ Crear capítulo nuevo</SelectItem>
                {capitulos.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    Cap. {c.codigo} - {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {importTargetCap === "NEW" && (
              <Input
                placeholder="Nombre del nuevo capítulo"
                value={importNewCapName}
                onChange={e => setImportNewCapName(e.target.value)}
                className="w-56"
              />
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {importSelected.size} items seleccionados
            </span>
          </div>

          {/* Tabla de resultados */}
          <div className="flex-1 overflow-auto min-h-0">
            {importLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : importItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron items en el banco de precios
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-10">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleSelectAll}>
                        {importSelected.size === importItems.length && importItems.length > 0
                          ? <CheckSquare className="h-4 w-4" />
                          : <Square className="h-4 w-4" />
                        }
                      </Button>
                    </TableHead>
                    <TableHead className="w-20">Código</TableHead>
                    <TableHead>Actividad / Descripción</TableHead>
                    <TableHead className="w-16">UD</TableHead>
                    <TableHead className="w-28 text-right">Precio Unit.</TableHead>
                    <TableHead className="w-32">Categoría</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importItems.map(item => (
                    <TableRow
                      key={item.id}
                      className={`cursor-pointer ${importSelected.has(item.id) ? "bg-primary/5" : ""}`}
                      onClick={() => toggleImportItem(item.id)}
                    >
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); toggleImportItem(item.id) }}>
                          {importSelected.has(item.id)
                            ? <CheckSquare className="h-4 w-4 text-primary" />
                            : <Square className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                      <TableCell className="text-sm">{item.actividad}</TableCell>
                      <TableCell className="text-xs">{item.unidad}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{item.precioUnitario.toFixed(2)} Bs.</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.categoria}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Paginación y acciones */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              Total: {importTotal} items | Página {importPage}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportOpen(false)}>Cancelar</Button>
              <Button variant="outline" disabled={importPage <= 1} onClick={() => loadBancoItems(importPage - 1, importSearch, importCategoria)}>
                Anterior
              </Button>
              <Button variant="outline" onClick={() => loadBancoItems(importPage + 1, importSearch, importCategoria)}>
                Siguiente
              </Button>
              <Button onClick={handleImport} disabled={importSelected.size === 0 || importing}>
                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Importar {importSelected.size} items
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
