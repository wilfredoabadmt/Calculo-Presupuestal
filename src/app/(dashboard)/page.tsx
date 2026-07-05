"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Loader2
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

const quickActions = [
  { name: "Nuevo Proyecto", href: "/proyectos/nuevo", icon: Plus, description: "Crear un proyecto de construcción", color: "bg-blue-500" },
  { name: "Calculadora Concreto", href: "/proyectos/nuevo/calculadora/concreto", icon: Calculator, description: "Calcular materiales para concreto", color: "bg-orange-500" },
  { name: "Calculadora Paredes", href: "/proyectos/nuevo/calculadora/pared", icon: Building2, description: "Bloques, ladrillos, repello", color: "bg-green-500" },
  { name: "Ver Materiales", href: "/materiales", icon: Box, description: "Catálogo de materiales y precios", color: "bg-purple-500" },
]

interface Project {
  id: string
  nombre: string
  cliente: string
  createdAt: string
  _count?: { elementos: number }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [materialCount, setMaterialCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, matRes] = await Promise.all([
          fetch("/api/proyectos"),
          fetch("/api/materiales"),
        ])
        if (projRes.ok) {
          const projData = await projRes.json()
          setProjects(projData)
        }
        if (matRes.ok) {
          const matData = await matRes.json()
          setMaterialCount(Array.isArray(matData) ? matData.length : 0)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  
  if (!session?.user) {
    return null
  }

  const totalElementos = projects.reduce((sum, p) => sum + (p._count?.elementos || 0), 0)

  const stats = [
    { label: "Proyectos Activos", value: projects.length.toString(), icon: FolderKanban, color: "bg-blue-500" },
    { label: "Elementos Calculados", value: totalElementos.toString(), icon: Calculator, color: "bg-orange-500" },
    { label: "Materiales en Catálogo", value: materialCount.toString(), icon: Box, color: "bg-green-500" },
    { label: "Presupuesto Total", value: formatCurrency(0), icon: TrendingUp, color: "bg-purple-500" },
  ]

  const recentProjects = projects.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bienvenido, {session.user.name || "Usuario"}</h1>
          <p className="text-muted-foreground mt-1">
            Plan {(session.user as any).plan} • {session.user.email}
          </p>
        </div>
        <Link href="/proyectos/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${action.color}`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{action.name}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Proyectos Recientes</h2>
              <Link href="/proyectos" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            {recentProjects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentProjects.map((project) => (
                  <Link key={project.id} href={`/proyectos/${project.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{project.nombre}</CardTitle>
                            <p className="text-sm text-muted-foreground">{project.cliente}</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Activo
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Elementos calculados</span>
                          <span className="font-medium">{project._count?.elementos || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Creación</span>
                          <span className="font-medium">{new Date(project.createdAt).toLocaleDateString("es-BO")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8 border-dashed">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No hay proyectos aún</h3>
                <p className="text-muted-foreground mt-1">Crea tu primer proyecto para comenzar</p>
                <Link href="/proyectos/nuevo" className="mt-4 inline-block">
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Crear proyecto</Button>
                </Link>
              </Card>
            )}
          </div>
        </>
      )}

      {session.user.plan === "FREE" && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Actualiza a Plan PRO</h3>
                <p className="text-muted-foreground mt-1">
                  Accede a las 10 calculadoras, proyectos ilimitados, cronograma Gantt, 
                  exportación PDF/Excel y banco de precios GMLP completo.
                </p>
              </div>
              <Button className="w-full md:w-auto" variant="default">
                Ver planes - desde $19/mes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}