"use client"

import { useState, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchInput } from "@/components/shared/SearchInput"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Upload, Download, Eye, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { AnalisisPrecioUnitario } from "@/components/presupuesto/AnalisisPrecioUnitario"

interface BancoPrecio {
  id: string
  codigo: string | null
  actividad: string
  unidad: string
  categoria: string
  subcategoria: string | null
  precioUnitario: number
  materiales: string | null
  manoObra: string | null
  beneficiosSociales: number
  iva: number
  equipoMaquinaria: number
  gastosGenerales: number
  utilidad: number
  it: number
}

const emptyForm = {
  codigo: "",
  actividad: "",
  unidad: "m2",
  categoria: "GENERALES",
  subcategoria: "",
  precioUnitario: 0,
  beneficiosSociales: 71.18,
  iva: 14.94,
  equipoMaquinaria: 5,
  gastosGenerales: 11,
  utilidad: 7,
  it: 3.09,
  materiales: [] as any[],
  manoObra: [] as any[]
}

export default function BancoPreciosPage() {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("TODAS")
  const [items, setItems] = useState<BancoPrecio[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modals state
  const [previewItem, setPreviewItem] = useState<BancoPrecio | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      setExporting(true)
      const res = await fetch("/api/banco-precios?all=true")
      if (!res.ok) throw new Error("Error al obtener los precios")
      const data = await res.json()
      const exportData = (data.items || []).map((i: any) => ({
        "Código": i.codigo || i.id.slice(0, 8).toUpperCase(),
        "Actividad": i.actividad,
        "Unidad": i.unidad,
        "Categoría": i.categoria,
        "Subcategoría": i.subcategoria || "",
        "P.U. Referencial (Bs.)": i.precioUnitario,
        "Beneficios Sociales (%)": i.beneficiosSociales,
        "IVA (%)": i.iva,
        "Herramientas/Maquinaria (%)": i.equipoMaquinaria,
        "Gastos Generales (%)": i.gastosGenerales,
        "Utilidad (%)": i.utilidad,
        "IT (%)": i.it,
      }))
      
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Banco de Precios")
      XLSX.writeFile(wb, `Banco_de_Precios_Referenciales_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (err: any) {
      console.error("Error al exportar:", err)
      alert("Error al exportar el banco de precios: " + err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json<any>(sheet)

        const parsedItems = rows.map((row: any) => {
          const getVal = (keys: string[], fallback: any = null) => {
            for (const k of Object.keys(row)) {
              if (keys.some(key => k.toLowerCase().trim() === key.toLowerCase())) {
                return row[k]
              }
            }
            return fallback
          }

          const codigo = getVal(["Código", "Codigo", "code", "código"])
          const actividad = getVal(["Actividad", "Nombre", "Descripción", "Descripcion", "activity", "item", "actividad"])
          const unidad = getVal(["Unidad", "Und", "unit", "u", "unidad"], "ud")
          const categoria = getVal(["Categoría", "Categoria", "category", "categoría"], "GENERALES")
          const subcategoria = getVal(["Subcategoría", "Subcategoria", "subcategory", "subcategoría"])
          const precioUnitario = parseFloat(getVal(["P.U. Referencial (Bs.)", "Precio Unitario", "Precio", "price", "precio"])) || 0

          return {
            codigo: codigo ? String(codigo) : undefined,
            actividad: actividad ? String(actividad) : undefined,
            unidad: String(unidad),
            categoria: String(categoria).toUpperCase(),
            subcategoria: subcategoria ? String(subcategoria) : undefined,
            precioUnitario,
            beneficiosSociales: parseFloat(getVal(["Beneficios Sociales (%)", "Cargas Sociales", "social", "beneficios sociales"])) ?? 71.18,
            iva: parseFloat(getVal(["IVA (%)", "iva", "Iva"])) ?? 14.94,
            equipoMaquinaria: parseFloat(getVal(["Herramientas/Maquinaria (%)", "Equipo", "tools", "maquinaria"])) ?? 5,
            gastosGenerales: parseFloat(getVal(["Gastos Generales (%)", "gastos", "gastos generales"])) ?? 11,
            utilidad: parseFloat(getVal(["Utilidad (%)", "utilidad"])) ?? 7,
            it: parseFloat(getVal(["IT (%)", "it", "It"])) ?? 3.09,
          }
        }).filter(item => item.actividad && item.unidad)

        if (parsedItems.length === 0) {
          alert("No se encontraron ítems válidos en el archivo Excel. Asegúrate de tener columnas para 'Actividad' y 'Unidad'.")
          setImporting(false)
          return
        }

        const response = await fetch("/api/banco-precios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedItems)
        })

        if (!response.ok) {
          throw new Error("Error en el servidor al importar los datos")
        }

        const resData = await response.json()
        alert(`Se importaron/actualizaron ${resData.count} ítems del banco de precios con éxito.`)
        
        // Trigger reload
        setSearch("")
        setCatFilter("TODAS")
        setPage(1)
        setLoading(true)
        const catQuery = ""
        fetch(`/api/banco-precios?search=&categoria=${catQuery}&page=1&limit=50`)
          .then(r => r.json())
          .then(data => {
            setItems(Array.isArray(data.items) ? data.items : [])
            setTotalPages(data.totalPages || 1)
            setTotal(data.total || 0)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      } catch (err: any) {
        console.error("Error al importar Excel:", err)
        alert("Ocurrió un error al procesar el archivo Excel: " + err.message)
      } finally {
        setImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsBinaryString(file)
  }

  // Fetch categorized items
  useEffect(() => {
    setLoading(true)
    const catQuery = catFilter === "TODAS" ? "" : catFilter
    fetch(`/api/banco-precios?search=${encodeURIComponent(search)}&categoria=${catQuery}&page=${page}&limit=50`)
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, catFilter, page])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleCatChange = (cat: string) => {
    setCatFilter(cat)
    setPage(1)
  }

  const parseJSON = (str: string | null, fallback: any = []) => {
    if (!str) return fallback
    try {
      return JSON.parse(str)
    } catch {
      return fallback
    }
  }

  // Live calculation of unit price based on coefficients
  const getLivePriceUnitario = (formData: typeof emptyForm) => {
    const subtotalMat = formData.materiales.reduce((sum, m) => sum + (parseFloat(m.cantidad) * parseFloat(m.precioUnitario) || 0), 0)
    const subtotalMO = formData.manoObra.reduce((sum, l) => sum + (parseFloat(l.cantidad) * parseFloat(l.precioUnitario) || 0), 0)
    const cargas = subtotalMO * (parseFloat(formData.beneficiosSociales as any) / 100 || 0)
    const equipo = subtotalMO * (parseFloat(formData.equipoMaquinaria as any) / 100 || 0)
    const base = subtotalMat + subtotalMO + cargas + equipo
    const gastos = base * (parseFloat(formData.gastosGenerales as any) / 100 || 0)
    const util = (base + gastos) * (parseFloat(formData.utilidad as any) / 100 || 0)
    const impuestoIT = (base + gastos + util) * (parseFloat(formData.it as any) / 100 || 0)
    return base + gastos + util + impuestoIT
  }

  const isComputed = form.materiales.length > 0 || form.manoObra.length > 0
  const currentPU = isComputed ? getLivePriceUnitario(form) : form.precioUnitario

  // Actions
  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setEditorOpen(true)
  }

  const openEdit = (item: BancoPrecio) => {
    setEditingId(item.id)
    setForm({
      codigo: item.codigo || "",
      actividad: item.actividad,
      unidad: item.unidad,
      categoria: item.categoria,
      subcategoria: item.subcategoria || "",
      precioUnitario: item.precioUnitario,
      beneficiosSociales: item.beneficiosSociales,
      iva: item.iva,
      equipoMaquinaria: item.equipoMaquinaria,
      gastosGenerales: item.gastosGenerales,
      utilidad: item.utilidad,
      it: item.it,
      materiales: parseJSON(item.materiales),
      manoObra: parseJSON(item.manoObra),
    })
    setEditorOpen(true)
  }

  const handleSave = async () => {
    if (!form.actividad || !form.unidad) return
    setSaving(true)
    try {
      const finalPrice = isComputed ? getLivePriceUnitario(form) : form.precioUnitario
      const payload = {
        ...form,
        precioUnitario: finalPrice,
      }
      const url = editingId ? `/api/banco-precios/${editingId}` : "/api/banco-precios"
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setEditorOpen(false)
        // Refresh list
        setPage(1)
        const updated = await fetch(`/api/banco-precios?search=${encodeURIComponent(search)}&categoria=${catFilter === "TODAS" ? "" : catFilter}&page=${page}&limit=50`).then(r => r.json())
        setItems(updated.items || [])
        setTotal(updated.total || 0)
      } else {
        const err = await res.json()
        alert(err.error || "Error al guardar")
      }
    } catch {
      alert("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/banco-precios/${deleteId}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteId(null)
        // Refresh
        setPage(1)
        const updated = await fetch(`/api/banco-precios?search=${encodeURIComponent(search)}&categoria=${catFilter === "TODAS" ? "" : catFilter}&page=1&limit=50`).then(r => r.json())
        setItems(updated.items || [])
        setTotal(updated.total || 0)
      }
    } catch {
      alert("Error al eliminar")
    } finally {
      setDeleting(false)
    }
  }

  const addMaterialRow = () => {
    setForm(f => ({
      ...f,
      materiales: [...f.materiales, { nombre: "", unidad: "kg", cantidad: 1, precioUnitario: 0, costoTotal: 0 }]
    }))
  }

  const handleMaterialChange = (index: number, key: string, val: any) => {
    setForm(f => {
      const newMats = [...f.materiales]
      newMats[index] = { ...newMats[index], [key]: val }
      if (key === "cantidad" || key === "precioUnitario") {
        const qty = parseFloat(newMats[index].cantidad) || 0
        const price = parseFloat(newMats[index].precioUnitario) || 0
        newMats[index].costoTotal = qty * price
      }
      return { ...f, materiales: newMats }
    })
  }

  const removeMaterialRow = (index: number) => {
    setForm(f => ({
      ...f,
      materiales: f.materiales.filter((_, i) => i !== index)
    }))
  }

  const addLaborRow = () => {
    setForm(f => ({
      ...f,
      manoObra: [...f.manoObra, { oficio: "", unidad: "hr", cantidad: 1, precioUnitario: 0, costoTotal: 0 }]
    }))
  }

  const handleLaborChange = (index: number, key: string, val: any) => {
    setForm(f => {
      const newMO = [...f.manoObra]
      newMO[index] = { ...newMO[index], [key]: val }
      if (key === "cantidad" || key === "precioUnitario") {
        const qty = parseFloat(newMO[index].cantidad) || 0
        const price = parseFloat(newMO[index].precioUnitario) || 0
        newMO[index].costoTotal = qty * price
      }
      return { ...f, manoObra: newMO }
    })
  }

  const removeLaborRow = (index: number) => {
    setForm(f => ({
      ...f,
      manoObra: f.manoObra.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportExcel} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />
      <PageHeader
        title="Banco de Precios Referenciales"
        description="Base de precios unitarios de referencia"
        icon={<DollarSign className="h-7 w-7 text-primary" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Exportar
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Importar Excel
            </Button>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nuevo Ítem</Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ítems del Banco de Precios ({total})</CardTitle>
          <SearchInput value={search} onChange={handleSearchChange} className="w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["TODAS", "GENERALES", "ESTRUCTURAS", "HIDRAULICA", "VIAS_URBANAS"].map(c => (
              <button
                key={c}
                onClick={() => handleCatChange(c)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${catFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-12 w-12" />}
              title="Banco de precios vacío"
              description="No se encontraron ítems o debes importar la base de precios desde un archivo Excel"
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Subcategoría</TableHead>
                      <TableHead className="text-right">P.U.</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.codigo || "-"}</TableCell>
                        <TableCell className="font-medium max-w-xs md:max-w-md truncate" title={item.actividad}>
                          {item.actividad}
                        </TableCell>
                        <TableCell>{item.unidad}</TableCell>
                        <TableCell><span className="px-2 py-1 rounded-full text-xs bg-muted">{item.categoria}</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.subcategoria || "-"}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.precioUnitario)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setPreviewItem(item)} title="Previsualizar APU">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Editar ítem">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} title="Eliminar ítem" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-2 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando ítems {((page - 1) * 50) + 1} - {Math.min(page * 50, total)} de {total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm font-medium py-1 px-2 bg-muted rounded">
                    Pág. {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => { if (!open) setPreviewItem(null) }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {previewItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-6 border-b pb-3">
                  <div className="space-y-1">
                    <span className="font-mono text-sm text-muted-foreground">Código: {previewItem.codigo || "S/C"}</span>
                    <h3 className="text-lg font-bold leading-tight text-foreground">{previewItem.actividad}</h3>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/40 rounded-lg text-sm">
                  <div><span className="text-muted-foreground">Unidad:</span> <strong className="block">{previewItem.unidad}</strong></div>
                  <div><span className="text-muted-foreground">Categoría:</span> <strong className="block">{previewItem.categoria}</strong></div>
                  <div><span className="text-muted-foreground">Subcategoría:</span> <strong className="block">{previewItem.subcategoria || "-"}</strong></div>
                  <div><span className="text-muted-foreground">Precio Unitario:</span> <strong className="block text-primary text-base">{formatCurrency(previewItem.precioUnitario)}</strong></div>
                </div>

                <AnalisisPrecioUnitario
                  materiales={parseJSON(previewItem.materiales).map((m: any, idx: number) => ({
                    codigo: m.codigo || `MAT-${idx + 1}`,
                    descripcion: m.nombre || m.descripcion || "",
                    unidad: m.unidad || "",
                    cantidad: m.cantidad || 0,
                    precio: m.precioUnitario || m.precio || 0,
                    total: m.costoTotal || m.total || 0,
                  }))}
                  manoObra={parseJSON(previewItem.manoObra).map((l: any) => ({
                    profesion: l.oficio || l.profesion || "",
                    horas: l.cantidad || l.horas || 0,
                    tarifaHora: l.precioUnitario || l.tarifaHora || 0,
                    total: l.costoTotal || l.total || 0,
                  }))}
                  cargasSociales={previewItem.beneficiosSociales}
                  iva={previewItem.iva}
                  equipoMaquinaria={previewItem.equipoMaquinaria}
                  gastosGenerales={previewItem.gastosGenerales}
                  utilidad={previewItem.utilidad}
                  it={previewItem.it}
                />
              </div>

              <DialogFooter>
                <Button onClick={() => setPreviewItem(null)}>Cerrar Previsualización</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Ítem del Banco" : "Crear Nuevo Ítem en el Banco"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="generales" className="flex-1 flex flex-col min-h-0 py-4">
            <TabsList className="grid grid-cols-2 w-72 mb-4">
              <TabsTrigger value="generales">Datos Generales</TabsTrigger>
              <TabsTrigger value="recursos">Recursos (APU)</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <TabsContent value="generales" className="space-y-4 pt-1">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código *</Label>
                    <Input id="codigo" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="Ej: DEM-001" />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-2">
                    <Label htmlFor="actividad">Actividad / Descripción *</Label>
                    <Input id="actividad" value={form.actividad} onChange={e => setForm({...form, actividad: e.target.value})} placeholder="Descripción completa del ítem" />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="unidad">Unidad *</Label>
                    <Input id="unidad" value={form.unidad} onChange={e => setForm({...form, unidad: e.target.value})} placeholder="Ej: m2, m3, ml, pza" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={form.categoria} onValueChange={v => setForm({...form, categoria: v})}>
                      <SelectTrigger id="categoria"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["GENERALES", "ESTRUCTURAS", "HIDRAULICA", "VIAS_URBANAS"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategoria">Subcategoría</Label>
                    <Input id="subcategoria" value={form.subcategoria} onChange={e => setForm({...form, subcategoria: e.target.value})} placeholder="Ej: Obra Gruesa, Pinturas" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-sm mb-3">Coeficientes de Costo (%)</h4>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="beneficiosSociales">Cargas/Beneficios Sociales (%)</Label>
                      <Input id="beneficiosSociales" type="number" step="0.01" value={form.beneficiosSociales} onChange={e => setForm({...form, beneficiosSociales: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iva">IVA (%)</Label>
                      <Input id="iva" type="number" step="0.01" value={form.iva} onChange={e => setForm({...form, iva: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipoMaquinaria">Herramienta Menor / Equipo (%)</Label>
                      <Input id="equipoMaquinaria" type="number" step="0.01" value={form.equipoMaquinaria} onChange={e => setForm({...form, equipoMaquinaria: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gastosGenerales">Gastos Generales (%)</Label>
                      <Input id="gastosGenerales" type="number" step="0.01" value={form.gastosGenerales} onChange={e => setForm({...form, gastosGenerales: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utilidad">Utilidad (%)</Label>
                      <Input id="utilidad" type="number" step="0.01" value={form.utilidad} onChange={e => setForm({...form, utilidad: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="it">Impuestos IT (%)</Label>
                      <Input id="it" type="number" step="0.01" value={form.it} onChange={e => setForm({...form, it: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                </div>

                {!isComputed && (
                  <div className="border-t pt-4 space-y-2">
                    <Label htmlFor="precioUnitario" className="text-primary font-bold">Precio Unitario Base (Bs.)</Label>
                    <Input id="precioUnitario" type="number" step="0.01" value={form.precioUnitario} onChange={e => setForm({...form, precioUnitario: parseFloat(e.target.value) || 0})} placeholder="0.00" />
                    <p className="text-xs text-muted-foreground">Si no configuras materiales ni mano de obra, puedes ingresar el precio unitario directamente aquí.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recursos" className="space-y-6 pt-1">
                {/* Materials Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Materiales</h4>
                    <Button type="button" size="sm" onClick={addMaterialRow} variant="outline" className="h-8 gap-1">
                      <Plus className="h-4 w-4" /> Añadir Material
                    </Button>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/2">Descripción Material</TableHead>
                          <TableHead className="w-16">Unidad</TableHead>
                          <TableHead className="text-right w-24">Cantidad</TableHead>
                          <TableHead className="text-right w-28">P. Unitario</TableHead>
                          <TableHead className="text-right w-28">Total</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.materiales.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                              Ningún material añadido. El precio se calculará como precio base simple.
                            </TableCell>
                          </TableRow>
                        ) : (
                          form.materiales.map((m, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="p-2">
                                <Input value={m.nombre} onChange={e => handleMaterialChange(idx, "nombre", e.target.value)} placeholder="Ej: Cemento Gris" className="h-8 text-xs" />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input value={m.unidad} onChange={e => handleMaterialChange(idx, "unidad", e.target.value)} placeholder="kg" className="h-8 text-xs w-16" />
                              </TableCell>
                              <TableCell className="p-2 text-right">
                                <Input type="number" step="any" value={m.cantidad} onChange={e => handleMaterialChange(idx, "cantidad", parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right w-24" />
                              </TableCell>
                              <TableCell className="p-2 text-right">
                                <Input type="number" step="0.01" value={m.precioUnitario} onChange={e => handleMaterialChange(idx, "precioUnitario", parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right w-28" />
                              </TableCell>
                              <TableCell className="p-2 text-right font-medium text-xs">
                                {formatCurrency(m.costoTotal || 0)}
                              </TableCell>
                              <TableCell className="p-2 text-center">
                                <Button variant="ghost" size="icon" onClick={() => removeMaterialRow(idx)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Labor Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Mano de Obra</h4>
                    <Button type="button" size="sm" onClick={addLaborRow} variant="outline" className="h-8 gap-1">
                      <Plus className="h-4 w-4" /> Añadir Obreros
                    </Button>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/2">Oficio / Profesión</TableHead>
                          <TableHead className="w-16">Unidad</TableHead>
                          <TableHead className="text-right w-24">Horas</TableHead>
                          <TableHead className="text-right w-28">Tarifa / Hr</TableHead>
                          <TableHead className="text-right w-28">Total</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.manoObra.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                              Ninguna mano de obra añadida.
                            </TableCell>
                          </TableRow>
                        ) : (
                          form.manoObra.map((l, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="p-2">
                                <Input value={l.oficio} onChange={e => handleLaborChange(idx, "oficio", e.target.value)} placeholder="Ej: Maestro Albañil" className="h-8 text-xs" />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input value={l.unidad} onChange={e => handleLaborChange(idx, "unidad", e.target.value)} placeholder="hr" className="h-8 text-xs w-16" />
                              </TableCell>
                              <TableCell className="p-2 text-right">
                                <Input type="number" step="any" value={l.cantidad} onChange={e => handleLaborChange(idx, "cantidad", parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right w-24" />
                              </TableCell>
                              <TableCell className="p-2 text-right">
                                <Input type="number" step="0.01" value={l.precioUnitario} onChange={e => handleLaborChange(idx, "precioUnitario", parseFloat(e.target.value) || 0)} className="h-8 text-xs text-right w-28" />
                              </TableCell>
                              <TableCell className="p-2 text-right font-medium text-xs">
                                {formatCurrency(l.costoTotal || 0)}
                              </TableCell>
                              <TableCell className="p-2 text-center">
                                <Button variant="ghost" size="icon" onClick={() => removeLaborRow(idx)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Real-time APU totals summary */}
                {isComputed && (
                  <div className="bg-muted/40 p-4 rounded-lg flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p>Subtotal Materiales: <strong>{formatCurrency(form.materiales.reduce((s, m) => s + (m.costoTotal || 0), 0))}</strong></p>
                      <p>Subtotal Mano Obra: <strong>{formatCurrency(form.manoObra.reduce((s, l) => s + (l.costoTotal || 0), 0))}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-xs block">PRECIO UNITARIO CALCULADO</span>
                      <strong className="text-primary text-xl font-extrabold">{formatCurrency(currentPU)}</strong>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="border-t pt-4 mt-auto">
            <div className="flex justify-between w-full items-center">
              <div className="text-sm font-semibold">
                P.U. Final: <span className="text-primary text-base font-bold">{formatCurrency(currentPU)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving || !form.actividad || !form.unidad}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Actualizar Ítem" : "Crear Ítem"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="¿Eliminar ítem del Banco de Precios?"
        description="Esta acción eliminará el ítem de forma permanente de la base de datos de precios de referencia. No afectará a presupuestos existentes de proyectos."
        onConfirm={handleDelete}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
      />
    </div>
  )
}
