"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Ruler
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
        <div className="flex gap-2">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Resumen</TabsTrigger>
          <TabsTrigger value="elementos">Elementos</TabsTrigger>
          <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
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
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/proyectos/${projectId}/calculadora`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/proyectos/${projectId}/calculadora`}>
                            <Edit className="h-4 w-4" />
                          </Link>
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
            <Card className="text-center py-12">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No hay elementos calculados</h3>
              <p className="text-muted-foreground mt-1">Agrega tu primer elemento usando la calculadora</p>
              <Button className="mt-4 gap-2" asChild>
                <Link href={`/proyectos/${projectId}/calculadora`}>
                  <Calculator className="h-4 w-4" />
                  Ir a Calculadoras
                </Link>
              </Button>
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
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Agrega elementos para generar el presupuesto</p>
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
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-3">Gantt interactivo con ruta crítica y Curva S</p>
                <Button size="sm" asChild>
                  <Link href={`/proyectos/${projectId}/cronograma`}>
                    <Plus className="mr-2 h-4 w-4" /> Abrir Cronograma
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
                  <Link href={`/proyectos/${projectId}/reportes`}>
                    <FileText className="h-4 w-4" /> Presupuesto PDF/Excel
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/reportes`}>
                    <Ruler className="h-4 w-4" /> Computos Métricos
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/proyectos/${projectId}/reportes`}>
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
    </div>
  )
}
