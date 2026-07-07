"use client"

import { useState, useRef, useCallback, KeyboardEvent } from "react"
import { usePresupuesto, Capitulo, Medicion } from "@/components/presupuesto/PresupuestoContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { formatCurrency } from "@/lib/utils"
import {
  Plus,
  Trash2,
  Calculator,
  Loader2,
  Ruler,
  Copy,
} from "lucide-react"

interface MedicionFormRow {
  id?: string // medicionId si existe
  capituloId: string
  partidaId: string
  veces: string
  largo: string
  ancho: string
  alto: string
  precioUnitario: string
  calculadoraUsada: string | null
  isDirty?: boolean
}

const emptyRow: MedicionFormRow = {
  capituloId: "",
  partidaId: "",
  veces: "1",
  largo: "",
  ancho: "",
  alto: "",
  precioUnitario: "",
  calculadoraUsada: null,
  isDirty: true,
}

export default function DatosPage() {
  const {
    capitulos,
    mediciones,
    loading,
    crearMedicion,
    actualizarMedicion,
    eliminarMedicion,
    obtenerSubtotalCapitulo,
  } = usePresupuesto()

  const [rows, setRows] = useState<MedicionFormRow[]>([])
  const [editingMedId, setEditingMedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedCapFilter, setSelectedCapFilter] = useState<string>("ALL")
  const tableRef = useRef<HTMLDivElement>(null)

  // Initialize rows: existing mediciones + auto-populate partidas without mediciones
  const initialized = useRef(false)
  if (!initialized.current && capitulos.length > 0 && !loading) {
    const existingPartidaIds = new Set(mediciones.map(m => m.partidaId))

    // Map existing mediciones to rows
    const mapped: MedicionFormRow[] = mediciones.map(m => ({
      id: m.id,
      capituloId: m.partida?.capitulo ? capitulos.find(c => c.codigo === m.partida!.capitulo!.codigo)?.id || "" : "",
      partidaId: m.partidaId,
      veces: m.veces.toString(),
      largo: m.largo.toString(),
      ancho: m.ancho.toString(),
      alto: m.alto.toString(),
      precioUnitario: m.precioUnitario.toString(),
      calculadoraUsada: m.calculadoraUsada,
      isDirty: false,
    }))

    // Auto-add rows for partidas that don't have mediciones yet
    for (const cap of capitulos) {
      for (const part of cap.partidas) {
        if (!existingPartidaIds.has(part.id)) {
          mapped.push({
            capituloId: cap.id,
            partidaId: part.id,
            veces: "1",
            largo: "",
            ancho: "",
            alto: "",
            precioUnitario: part.precioBase.toString(),
            calculadoraUsada: null,
            isDirty: false,
          })
        }
      }
    }

    setRows(mapped)
    initialized.current = true
  }

  // Get filtered capitulos
  const filteredCapitulos = selectedCapFilter === "ALL"
    ? capitulos
    : capitulos.filter(c => c.id === selectedCapFilter)

  const getPartidasForCap = (capId: string) => {
    const cap = capitulos.find(c => c.id === capId)
    return cap?.partidas || []
  }

  const getPartidaPrecio = (capId: string, partidaId: string) => {
    const cap = capitulos.find(c => c.id === capId)
    const part = cap?.partidas.find(p => p.id === partidaId)
    return part?.precioBase || 0
  }

  const calcularParcial = (row: MedicionFormRow) => {
    const v = parseFloat(row.veces) || 0
    const l = parseFloat(row.largo) || 0
    const a = parseFloat(row.ancho) || 0
    const h = parseFloat(row.alto) || 0

    const unit = (capitulos.find(c => c.id === row.capituloId)?.partidas.find(p => p.id === row.partidaId)?.unidad || "").toLowerCase()
    const isDimensioned = ["m³", "m²", "ml", "m3", "m2"].includes(unit)

    if (isDimensioned && l === 0 && a === 0 && h === 0) {
      return 0
    }

    const lVal = l > 0 ? l : 1
    const aVal = a > 0 ? a : 1
    const hVal = h > 0 ? h : 1
    return v * lVal * aVal * hVal
  }

  const calcularTotal = (row: MedicionFormRow) => {
    return calcularParcial(row) * (parseFloat(row.precioUnitario) || 0)
  }

  const updateRow = (index: number, field: keyof MedicionFormRow, value: string) => {
    setRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value, isDirty: true }

      // Auto-fill price when partida changes
      if (field === "partidaId" && value) {
        const capId = next[index].capituloId
        const precio = getPartidaPrecio(capId, value)
        if (precio > 0) {
          next[index].precioUnitario = precio.toString()
        }
      }

      return next
    })
  }

  const addRow = () => {
    setRows(prev => [...prev, { ...emptyRow, isDirty: true }])
    // Scroll to bottom
    setTimeout(() => {
      tableRef.current?.scrollTo({ top: tableRef.current.scrollHeight, behavior: "smooth" })
    }, 100)
  }

  const duplicateRow = (index: number) => {
    setRows(prev => {
      const copy = { ...prev[index], id: undefined, calculadoraUsada: null, isDirty: true }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }

  const removeRow = (index: number) => {
    const row = rows[index]
    if (row.id) {
      // It's an existing medicion - mark for deletion
      setDeleteId(row.id)
    } else {
      // It's a new row - just remove from state
      setRows(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleDeleteMedicion = async () => {
    if (!deleteId) return
    await eliminarMedicion(deleteId)
    setRows(prev => prev.filter(r => r.id !== deleteId))
    setDeleteId(null)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    const updatedRows: MedicionFormRow[] = []

    for (const row of rows) {
      if (!row.partidaId) continue

      const unit = (capitulos.find(c => c.id === row.capituloId)?.partidas.find(p => p.id === row.partidaId)?.unidad || "").toLowerCase()
      const isDimensioned = ["m³", "m²", "ml", "m3", "m2"].includes(unit)
      const isEmpty = !parseFloat(row.largo) && !parseFloat(row.ancho) && !parseFloat(row.alto)

      if (row.id) {
        // Si ya existe en la base de datos, pero está vacío y es dimensionado, lo eliminamos
        if (isEmpty && isDimensioned) {
          await eliminarMedicion(row.id)
          // No lo añadimos a los rows actualizados para que se vuelva a mostrar como vacío y no guardado
          const capId = row.capituloId
          const partId = row.partidaId
          const part = capitulos.find(c => c.id === capId)?.partidas.find(p => p.id === partId)
          updatedRows.push({
            capituloId: capId,
            partidaId: partId,
            veces: "1",
            largo: "",
            ancho: "",
            alto: "",
            precioUnitario: part ? part.precioBase.toString() : "0",
            calculadoraUsada: null,
            isDirty: false,
          })
          continue
        } else if (row.isDirty) {
          const data = {
            partidaId: row.partidaId,
            veces: parseFloat(row.veces) || 1,
            largo: parseFloat(row.largo) || 0,
            ancho: parseFloat(row.ancho) || 0,
            alto: parseFloat(row.alto) || 0,
            precioUnitario: parseFloat(row.precioUnitario) || 0,
            calculadoraUsada: row.calculadoraUsada || undefined,
          }
          await actualizarMedicion(row.id, data)
        }
        updatedRows.push({ ...row, isDirty: false })
      } else {
        // Fila nueva: solo la guardamos si no está vacía o si es un ítem de unidad (no dimensionado) y ha sido modificado
        if (!isEmpty || (!isDimensioned && row.isDirty)) {
          const data = {
            partidaId: row.partidaId,
            veces: parseFloat(row.veces) || 1,
            largo: parseFloat(row.largo) || 0,
            ancho: parseFloat(row.ancho) || 0,
            alto: parseFloat(row.alto) || 0,
            precioUnitario: parseFloat(row.precioUnitario) || 0,
            calculadoraUsada: row.calculadoraUsada || undefined,
          }
          const nueva = await crearMedicion(data)
          if (nueva) {
            updatedRows.push({ ...row, id: nueva.id, isDirty: false })
          } else {
            updatedRows.push(row)
          }
        } else {
          // Si es nueva y está vacía, la mantenemos en el formulario para que el usuario la vea pero no la guardamos en la BD
          updatedRows.push(row)
        }
      }
    }

    setRows(updatedRows)
    setSaving(false)
  }

  // Group rows by capitulo
  const rowsByCapitulo = new Map<string, MedicionFormRow[]>()
  for (const row of rows) {
    const key = row.capituloId || "sin-capitulo"
    if (!rowsByCapitulo.has(key)) rowsByCapitulo.set(key, [])
    rowsByCapitulo.get(key)!.push(row)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (capitulos.length === 0) {
    return (
      <EmptyState
        icon={<Ruler className="h-12 w-12" />}
        title="No hay capítulos definidos"
        description="Primero debes crear capítulos y partidas en la pestaña 'Altas'"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Matriz de Mediciones</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} partidas en la matriz
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCapFilter} onValueChange={setSelectedCapFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por capítulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los capítulos</SelectItem>
              {capitulos.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  Cap. {c.codigo} - {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Fila
          </Button>
          <Button variant="outline" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Todo
          </Button>
        </div>
      </div>

      {/* Grid de mediciones */}
      <Card>
        <CardContent className="p-0">
          <div ref={tableRef} className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-40">Capítulo</TableHead>
                  <TableHead className="w-44">Ítem/Partida</TableHead>
                  <TableHead className="w-12 text-center">Veces</TableHead>
                  <TableHead className="w-20 text-center">Largo (m)</TableHead>
                  <TableHead className="w-20 text-center">Ancho (m)</TableHead>
                  <TableHead className="w-20 text-center">Alto (m)</TableHead>
                  <TableHead className="w-24 text-right">Parcial</TableHead>
                  <TableHead className="w-24 text-right">Precio</TableHead>
                  <TableHead className="w-28 text-right">Total</TableHead>
                  <TableHead className="w-20 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No hay partidas. Agrega partidas en la pestaña "Altas".
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, idx) => {
                    const parcial = calcularParcial(row)
                    const total = calcularTotal(row)
                    const precio = getPartidaPrecio(row.capituloId, row.partidaId)

                    return (
                      <TableRow key={idx} className={row.id ? "" : "bg-muted/30"}>
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <Select value={row.capituloId} onValueChange={v => updateRow(idx, "capituloId", v)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Cap." />
                            </SelectTrigger>
                            <SelectContent>
                              {capitulos.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.codigo} - {c.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={row.partidaId} onValueChange={v => updateRow(idx, "partidaId", v)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Partida" />
                            </SelectTrigger>
                            <SelectContent>
                              {getPartidasForCap(row.capituloId).map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.codigo} - {p.descripcion.substring(0, 30)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.veces}
                            onChange={e => updateRow(idx, "veces", e.target.value)}
                            className="h-8 text-xs text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.largo}
                            onChange={e => updateRow(idx, "largo", e.target.value)}
                            className="h-8 text-xs text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.ancho}
                            onChange={e => updateRow(idx, "ancho", e.target.value)}
                            className="h-8 text-xs text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.alto}
                            onChange={e => updateRow(idx, "alto", e.target.value)}
                            className="h-8 text-xs text-center"
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm font-mono">
                          {parcial > 0 ? parcial.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.precioUnitario}
                            onChange={e => updateRow(idx, "precioUnitario", e.target.value)}
                            className="h-8 text-xs text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm font-mono font-medium">
                          {total > 0 ? formatCurrency(total) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-0.5 justify-end">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateRow(idx)} title="Duplicar">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(idx)} title="Eliminar">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
                {/* Fila vacía al final para agregar rápido */}
                {rows.length > 0 && (
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={7}></TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {rows.reduce((sum, r) => sum + calcularTotal(r), 0) > 0
                        ? formatCurrency(rows.reduce((sum, r) => sum + calcularTotal(r), 0))
                        : ""}
                    </TableCell>
                    <TableCell colSpan={3}></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Subtotales por capítulo */}
      {filteredCapitulos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Subtotales por Capítulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCapitulos.map(cap => {
                const subtotal = rows
                  .filter(r => r.capituloId === cap.id)
                  .reduce((sum, r) => sum + calcularTotal(r), 0)
                if (subtotal === 0) return null
                return (
                  <div key={cap.id} className="flex justify-between items-center py-1 border-b last:border-0">
                    <span className="text-sm">
                      <span className="font-mono text-muted-foreground mr-2">{cap.codigo}</span>
                      {cap.nombre}
                    </span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                )
              })}
              <div className="flex justify-between items-center pt-2 border-t font-bold">
                <span>TOTAL MATERIALES</span>
                <span>{formatCurrency(rows.reduce((sum, r) => sum + calcularTotal(r), 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => { if (!open) setDeleteId(null) }}
        title="¿Eliminar medición?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDeleteMedicion}
        confirmText="Eliminar"
      />
    </div>
  )
}
