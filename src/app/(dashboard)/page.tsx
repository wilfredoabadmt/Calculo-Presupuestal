"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
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
  Users
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

const quickActions = [
  { name: "Nuevo Proyecto", href: "/proyectos/nuevo", icon: Plus, description: "Crear un proyecto de construcción", color: "bg-blue-500" },
  { name: "Calculadora Concreto", href: "/proyectos/nuevo/calculadora/concreto", icon: Calculator, description: "Calcular materiales para concreto", color: "bg-orange-500" },
  { name: "Calculadora Paredes", href: "/proyectos/nuevo/calculadora/pared", icon: Building2, description: "Bloques, ladrillos, repello", color: "bg-green-500" },
  { name: "Ver Materiales", href: "/materiales", icon: Box, description: "Catálogo de materiales y precios", color: "bg-purple-500" },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  
  if (!session?.user) {
    return null // Will redirect via middleware
  }

  // In a real app, we'd fetch from database
  // For now, mock data
  const stats = [
    { label: "Proyectos Activos", value: "3", icon: FolderKanban, color: "bg-blue-500" },
    { label: "Elementos Calculados", value: "47", icon: Calculator, color: "bg-orange-500" },
    { label: "Materiales en Catálogo", value: "156", icon: Box, color: "bg-green-500" },
    { label: "Presupuesto Total", value: formatCurrency(2450000), icon: TrendingUp, color: "bg-purple-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
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

      {/* Stats Cards */}
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

      {/* Quick Actions */}
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

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Proyectos Recientes</h2>
          <Link href="/proyectos" className="text-sm text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Edificio Los Andes", cliente: "Constructora ABC", elementos: 12, total: 1250000, fecha: "2024-01-15" },
            { name: "Casa Residencial Zona Sur", cliente: "Familia García", elementos: 8, total: 450000, fecha: "2024-01-10" },
            { name: "Oficinas Centro Comercial", cliente: "Inmobiliaria XYZ", elementos: 15, total: 3200000, fecha: "2024-01-05" },
          ].map((project) => (
            <Card key={project.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
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
                  <span className="font-medium">{project.elementos}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presupuesto total</span>
                  <span className="font-medium">{formatCurrency(project.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Última actualización</span>
                  <span className="font-medium">{new Date(project.fecha).toLocaleDateString("es-BO")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Plan Upgrade CTA */}
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