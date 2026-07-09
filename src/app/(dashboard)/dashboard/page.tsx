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
  Loader2,
  ArrowRight
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist"

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
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("onboarding_completed")
      if (!stored) {
        setShowOnboarding(true)
      } else {
        const data = JSON.parse(stored)
        setShowOnboarding(!data.dismissed)
      }
    } catch {
      setShowOnboarding(true)
    }
  }, [])

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

  const totalPresupuesto = projects.reduce((sum, p) => {
    const totalG = (p as any).presupuesto?.totalGeneral || 0
    const totalD = (p as any).presupuestoDetallado?.totalPresupuesto || 0
    return sum + totalG + totalD
  }, 0)

  const stats = [
    { label: "Proyectos Activos", value: projects.length.toString(), icon: FolderKanban, color: "bg-blue-500" },
    { label: "Elementos Calculados", value: totalElementos.toString(), icon: Calculator, color: "bg-orange-500" },
    { label: "Materiales en Catálogo", value: materialCount.toString(), icon: Box, color: "bg-green-500" },
    { label: "Presupuesto Total", value: formatCurrency(totalPresupuesto), icon: TrendingUp, color: "bg-purple-500" },
  ]

  const recentProjects = projects.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {projects.length === 0 ? "¡Bienvenido!" : `Hola, ${session.user.name?.split(" ")[0] || "Usuario"}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {projects.length === 0
              ? "Comienza calculando presupuestos de construcción"
              : `Plan ${(session.user as any).plan} • ${session.user.email}`
            }
          </p>
        </div>
        <Link href="/proyectos/nuevo">
          <Button className="gap-2 font-bold" size="lg">
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      {/* Onboarding checklist for new users */}
      {showOnboarding && projects.length === 0 && (
        <OnboardingChecklist />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats */}
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

          {/* Quick actions */}
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

          {/* Recent projects or empty state */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Proyectos Recientes</h2>
              {projects.length > 0 && (
                <Link href="/proyectos" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              )}
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
              <Card className="text-center py-12 border-dashed">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Crea tu primer proyecto</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Empieza agregando los datos de tu proyecto de construcción. 
                  Luego usa las calculadoras para obtener materiales y costos exactos.
                </p>
                <Link href="/proyectos/nuevo">
                  <Button size="lg" className="gap-2 font-bold">
                    <Plus className="h-5 w-5" />
                    Crear Proyecto
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Upgrade banner for free users */}
      {session.user.plan === "FREE" && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Actualiza a Plan PRO</h3>
                <p className="text-muted-foreground mt-1">
                  Accede a las 14 calculadoras, proyectos ilimitados, cronograma Gantt,
                  exportación PDF/Excel y banco de precios referenciales completo.
                </p>
              </div>
              <Link href="/precios">
                <Button className="w-full md:w-auto font-bold gap-2" size="lg">
                  Ver planes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
