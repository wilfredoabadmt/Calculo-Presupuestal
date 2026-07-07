"use client"

import { useState, useMemo, useEffect } from "react"
import { usePresupuesto } from "@/components/presupuesto/PresupuestoContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatCurrency } from "@/lib/utils"
import {
  FileText,
  Download,
  FileSpreadsheet,
  Loader2,
  Printer,
  Pencil,
  Check,
} from "lucide-react"

export default function InformePage() {
  const {
    presupuesto,
    capitulos,
    mediciones,
    loading,
    actualizarDatosEmpresa,
  } = usePresupuesto()

  const [exporting, setExporting] = useState(false)
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerForm, setHeaderForm] = useState({
    empresaNombre: presupuesto?.empresaNombre || "",
    empresaDireccion: presupuesto?.empresaDireccion || "",
    empresaCif: presupuesto?.empresaCif || "",
    empresaLogo: presupuesto?.empresaLogo || "",
    clienteNombre: presupuesto?.clienteNombre || "",
    clienteDireccion: presupuesto?.clienteDireccion || "",
    clientePoblacion: presupuesto?.clientePoblacion || "",
    clienteCif: presupuesto?.clienteCif || "",
    clienteLogo: (presupuesto as any)?.clienteLogo || "",
    proyectoNombre: presupuesto?.proyectoNombre || "",
    fechaEmision: presupuesto?.fechaEmision || new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (presupuesto) {
      setHeaderForm({
        empresaNombre: presupuesto.empresaNombre || "",
        empresaDireccion: presupuesto.empresaDireccion || "",
        empresaCif: presupuesto.empresaCif || "",
        empresaLogo: presupuesto.empresaLogo || "",
        clienteNombre: presupuesto.clienteNombre || "",
        clienteDireccion: presupuesto.clienteDireccion || "",
        clientePoblacion: presupuesto.clientePoblacion || "",
        clienteCif: presupuesto.clienteCif || "",
        clienteLogo: (presupuesto as any).clienteLogo || "",
        proyectoNombre: presupuesto.proyectoNombre || "",
        fechaEmision: presupuesto.fechaEmision ? new Date(presupuesto.fechaEmision).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      })
    }
  }, [presupuesto])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'empresaLogo' | 'clienteLogo') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setHeaderForm(prev => ({
        ...prev,
        [field]: reader.result as string
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveHeader = async () => {
    await actualizarDatosEmpresa(headerForm)
    setEditingHeader(false)
  }

  const capituloData = capitulos
    .filter(cap => cap.partidas.length > 0)
    .map(cap => ({
      codigo: cap.codigo,
      nombre: cap.nombre,
      partidas: cap.partidas
        .filter(part => {
          const meds = mediciones.filter(m => m.partidaId === part.id)
          return meds.length > 0
        })
        .map(part => ({
          codigo: part.codigo,
          descripcion: part.descripcion,
          unidad: part.unidad,
          precioBase: part.precioBase,
          mediciones: mediciones
            .filter(m => m.partidaId === part.id)
            .map(m => {
              const l = m.largo > 0 ? m.largo : 1
              const a = m.ancho > 0 ? m.ancho : 1
              const h = m.alto > 0 ? m.alto : 1
              const parcial = m.veces * l * a * h
              const costoTotal = parcial * m.precioUnitario
              return {
                veces: m.veces,
                largo: m.largo,
                ancho: m.ancho,
                alto: m.alto,
                parcial,
                precioUnitario: m.precioUnitario,
                costoTotal,
              }
            }),
        })),
    }))

  const subtotalMaterial = capituloData.reduce((sumCap, cap) =>
    sumCap + cap.partidas.reduce((sumPart, part) =>
      sumPart + part.mediciones.reduce((sumMed, med) => sumMed + med.costoTotal, 0)
    , 0)
  , 0)

  const totales = useMemo(() => {
    const bi = presupuesto?.porcentajeBI || 10
    const iva = presupuesto?.porcentajeIVA || 21
    const cd = subtotalMaterial
    const biMonto = Math.round(cd * bi) / 100
    const base = cd + biMonto
    const ivaMonto = Math.round(base * iva) / 100
    return {
      costoDirecto: Math.round(cd * 100) / 100,
      beneficioIndustrial: Math.round(biMonto * 100) / 100,
      baseImponible: Math.round(base * 100) / 100,
      iva: Math.round(ivaMonto * 100) / 100,
      totalGeneral: Math.round((base + ivaMonto) * 100) / 100,
    }
  }, [subtotalMaterial, presupuesto?.porcentajeBI, presupuesto?.porcentajeIVA])

  const exportExcel = async () => {
    setExporting(true)
    try {
      const [{ generarExcelPresupuesto, descargarExcel }] = await Promise.all([
        import("@/lib/export-presupuesto"),
      ])
      const wb = generarExcelPresupuesto({
        empresaNombre: headerForm.empresaNombre,
        empresaDireccion: headerForm.empresaDireccion,
        empresaCif: headerForm.empresaCif,
        clienteNombre: headerForm.clienteNombre,
        proyectoNombre: headerForm.proyectoNombre,
        fechaEmision: headerForm.fechaEmision,
        porcentajeBI: presupuesto?.porcentajeBI || 10,
        porcentajeIVA: presupuesto?.porcentajeIVA || 21,
        capitulos: capituloData,
      })
      descargarExcel(wb, `Presupuesto_${headerForm.proyectoNombre || "obra"}.xlsx`)
    } catch (e) {
      console.error("Error exportando Excel:", e)
      alert("Error al exportar")
    }
    setExporting(false)
  }

  const exportPDF = async () => {
    setExporting(true)
    try {
      const [{ generarPDFPresupuesto, descargarPDF }] = await Promise.all([
        import("@/lib/export-pdf"),
      ])
      const doc = generarPDFPresupuesto({
        empresaNombre: headerForm.empresaNombre,
        empresaDireccion: headerForm.empresaDireccion,
        empresaCif: headerForm.empresaCif,
        empresaLogo: headerForm.empresaLogo,
        clienteNombre: headerForm.clienteNombre,
        clienteDireccion: headerForm.clienteDireccion,
        clientePoblacion: headerForm.clientePoblacion,
        clienteCif: headerForm.clienteCif,
        clienteLogo: headerForm.clienteLogo,
        proyectoNombre: headerForm.proyectoNombre,
        fechaEmision: headerForm.fechaEmision,
        porcentajeBI: presupuesto?.porcentajeBI || 10,
        porcentajeIVA: presupuesto?.porcentajeIVA || 21,
        subtotalMaterial: totales.costoDirecto,
        beneficioIndustrial: totales.beneficioIndustrial,
        baseImponible: totales.baseImponible,
        montoIVA: totales.iva,
        totalPresupuesto: totales.totalGeneral,
        capitulos: capituloData,
      })
      descargarPDF(doc, `Presupuesto_${headerForm.proyectoNombre || "obra"}.pdf`)
    } catch (e) {
      console.error("Error exportando PDF:", e)
      alert("Error al exportar")
    }
    setExporting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (mediciones.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No hay datos para el informe"
        description="Primero debes ingresar mediciones en la pestaña 'Datos'"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Informe de Presupuesto</h2>
          <p className="text-sm text-muted-foreground">
            Vista previa del presupuesto detallado
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditingHeader(!editingHeader)}>
            {editingHeader ? <Check className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
            {editingHeader ? "Guardar" : "Editar Encabezado"}
          </Button>
          <Button variant="outline" onClick={exportExcel} disabled={exporting}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={exportPDF} disabled={exporting}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          {editingHeader ? (
            <div className="space-y-4 mb-8 border-b pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Empresa Constructora</Label>
                  <Input value={headerForm.empresaNombre} onChange={e => setHeaderForm({...headerForm, empresaNombre: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Cliente</Label>
                  <Input value={headerForm.clienteNombre} onChange={e => setHeaderForm({...headerForm, clienteNombre: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Direccion Empresa</Label>
                  <Input value={headerForm.empresaDireccion} onChange={e => setHeaderForm({...headerForm, empresaDireccion: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Direccion Cliente</Label>
                  <Input value={headerForm.clienteDireccion} onChange={e => setHeaderForm({...headerForm, clienteDireccion: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">NIT/CIF Empresa</Label>
                  <Input value={headerForm.empresaCif} onChange={e => setHeaderForm({...headerForm, empresaCif: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Poblacion Cliente</Label>
                  <Input value={headerForm.clientePoblacion} onChange={e => setHeaderForm({...headerForm, clientePoblacion: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Nombre del Proyecto</Label>
                  <Input value={headerForm.proyectoNombre} onChange={e => setHeaderForm({...headerForm, proyectoNombre: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Fecha de Emision</Label>
                  <Input type="date" value={headerForm.fechaEmision} onChange={e => setHeaderForm({...headerForm, fechaEmision: e.target.value})} />
                </div>

                {/* Upload Logos */}
                <div className="space-y-2 col-span-2 border-t pt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Logotipo de la Empresa</Label>
                    <div className="flex items-center gap-4">
                      {headerForm.empresaLogo && (
                        <img src={headerForm.empresaLogo} alt="Logo Empresa" className="h-12 w-auto object-contain border rounded p-1 bg-white" />
                      )}
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleFileChange(e, 'empresaLogo')} 
                        className="text-xs cursor-pointer"
                      />
                      {headerForm.empresaLogo && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive text-xs h-8 px-2"
                          onClick={() => setHeaderForm(prev => ({ ...prev, empresaLogo: "" }))}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Logotipo del Cliente</Label>
                    <div className="flex items-center gap-4">
                      {headerForm.clienteLogo && (
                        <img src={headerForm.clienteLogo} alt="Logo Cliente" className="h-12 w-auto object-contain border rounded p-1 bg-white" />
                      )}
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleFileChange(e, 'clienteLogo')} 
                        className="text-xs cursor-pointer"
                      />
                      {headerForm.clienteLogo && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive text-xs h-8 px-2"
                          onClick={() => setHeaderForm(prev => ({ ...prev, clienteLogo: "" }))}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveHeader} size="sm">
                <Check className="mr-2 h-4 w-4" />
                Guardar Encabezado
              </Button>
            </div>
          ) : (
            <div className="mb-8 border-b pb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex gap-4 items-start">
                  {headerForm.empresaLogo && (
                    <img src={headerForm.empresaLogo} alt="Logo Empresa" className="h-16 w-auto object-contain border rounded p-1 bg-white shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-lg">{headerForm.empresaNombre || "Empresa Constructora"}</p>
                    <p className="text-muted-foreground">{headerForm.empresaDireccion}</p>
                    <p className="text-muted-foreground">{headerForm.empresaCif}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start justify-end text-right">
                  <div>
                    <p className="text-muted-foreground">CLIENTE: <span className="font-medium text-foreground">{headerForm.clienteNombre || "-"}</span></p>
                    <p className="text-muted-foreground">OBRA: <span className="font-medium text-foreground">{headerForm.proyectoNombre || "-"}</span></p>
                    <p className="text-muted-foreground">FECHA: <span className="font-medium text-foreground">{headerForm.fechaEmision || "-"}</span></p>
                  </div>
                  {headerForm.clienteLogo && (
                    <img src={headerForm.clienteLogo} alt="Logo Cliente" className="h-16 w-auto object-contain border rounded p-1 bg-white shrink-0" />
                  )}
                </div>
              </div>
            </div>
          )}

          <h3 className="text-center text-lg font-bold mb-6">MEDICIONES Y PRESUPUESTO</h3>

          {capituloData.map(cap => {
            const subtotalCap = cap.partidas.reduce((sum, part) =>
              sum + part.mediciones.reduce((sumMed, med) => sumMed + med.costoTotal, 0)
            , 0)

            return (
              <div key={cap.codigo} className="mb-6">
                <div className="bg-muted/50 px-4 py-2 rounded-t font-semibold text-sm">
                  CAP. {cap.codigo} - {cap.nombre}
                </div>
                <Table className="border">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16">Partida</TableHead>
                      <TableHead className="w-12">UD</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="w-14 text-center">Cant</TableHead>
                      <TableHead className="w-14 text-center">Largo</TableHead>
                      <TableHead className="w-14 text-center">Ancho</TableHead>
                      <TableHead className="w-14 text-center">Alto</TableHead>
                      <TableHead className="w-20 text-right">Parcial</TableHead>
                      <TableHead className="w-20 text-right">Precio</TableHead>
                      <TableHead className="w-24 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cap.partidas.map((part, pi) =>
                      part.mediciones.map((med, mi) => (
                        <TableRow key={`${pi}-${mi}`}>
                          <TableCell className="font-mono text-xs">{part.codigo}</TableCell>
                          <TableCell className="text-xs">{part.unidad}</TableCell>
                          <TableCell className="text-xs">{part.descripcion}</TableCell>
                          <TableCell className="text-center text-xs">{med.veces}</TableCell>
                          <TableCell className="text-center text-xs">{med.largo}</TableCell>
                          <TableCell className="text-center text-xs">{med.ancho}</TableCell>
                          <TableCell className="text-center text-xs">{med.alto}</TableCell>
                          <TableCell className="text-right text-xs">{med.parcial.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-xs">{med.precioUnitario.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-xs font-medium">{formatCurrency(med.costoTotal)}</TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={9} className="text-right font-semibold text-sm">SUBTOTAL</TableCell>
                      <TableCell className="text-right font-bold text-sm">{formatCurrency(subtotalCap)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )
          })}

          <div className="border-t-2 pt-4 mt-8 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">TOTAL PRESUPUESTO EJECUCION MATERIAL</span>
              <span className="font-bold">{formatCurrency(totales.costoDirecto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Gastos Generales y Beneficio Industrial ({presupuesto?.porcentajeBI || 10}%)</span>
              <span>{formatCurrency(totales.beneficioIndustrial)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-semibold">TOTAL PRESUPUESTO EJECUCION CONTRATA</span>
              <span className="font-bold">{formatCurrency(totales.baseImponible)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>I.V.A. ({presupuesto?.porcentajeIVA || 21}%)</span>
              <span>{formatCurrency(totales.iva)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t-2 pt-2 mt-2">
              <span>TOTAL PRESUPUESTO CONTRATADO</span>
              <span>{formatCurrency(totales.totalGeneral)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
