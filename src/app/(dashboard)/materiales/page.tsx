"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchInput } from "@/components/shared/SearchInput"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Box, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Material {
  id: string
  codigo: string
  nombre: string
  unidad: string
  precio: number
  grupo: string
  subcategoria?: string
  proveedor?: string
  workspaceId?: string | null
  isCustomPrice?: boolean
  isWorkspaceMaterial?: boolean
}

const emptyForm = { codigo: "", nombre: "", unidad: "kg", precio: "", grupo: "CEMENTO", subcategoria: "", proveedor: "" }

export default function MaterialesPage() {
  const [search, setSearch] = useState("")
  const [grupoFilter, setGrupoFilter] = useState("TODOS")
  const [subcategoriaFilter, setSubcategoriaFilter] = useState("TODAS")
  const [materiales, setMateriales] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchMateriales()
  }, [])

  async function fetchMateriales() {
    try {
      const res = await fetch("/api/materiales")
      if (res.ok) {
        const data = await res.json()
        setMateriales(Array.isArray(data) ? data : [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(m: Material) {
    setEditingId(m.id)
    setForm({
      codigo: m.codigo,
      nombre: m.nombre,
      unidad: m.unidad,
      precio: m.precio.toString(),
      grupo: m.grupo,
      subcategoria: m.subcategoria || "",
      proveedor: m.proveedor || "",
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.codigo || !form.nombre || !form.precio) return
    setSaving(true)
    try {
      const body = {
        ...form,
        precio: parseFloat(form.precio),
      }
      const url = editingId ? `/api/materiales/${editingId}` : "/api/materiales"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setDialogOpen(false)
        fetchMateriales()
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

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/materiales/${deleteId}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteId(null)
        fetchMateriales()
      }
    } catch {
      alert("Error al eliminar")
    } finally {
      setDeleting(false)
    }
  }

  const grupos = ["TODOS", ...Array.from(new Set(materiales.map(m => m.grupo)))]
  const subcategorias = ["TODAS", ...Array.from(new Set(materiales.map(m => m.subcategoria).filter(Boolean) as string[]))]

  const filtered = materiales.filter(m => {
    const matchSearch = m.nombre.toLowerCase().includes(search.toLowerCase()) || m.codigo.toLowerCase().includes(search.toLowerCase())
    const matchGrupo = grupoFilter === "TODOS" || m.grupo === grupoFilter
    const matchSubcategoria = subcategoriaFilter === "TODAS" || m.subcategoria === subcategoriaFilter
    return matchSearch && matchGrupo && matchSubcategoria
  })

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
        title="Catálogo de Materiales"
        description="Gestión de materiales y precios de referencia"
        icon={<Box className="h-7 w-7 text-primary" />}
        actions={
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Link href="/materiales/precios" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Ver Banco de Precios</Button>
            </Link>
            <Button onClick={openCreate} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Nuevo Material</Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Materiales ({filtered.length})</CardTitle>
          <SearchInput value={search} onChange={setSearch} className="w-full sm:w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {grupos.map(g => (
              <button
                key={g}
                onClick={() => setGrupoFilter(g)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${grupoFilter === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                {g}
              </button>
            ))}
          </div>
          {subcategorias.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {subcategorias.map(s => (
                <button
                  key={s}
                  onClick={() => setSubcategoriaFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${subcategoriaFilter === s ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Box className="h-12 w-12" />}
              title="No hay materiales"
              description="Agrega materiales al catálogo"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Subcategoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono">
                        <div className="flex flex-col gap-1">
                          <span>{m.codigo}</span>
                          <span className="text-[10px]">
                            {m.isWorkspaceMaterial ? (
                              <span className="text-cyan-400 font-semibold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/30">Equipo</span>
                            ) : (
                              <span className="text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800/40">Global</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{m.nombre}</TableCell>
                      <TableCell>{m.unidad}</TableCell>
                      <TableCell><span className="px-2 py-1 rounded-full text-xs bg-muted">{m.grupo}</span></TableCell>
                      <TableCell><span className="px-2 py-1 rounded-full text-xs bg-muted">{m.subcategoria || '-'}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-semibold">{formatCurrency(m.precio)}</span>
                          {m.isCustomPrice && (
                            <span className="text-[10px] text-green-400 font-medium bg-green-950/30 px-1.5 py-0.2 rounded border border-green-900/20">Precios Equipo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {m.isWorkspaceMaterial ? (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled className="opacity-30 cursor-not-allowed">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Material" : "Nuevo Material"}</DialogTitle>
            {editingId && !form.codigo.startsWith("W_") && (
              <CardDescription className="text-amber-400 bg-amber-950/20 p-2.5 rounded border border-amber-900/30 text-xs mt-2">
                ⚠️ Nota: Este es un material de referencia global. Al modificar su precio, se creará un precio personalizado únicamente para tu Espacio de Trabajo, protegiendo los datos de otros usuarios.
              </CardDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="M-001" />
              </div>
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Cemento CP-40" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select value={form.unidad} onValueChange={v => setForm({...form, unidad: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["kg","m³","m²","ml","lt","bolsa","pza","lote","rolling","hoja"].map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Precio Unitario (Bs.) *</Label>
                <Input type="number" step="0.01" min="0" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select value={form.grupo} onValueChange={v => setForm({...form, grupo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["TODOS","CEMENTO","AGREGADOS","ACERO","BLOQUE","CERAMICA","TEJA","MADERA","PINTURA","ADHESIVO","BOQUILLA","BOVEDILLA","AGUA","DRYWALL","LAMINA","LADRILLO","PORCELANATO","OTROS"].map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategoría</Label>
                <Input value={form.subcategoria} onChange={e => setForm({...form, subcategoria: e.target.value})} placeholder="Opcional" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input value={form.proveedor} onChange={e => setForm({...form, proveedor: e.target.value})} placeholder="Opcional" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !form.codigo || !form.nombre || !form.precio}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="¿Eliminar material?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
      />
    </div>
  )
}
