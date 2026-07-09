"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calculator, FileText, Download, Plus, Loader2, Pencil, Check, X } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { exportarPDF, exportarExcel, exportarFormularioB1PDF } from "@/lib/exports"

interface Elemento {
  id: string
  tipoElemento: string
  descripcion: string
  cantidad: number
  costoTotal: number
}

const moduleMap: Record<string, string> = {
  CONCRETO: "OBRA GRUESA",
  PARED: "OBRA GRUESA",
  COLUMNA: "OBRA GRUESA",
  VIGA: "OBRA GRUESA",
  LOSA: "OBRA GRUESA",
  CIMIENTO: "OBRA GRUESA",
  MURO: "OBRA GRUESA",
  TECHO: "OBRA FINA",
  PISO: "OBRA FINA",
  CIELO: "OBRA FINA",
}

const moduleOrder = ["OBRA GRUESA", "OBRA FINA"]

export default function PresupuestoPage() {
  const params = useParams()
  const projectId = params.id as string
  const [elementos, setElementos] = useState<Elemento[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCant, setEditCant] = useState("")

  // AIU percentages (editable)
  const [aiu, setAiu] = useState({
    cargasSociales: 55,
    iva: 14.94,
    gastosGenerales: 15,
    utilidad: 10,
    it: 3.09,
  })
  const [editingAIU, setEditingAIU] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("app-config")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAiu({
          cargasSociales: parsed.cargasSociales ?? 55,
          iva: parsed.iva ?? 14.94,
          gastosGenerales: parsed.gastosGenerales ?? 15,
          utilidad: parsed.utilidad ?? 10,
          it: parsed.impuestoIT ?? 3.09,
        })
      } catch (e) {}
    }
  }, [])

  const updateAiuField = (field: string, value: number) => {
    setAiu(prev => {
      const next = { ...prev, [field]: value }
      const saved = localStorage.getItem("app-config")
      let currentConfig = {}
      if (saved) {
        try {
          currentConfig = JSON.parse(saved)
        } catch (e) {}
      }
      localStorage.setItem("app-config", JSON.stringify({
        ...currentConfig,
        cargasSociales: next.cargasSociales,
        iva: next.iva,
        gastosGenerales: next.gastosGenerales,
        utilidad: next.utilidad,
        impuestoIT: next.it,
      }))
      return next
    })
  }

  useEffect(() => {
    fetch(`/api/proyectos/${projectId}/elementos`)
      .then(r => r.json())
      .then(data => {
        setElementos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  const subtotal = elementos.reduce((sum, e) => sum + e.costoTotal, 0)
  const cargasSociales = subtotal * (aiu.cargasSociales / 100)
  const iva = subtotal * (aiu.iva / 100)
  const gastosGenerales = subtotal * (aiu.gastosGenerales / 100)
  const utilidad = subtotal * (aiu.utilidad / 100)
  const impuestos = subtotal * (aiu.it / 100)
  const totalGeneral = subtotal + gastosGenerales + utilidad + impuestos

  // Group by module
  const grouped = moduleOrder.map(mod => ({
    module: mod,
    items: elementos.filter(e => moduleMap[e.tipoElemento] === mod),
    subtotal: elementos.filter(e => moduleMap[e.tipoElemento] === mod).reduce((s, e) => s + e.costoTotal, 0),
  })).filter(g => g.items.length > 0)

  const handleUpdateCantidad = async (id: string) => {
    const newCant = parseFloat(editCant)
    if (isNaN(newCant) || newCant <= 0) return
    try {
      await fetch(`/api/proyectos/${projectId}/elementos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: newCant }),
      })
      setElementos(prev => prev.map(e => e.id === id ? { ...e, cantidad: newCant } : e))
    } catch { /* ignore */ }
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este elemento?")) return
    try {
      await fetch(`/api/proyectos/${projectId}/elementos/${id}`, { method: "DELETE" })
      setElementos(prev => prev.filter(e => e.id !== id))
    } catch { /* ignore */ }
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
      <PageHeader
        title="Presupuesto General"
        description="Análisis de costos del proyecto"
        backHref={`/proyectos/${projectId}`}
        icon={<FileText className="h-7 w-7 text-primary" />}
        actions={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" className="border-indigo-600/30 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20" onClick={() => {
              exportarFormularioB1PDF(elementos, "Presupuesto General", "Empresa Constructora", {
                cargasSociales: aiu.cargasSociales,
                iva: aiu.iva,
                gastosGenerales: aiu.gastosGenerales,
                utilidad: aiu.utilidad,
                it: aiu.it,
                moneda: "Bs."
              })
            }}>
              <FileText className="mr-2 h-4 w-4" /> Form. B-1 (APU)
            </Button>
            <Button variant="outline" onClick={() => {
              const items = elementos.map(e => ({ codigo: e.tipoElemento, descripcion: e.descripcion, unidad: "ud", cantidad: e.cantidad, costoTotal: e.costoTotal }))
              const resumen = { "Subtotal": subtotal, [`Gastos Generales (${aiu.gastosGenerales}%)`]: gastosGenerales, [`Utilidad (${aiu.utilidad}%)`]: utilidad, [`IT (${aiu.it}%)`]: impuestos, "Total General": totalGeneral }
              exportarPDF(items, "Presupuesto General", resumen)
            }}><Download className="mr-2 h-4 w-4" /> PDF</Button>
            <Button variant="outline" onClick={() => {
              const items = elementos.map(e => ({ codigo: e.tipoElemento, descripcion: e.descripcion, unidad: "ud", cantidad: e.cantidad, precioUnitario: e.costoTotal / e.cantidad, costoTotal: e.costoTotal }))
              exportarExcel(items, "Presupuesto General")
            }}><Download className="mr-2 h-4 w-4" /> Excel</Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Desglose por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          {elementos.length === 0 ? (
            <EmptyState
              icon={<Calculator className="h-12 w-12" />}
              title="Presupuesto vacío"
              description="Agrega elementos desde las calculadoras para generar el presupuesto"
            />
          ) : (
            <div className="space-y-6">
              {grouped.map(group => (
                <div key={group.module}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{group.module}</h3>
                    <span className="text-sm font-medium">{formatCurrency(group.subtotal)}</span>
                  </div>
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right w-24">Cantidad</TableHead>
                        <TableHead className="text-right">Costo Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium text-xs">{item.tipoElemento}</TableCell>
                          <TableCell>{item.descripcion}</TableCell>
                          <TableCell className="text-right">
                            {editingId === item.id ? (
                              <div className="flex items-center justify-end gap-1">
                                <Input
                                  type="number"
                                  value={editCant}
                                  onChange={e => setEditCant(e.target.value)}
                                  className="h-7 w-20 text-right text-xs"
                                  autoFocus
                                  onKeyDown={e => { if (e.key === "Enter") handleUpdateCantidad(item.id); if (e.key === "Escape") setEditingId(null) }}
                                />
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateCantidad(item.id)}>
                                  <Check className="h-3 w-3 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingId(null)}>
                                  <X className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
                            ) : (
                              <span
                                className="cursor-pointer hover:text-primary"
                                onClick={() => { setEditingId(item.id); setEditCant(item.cantidad.toString()) }}
                              >
                                {formatNumber(item.cantidad)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {editingId !== item.id && formatCurrency(item.costoTotal / item.cantidad)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.costoTotal)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="font-medium">Subtotal {group.module}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(group.subtotal)}</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {elementos.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Resumen de Costos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Subtotal Materiales</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cargas Sociales ({aiu.cargasSociales}%)</span><span>{formatCurrency(cargasSociales)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">IVA ({aiu.iva}%)</span><span>{formatCurrency(iva)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Gastos Generales ({aiu.gastosGenerales}%)</span><span>{formatCurrency(gastosGenerales)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Utilidad ({aiu.utilidad}%)</span><span>{formatCurrency(utilidad)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Imp. Transacciones ({aiu.it}%)</span><span>{formatCurrency(impuestos)}</span></div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>TOTAL GENERAL</span>
                <span className="text-primary">{formatCurrency(totalGeneral)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Porcentajes AIU</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditingAIU(!editingAIU)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingAIU ? (
                <>
                  {Object.entries(aiu).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={val}
                          onChange={e => updateAiuField(key, parseFloat(e.target.value) || 0)}
                          className="h-7 w-20 text-right text-xs"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Total AIU</span>
                    <span>{formatCurrency(subtotal * (aiu.gastosGenerales + aiu.utilidad + aiu.it) / 100)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gastos Generales</span><span>{aiu.gastosGenerales}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Utilidad</span><span>{aiu.utilidad}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Imp. Transacciones</span><span>{aiu.it}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cargas Sociales</span><span>{aiu.cargasSociales}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">IVA</span><span>{aiu.iva}%</span></div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total AIU</span>
                    <span>{formatCurrency(subtotal * (aiu.gastosGenerales + aiu.utilidad + aiu.it) / 100)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
