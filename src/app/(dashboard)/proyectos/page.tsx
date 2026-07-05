"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Building2, Eye, Loader2, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

interface Project {
  id: string
  nombre: string
  cliente: string
  createdAt: string
  _count?: { elementos: number }
}

export default function ProyectosPage() {
  const [search, setSearch] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch("/api/proyectos")
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/proyectos/${deleteId}`, { method: "DELETE" })
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== deleteId))
        setDeleteId(null)
      }
    } catch {
      alert("Error al eliminar")
    } finally {
      setDeleting(false)
    }
  }

  const filteredProjects = projects.filter(p => 
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProjects.length > 0 ? (
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
                  <span className="font-medium">{project._count?.elementos || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creado</span>
                  <span className="font-medium">{format(new Date(project.createdAt), "dd MMM yyyy", { locale: es })}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(project.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">{search ? "No se encontraron proyectos" : "No hay proyectos"}</h3>
          <p className="text-muted-foreground mt-1">
            {search ? "Intenta con otros términos" : "Comienza creando tu primer proyecto"}
          </p>
          {!search && (
            <Link href="/proyectos/nuevo" className="mt-4 inline-block">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Crear proyecto
              </Button>
            </Link>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="¿Eliminar proyecto?"
        description="Esta acción no se puede deshacer. Se eliminarán todos los elementos, presupuestos y cronogramas asociados."
        onConfirm={handleDelete}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
      />
    </div>
  )
}