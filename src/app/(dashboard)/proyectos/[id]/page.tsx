"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Building2, 
  Calculator, 
  FileText, 
  Calendar, 
  BarChart,
  TrendingUp,
  FolderKanban,
  Box,
  Users,
  Eye,
  Edit,
  Trash2,
  LayoutDashboard
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const mockElements = [
  { id: "1", tipo: "CONCRETO", descripcion: "Columna principal", cantidad: 4, costo: 125000 },
  { id: "2", tipo: "PARED", descripcion: "Muros perimetrales", cantidad: 120, costo: 85000 },
  { id: "3", tipo: "LOSA", descripcion: "Losa entrepiso", cantidad: 1, costo: 320000 },
]

export default function ProyectoDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const project = {
    id: projectId,
    nombre: "Edificio Los Andes",
    cliente: "Constructora ABC",
    empresa: "Mi Empresa Constructora",
    fecha: "2024-01-15",
    validez: 30,
    moneda: "Bs.",
    descripcion: "Edificio de 5 pisos en zona central",
  }

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
              { label: "Elementos Calculados", value: "17", icon: Calculator, color: "bg-orange-500" },
              { label: "Total Materiales", value: formatCurrency(530000), icon: Box, color: "bg-green-500" },
              { label: "Subtotal Presupuesto", value: formatCurrency(680000), icon: TrendingUp, color: "bg-blue-500" },
              { label: "Total con AIU", value: formatCurrency(950000), icon: FileText, color: "bg-purple-500" },
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
            {mockElements.map((element) => (
              <Card key={element.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{element.descripcion}</h3>
                        <p className="text-sm text-muted-foreground">{element.tipo} • {element.cantidad} uds</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatCurrency(element.costo)}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/proyectos/${projectId}/calculadora?edit=${element.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/proyectos/${projectId}/calculadora?edit=${element.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockElements.length === 0 && (
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
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold">Presupuesto General</h3>
            <p className="text-muted-foreground mt-1">Aquí verás el presupuesto consolidado con todos los elementos</p>
            <Button className="mt-4 gap-2" asChild>
              <Link href={`/proyectos/${projectId}/presupuesto`}>
                Ir al Presupuesto
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="cronograma">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold">Cronograma Gantt</h3>
            <p className="text-muted-foreground mt-1">Diagrama de Gantt interactivo con ruta crítica</p>
            <Button className="mt-4 gap-2" asChild>
              <Link href={`/proyectos/${projectId}/cronograma`}>
                Ver Cronograma
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="reportes">
          <div className="text-center py-12">
            <BarChart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold">Reportes</h3>
            <p className="text-muted-foreground mt-1">Exporta PDF, Excel y genera reportes profesionales</p>
            <Button className="mt-4 gap-2" asChild>
              <Link href={`/proyectos/${projectId}/reportes`}>
                Ver Reportes
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}