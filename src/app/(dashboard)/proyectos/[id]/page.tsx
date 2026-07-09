"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Plus, 
  Calculator, 
  FileText, 
  Calendar, 
  BarChart,
  TrendingUp,
  Box,
  Trash2,
  Eye,
  Edit,
  Loader2,
  Ruler,
  Layers,
  Check,
  X
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Elemento {
  id: string
  tipoElemento: string
  descripcion: string
  cantidad: number
  costoTotal: number
}

interface ElementoDetalle extends Elemento {
  dimA: number | null
  dimB: number | null
  dimH: number | null
  dimLargo: number | null
  dimAncho: number | null
  dimEspesor: number | null
  resistencia: number | null
  desperdicio: number
  aceroLongitudinal: string | null
  estribos: string | null
  materiales: string | null
  createdAt: string
}

interface ProjectData {
  id: string
  nombre: string
  cliente: string
  empresa: string
  fecha: string
  validez: number
  moneda: string
  descripcion: string | null
  elementos: Elemento[]
  _count: { elementos: number }
}

export default function ProyectoDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [detailElement, setDetailElement] = useState<ElementoDetalle | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editElement, setEditElement] = useState<ElementoDetalle | null>(null)
  const [editForm, setEditForm] = useState({
    descripcion: "", cantidad: "", costoTotal: "",
    dimA: "", dimB: "", dimH: "", dimLargo: "", dimAncho: "", dimEspesor: "",
    desperdicio: "", resistencia: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/proyectos/${projectId}`)
      .then(r => r.json())
      .then(data => {
        setProject(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  const handleDeleteElemento = async (elementoId: string) => {
    setDeletingId(elementoId)
    try {
      await fetch(`/api/proyectos/${projectId}/elementos/${elementoId}`, { method: "DELETE" })
      setProject(prev => {
        if (!prev) return prev
        return {
          ...prev,
          elementos: prev.elementos.filter(e => e.id !== elementoId),
          _count: { ...prev._count, elementos: prev._count.elementos - 1 },
        }
      })
    } catch {
      alert("Error al eliminar")
    }
    setDeletingId(null)
  }

  const handleViewElemento = async (elementoId: string) => {
    setDetailLoading(true)
    setDetailElement(null)
    try {
      const res = await fetch(`/api/proyectos/${projectId}/elementos`)
      const elementos = await res.json()
      const el = elementos.find((e: Elemento) => e.id === elementoId)
      if (el) {
        setDetailElement(el as ElementoDetalle)
      }
    } catch {
      console.error("Error cargando detalle del elemento")
    }
    setDetailLoading(false)
  }

  const parseMateriales = (json: string | null): { nombre: string; cantidad: number; unidad: string; costo: number }[] => {
    if (!json) return []
    try {
      const data = JSON.parse(json)
      if (!Array.isArray(data)) return []
      return data.map((m: any) => ({
        nombre: m.nombre || "",
        cantidad: m.cantidad || 0,
        unidad: m.unidad || "",
        costo: m.costo ?? m.precio ?? m.precioUnitario ?? 0,
      }))
    } catch {
      return []
    }
  }

  const parseAcero = (json: string | null): { tipo: string; diametro: number; cantidad: number }[] => {
    if (!json) return []
    try {
      const data = JSON.parse(json)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }

  const handleEditElemento = async (elementoId: string) => {
    setDetailLoading(true)
    setEditElement(null)
    try {
      const res = await fetch(`/api/proyectos/${projectId}/elementos`)
      const elementos = await res.json()
      const el = elementos.find((e: Elemento) => e.id === elementoId)
      if (el) {
        setEditElement(el as ElementoDetalle)
        setEditForm({
          descripcion: el.descripcion || "",
          cantidad: el.cantidad?.toString() || "1",
          costoTotal: (Math.round((el.costoTotal || 0) * 100) / 100).toString(),
          dimA: el.dimA?.toString() || "",
          dimB: el.dimB?.toString() || "",
          dimH: el.dimH?.toString() || "",
          dimLargo: el.dimLargo?.toString() || "",
          dimAncho: el.dimAncho?.toString() || "",
          dimEspesor: el.dimEspesor?.toString() || "",
          desperdicio: el.desperdicio?.toString() || "0",
          resistencia: el.resistencia?.toString() || "",
        })
      }
    } catch {
      console.error("Error cargando elemento para editar")
    }
    setDetailLoading(false)
  }

  const handleSaveEdit = async () => {
    if (!editElement) return
    setSaving(true)
    try {
      const res = await fetch(`/api/proyectos/${projectId}/elementos/${editElement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: editForm.descripcion,
          cantidad: parseInt(editForm.cantidad) || 1,
          costoTotal: Math.round((parseFloat(editForm.costoTotal) || 0) * 100) / 100,
          dimA: editForm.dimA ? parseFloat(editForm.dimA) : null,
          dimB: editForm.dimB ? parseFloat(editForm.dimB) : null,
          dimH: editForm.dimH ? parseFloat(editForm.dimH) : null,
          dimLargo: editForm.dimLargo ? parseFloat(editForm.dimLargo) : null,
          dimAncho: editForm.dimAncho ? parseFloat(editForm.dimAncho) : null,
          dimEspesor: editForm.dimEspesor ? parseFloat(editForm.dimEspesor) : null,
          desperdicio: parseFloat(editForm.desperdicio) || 0,
          resistencia: editForm.resistencia ? parseFloat(editForm.resistencia) : null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProject(prev => {
          if (!prev) return prev
          return {
            ...prev,
            elementos: prev.elementos.map(e => e.id === editElement.id ? { ...e, ...updated } : e),
          }
        })
        setEditElement(null)
      } else {
        alert("Error al guardar")
      }
    } catch {
      alert("Error al guardar")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Proyecto no encontrado</h2>
        <Button asChild className="mt-4">
          <Link href="/proyectos">Volver a proyectos</Link>
        </Button>
      </div>
    )
  }

  const totalCosto = project.elementos.reduce((sum, e) => sum + e.costoTotal, 0)
  const gastosGenerales = totalCosto * 0.15
  const utilidad = totalCosto * 0.10
  const impuestos = totalCosto * 0.0309
  const totalAIU = totalCosto + gastosGenerales + utilidad + impuestos

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/proyectos" className="text-sm text-muted-foreground hover:text-foreground mb-1 block">
            ← Volver a proyectos
          </Link>
          <h1 className="text-3xl font-bold">{project.nombre}</h1>
          <p className="text-muted-foreground">{project.cliente} • {project.empresa}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/proyectos/${projectId}/calculadora`}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Elemento
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/proyectos/${projectId}/presupuesto`}>
              <FileText className="mr-2 h-4 w-4" />
              Ver Presupuesto
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1 p-1">
          <TabsTrigger value="dashboard" className="w-full py-2 text-xs sm:text-sm">Resumen</TabsTrigger>
          <TabsTrigger value="elementos" className="w-full py-2 text-xs sm:text-sm">Elementos</TabsTrigger>
          <TabsTrigger value="presupuesto" className="w-full py-2 text-xs sm:text-sm">Presupuesto</TabsTrigger>
          <TabsTrigger value="detallado" className="w-full py-2 text-xs sm:text-sm">Detallado</TabsTrigger>
          <TabsTrigger value="cronograma" className="w-full py-2 text-xs sm:text-sm">Cronograma</TabsTrigger>
          <TabsTrigger value="reportes" className="w-full py-2 text-xs sm:text-sm">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Elementos Calculados", value: project._count.elementos.toString(), icon: Calculator },
              { label: "Total Materiales", value: formatCurrency(totalCosto), icon: Box },
              { label: "Subtotal Presupuesto", value: formatCurrency(totalCosto), icon: TrendingUp },
              { label: "Total con AIU", value: formatCurrency(totalAIU), icon: FileText },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span>{project.cliente}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Empresa</span><span>{project.empresa}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fecha Inicio</span><span>{format(new Date(project.fecha), "dd MMM yyyy", { locale: es })}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Validez</span><span>{project.validez} días</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Moneda</span><span>{project.moneda}</span></div>
                {project.descripcion && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Descripción</span><span>{project.descripcion}</span></div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/calculadora`}>
                    <Calculator className="h-4 w-4" />
                    Agregar Elemento (Calculadora)
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/presupuesto`}>
                    <FileText className="h-4 w-4" />
                    Ver Presupuesto General
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/cronograma`}>
                    <Calendar className="h-4 w-4" />
                    Cronograma Gantt
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/reportes`}>
                    <BarChart className="h-4 w-4" />
                    Generar Reportes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="elementos">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Elementos Calculados</h2>
            <Button asChild>
              <Link href={`/proyectos/${projectId}/calculadora`}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Elemento
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {project.elementos.map((element) => (
              <Card key={element.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{element.descripcion}</h3>
                        <p className="text-sm text-muted-foreground">{element.tipoElemento} • {element.cantidad} uds</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatCurrency(element.costoTotal)}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewElemento(element.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditElemento(element.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteElemento(element.id)}
                          disabled={deletingId === element.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {project.elementos.length === 0 && (
            <Card className="text-center py-12 border-dashed">
              <Calculator className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Agrega tu primer elemento</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Usa las calculadoras para calcular materiales, cantidades y costos. 
                Empieza con <strong>Concreto</strong>, <strong>Paredes</strong> o <strong>Pisos</strong> (gratis).
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="gap-2 font-bold" size="lg" asChild>
                  <Link href={`/proyectos/${projectId}/calculadora/concreto`}>
                    <Calculator className="h-4 w-4" />
                    Calculadora Concreto
                  </Link>
                </Button>
                <Button variant="outline" className="gap-2" size="lg" asChild>
                  <Link href={`/proyectos/${projectId}/calculadora/pared`}>
                    <Calculator className="h-4 w-4" />
                    Calculadora Paredes
                  </Link>
                </Button>
                <Button variant="outline" className="gap-2" size="lg" asChild>
                  <Link href={`/proyectos/${projectId}/calculadora/piso`}>
                    <Calculator className="h-4 w-4" />
                    Calculadora Pisos
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="presupuesto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Presupuesto General</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/proyectos/${projectId}/presupuesto`}>
                  <FileText className="mr-2 h-4 w-4" /> Ver completo
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {project.elementos.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="font-semibold mb-1">Sin elementos aún</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Agrega elementos constructivos para generar el presupuesto automáticamente
                  </p>
                  <Button size="sm" className="gap-2" asChild>
                    <Link href={`/proyectos/${projectId}/calculadora/concreto`}>
                      <Calculator className="h-4 w-4" />
                      Calcular primer elemento
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {project.elementos.slice(0, 5).map(el => (
                      <div key={el.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <span className="font-medium">{el.descripcion}</span>
                          <span className="text-sm text-muted-foreground ml-2">({el.tipoElemento})</span>
                        </div>
                        <span className="font-medium">{formatCurrency(el.costoTotal)}</span>
                      </div>
                    ))}
                    {project.elementos.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        +{project.elementos.length - 5} elementos más
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totalCosto)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Gastos Generales (15%)</span><span>{formatCurrency(gastosGenerales)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Utilidad (10%)</span><span>{formatCurrency(utilidad)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">IT (3.09%)</span><span>{formatCurrency(impuestos)}</span></div>
                    <div className="flex justify-between font-bold pt-2 border-t"><span>TOTAL</span><span className="text-primary">{formatCurrency(totalAIU)}</span></div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detallado">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Presupuesto Detallado por Capítulos
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/proyectos/${projectId}/presupuesto-detallado`}>
                  <Layers className="mr-2 h-4 w-4" /> Abrir Módulo
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold mb-1">Cómputos Métricos y Presupuesto</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sistema completo de presupuesto por capítulos con 4 módulos:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-4">
                  {[
                    { name: "Altas", desc: "Capítulos y partidas" },
                    { name: "Datos", desc: "Matriz de mediciones" },
                    { name: "Informe", desc: "Vista previa" },
                    { name: "Resumen", desc: "Cierre económico" },
                  ].map(mod => (
                    <div key={mod.name} className="p-3 rounded-lg border bg-muted/30">
                      <p className="font-medium text-sm">{mod.name}</p>
                      <p className="text-xs text-muted-foreground">{mod.desc}</p>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/presupuesto-detallado`}>
                    <Layers className="h-4 w-4" />
                    Abrir Presupuesto Detallado
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cronograma">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cronograma de Obra</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/proyectos/${projectId}/cronograma`}>
                  <Calendar className="mr-2 h-4 w-4" /> Ver completo
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold mb-1">Cronograma de Obra</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gantt interactivo con ruta crítica y Curva S de avance
                </p>
                <Button size="sm" className="gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/cronograma`}>
                    <Calendar className="h-4 w-4" />
                    Abrir Cronograma
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reportes">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Exportar Datos</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/presupuesto`}>
                    <FileText className="h-4 w-4" /> Presupuesto PDF/Excel
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/computos`}>
                    <Ruler className="h-4 w-4" /> Computos Métricos
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/cronograma`}>
                    <Calendar className="h-4 w-4" /> Cronograma PDF
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Análisis</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/reportes`}>
                    <BarChart className="h-4 w-4" /> Gráficos de Costos
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/analisis-precios`}>
                    <TrendingUp className="h-4 w-4" /> Análisis Precios Unitarios
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de detalle del elemento */}
      <Dialog open={!!detailElement || detailLoading} onOpenChange={open => { if (!open) { setDetailElement(null); setDetailLoading(false) } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Elemento</DialogTitle>
          </DialogHeader>
          {detailLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {detailElement && (
            <div className="space-y-6">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{detailElement.tipoElemento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <p className="font-medium">{detailElement.cantidad} uds</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">{detailElement.descripcion}</p>
                </div>
              </div>

              {/* Dimensiones */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Dimensiones</h4>
                <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3 rounded-lg">
                  {detailElement.dimA != null && <div><span className="text-xs text-muted-foreground">A:</span> <span className="text-sm font-medium">{formatNumber(detailElement.dimA)} m</span></div>}
                  {detailElement.dimB != null && <div><span className="text-xs text-muted-foreground">B:</span> <span className="text-sm font-medium">{formatNumber(detailElement.dimB)} m</span></div>}
                  {detailElement.dimH != null && <div><span className="text-xs text-muted-foreground">H:</span> <span className="text-sm font-medium">{formatNumber(detailElement.dimH)} m</span></div>}
                  {detailElement.dimLargo != null && <div><span className="text-xs text-muted-foreground">Largo:</span> <span className="text-sm font-medium">{formatNumber(detailElement.dimLargo)} m</span></div>}
                  {detailElement.dimAncho != null && <div><span className="text-xs text-muted-foreground">Ancho:</span> <span className="text-sm font-medium">{formatNumber(detailElement.dimAncho)} m</span></div>}
                  {detailElement.dimEspesor != null && <div><span className="text-xs text-muted-foreground">Espesor:</span> <span className="text-sm font-medium">{formatNumber(detailElement.dimEspesor)} m</span></div>}
                  {detailElement.resistencia != null && <div><span className="text-xs text-muted-foreground">Resistencia:</span> <span className="text-sm font-medium">{formatNumber(detailElement.resistencia)} kg/cm²</span></div>}
                  {detailElement.desperdicio > 0 && <div><span className="text-xs text-muted-foreground">Desperdicio:</span> <span className="text-sm font-medium">{formatNumber(detailElement.desperdicio)}%</span></div>}
                </div>
              </div>

              {/* Acero longitudinal */}
              {detailElement.aceroLongitudinal && parseAcero(detailElement.aceroLongitudinal).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Acero Longitudinal</h4>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left">Tipo</th>
                          <th className="text-right">Diámetro</th>
                          <th className="text-right">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseAcero(detailElement.aceroLongitudinal).map((a, i) => (
                          <tr key={i}>
                            <td>{a.tipo}</td>
                            <td className="text-right">{a.diametro} mm</td>
                            <td className="text-right">{a.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Estribos */}
              {detailElement.estribos && parseAcero(detailElement.estribos).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Estribos</h4>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left">Tipo</th>
                          <th className="text-right">Diámetro</th>
                          <th className="text-right">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseAcero(detailElement.estribos).map((a, i) => (
                          <tr key={i}>
                            <td>{a.tipo}</td>
                            <td className="text-right">{a.diametro} mm</td>
                            <td className="text-right">{a.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Materiales */}
              {detailElement.materiales && parseMateriales(detailElement.materiales).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Materiales</h4>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left">Material</th>
                          <th className="text-right">Cantidad</th>
                          <th className="text-right">Unidad</th>
                          <th className="text-right">Costo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseMateriales(detailElement.materiales).map((m, i) => (
                          <tr key={i} className="border-t border-border/50">
                            <td>{m.nombre}</td>
                            <td className="text-right">{formatNumber(m.cantidad)}</td>
                            <td className="text-right">{m.unidad}</td>
                            <td className="text-right font-medium">{formatCurrency(m.costo)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Costo total */}
              <div className="bg-primary/5 p-4 rounded-lg flex justify-between items-center">
                <span className="font-semibold">Costo Total:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(detailElement.costoTotal)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de edicion del elemento */}
      <Dialog open={!!editElement} onOpenChange={open => { if (!open) setEditElement(null) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Elemento</DialogTitle>
          </DialogHeader>
          {editElement && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Tipo</Label>
                <p className="text-sm font-medium">{editElement.tipoElemento}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Descripción</Label>
                <Input
                  value={editForm.descripcion}
                  onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                  placeholder="Descripción del elemento"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.cantidad}
                    onChange={e => setEditForm({ ...editForm, cantidad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Costo Total (Bs)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.costoTotal}
                    onChange={e => setEditForm({ ...editForm, costoTotal: e.target.value })}
                  />
                </div>
              </div>

              {/* Dimensiones */}
              {(editElement.dimA != null || editElement.dimB != null || editElement.dimH != null ||
                editElement.dimLargo != null || editElement.dimAncho != null || editElement.dimEspesor != null) && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Dimensiones (m)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {editElement.dimA != null && (
                      <div className="space-y-1">
                        <Label className="text-xs">Alto / A</Label>
                        <Input type="number" step="0.01" min="0" value={editForm.dimA}
                          onChange={e => setEditForm({ ...editForm, dimA: e.target.value })} />
                      </div>
                    )}
                    {editElement.dimB != null && (
                      <div className="space-y-1">
                        <Label className="text-xs">Largo / B</Label>
                        <Input type="number" step="0.01" min="0" value={editForm.dimB}
                          onChange={e => setEditForm({ ...editForm, dimB: e.target.value })} />
                      </div>
                    )}
                    {editElement.dimH != null && (
                      <div className="space-y-1">
                        <Label className="text-xs">Espesor / H</Label>
                        <Input type="number" step="0.01" min="0" value={editForm.dimH}
                          onChange={e => setEditForm({ ...editForm, dimH: e.target.value })} />
                      </div>
                    )}
                    {editElement.dimLargo != null && (
                      <div className="space-y-1">
                        <Label className="text-xs">Largo</Label>
                        <Input type="number" step="0.01" min="0" value={editForm.dimLargo}
                          onChange={e => setEditForm({ ...editForm, dimLargo: e.target.value })} />
                      </div>
                    )}
                    {editElement.dimAncho != null && (
                      <div className="space-y-1">
                        <Label className="text-xs">Ancho</Label>
                        <Input type="number" step="0.01" min="0" value={editForm.dimAncho}
                          onChange={e => setEditForm({ ...editForm, dimAncho: e.target.value })} />
                      </div>
                    )}
                    {editElement.dimEspesor != null && (
                      <div className="space-y-1">
                        <Label className="text-xs">Espesor</Label>
                        <Input type="number" step="0.01" min="0" value={editForm.dimEspesor}
                          onChange={e => setEditForm({ ...editForm, dimEspesor: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Otros parametros */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Desperdicio (%)</Label>
                  <Input type="number" step="0.01" min="0" value={editForm.desperdicio}
                    onChange={e => setEditForm({ ...editForm, desperdicio: e.target.value })} />
                </div>
                {editElement.resistencia != null && (
                  <div className="space-y-2">
                    <Label className="text-xs">Resistencia (kg/cm²)</Label>
                    <Input type="number" step="0.01" min="0" value={editForm.resistencia}
                      onChange={e => setEditForm({ ...editForm, resistencia: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditElement(null)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
