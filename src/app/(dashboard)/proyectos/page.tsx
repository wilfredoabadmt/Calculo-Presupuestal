"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Filter, Building2, Calendar, Trash2, Edit, Eye } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const mockProjects = [
  { id: "1", nombre: "Edificio Los Andes", cliente: "Constructora ABC", elementos: 12, total: 1250000, fecha: "2024-01-15" },
  { id: "2", nombre: "Casa Residencial Zona Sur", cliente: "Familia García", elementos: 8, total: 450000, fecha: "2024-01-10" },
  { id: "3", nombre: "Oficinas Centro Comercial", cliente: "Inmobiliaria XYZ", elementos: 15, total: 3200000, fecha: "2024-01-05" },
]

export default function ProyectosPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredProjects = mockProjects.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.cliente.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona tus proyectos de construcción</p>
        </div>
        <Link href="/proyectos/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-input bg-background rounded-md"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="completed">Completados</option>
            <option value="archived">Archivados</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.cliente}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Activo</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Elementos calculados</span>
                <span className="font-medium">{project.elementos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Presupuesto total</span>
                <span className="font-medium">{formatCurrency(project.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última actualización</span>
                <span className="font-medium">{format(new Date(project.fecha), "dd MMM yyyy", { locale: es })}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/proyectos/${project.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/proyectos/${project.id}/calculadora`}>
                    <Building2 className="h-4 w-4 mr-1" />
                    Calcular
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay proyectos</h3>
          <p className="text-muted-foreground mt-1">Comienza creando tu primer proyecto</p>
          <Link href="/proyectos/nuevo" className="mt-4 inline-block">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear proyecto
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}