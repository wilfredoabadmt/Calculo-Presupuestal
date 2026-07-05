"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { 
  Users, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Calendar, 
  CreditCard 
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Usuario {
  id: string
  name: string | null
  email: string
  role: string
  plan: string
  planExpiresAt: string | null
  createdAt: string
  _count?: { proyectos: number }
}

export default function UsuariosPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then(r => r.json())
      .then(data => {
        setUsuarios(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleTogglePlan = async (userId: string, isActivating: boolean) => {
    setUpdatingId(userId)
    try {
      const nextPlan = isActivating ? "PRO" : "FREE"
      const expiresAt = isActivating 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
        : null

      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: nextPlan,
          planExpiresAt: expiresAt,
        }),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        setUsuarios(usuarios.map(u => 
          u.id === userId 
            ? { ...u, plan: updatedUser.plan, planExpiresAt: updatedUser.planExpiresAt } 
            : u
        ))
      } else {
        alert("Error al actualizar el plan del usuario.")
      }
    } catch {
      alert("Error al conectar con el servidor.")
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = usuarios.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // Calculations for Admin Stats
  const totalUsers = usuarios.length
  const freeUsers = usuarios.filter(u => u.plan === "FREE").length
  const proUsers = usuarios.filter(u => u.plan === "PRO").length
  
  const activeProUsers = usuarios.filter(u => {
    if (u.plan !== "PRO") return false
    if (!u.planExpiresAt) return true // Standard PRO without expiry (like admin)
    return new Date(u.planExpiresAt) >= new Date()
  }).length

  const expiredProUsers = proUsers - activeProUsers

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administración de usuarios, planes y control mensual de pagos"
        icon={<Users className="h-7 w-7 text-primary" />}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : totalUsers}</div>
            <p className="text-xs text-muted-foreground">Cuentas registradas en total</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cuentas FREE</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : freeUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios en el plan gratuito</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PRO Activas (Al día)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : activeProUsers}</div>
            <p className="text-xs text-muted-foreground">Mensualidad cancelada y activa</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PRO Suspendidas (Mora)</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "-" : expiredProUsers}</div>
            <p className="text-xs text-muted-foreground">Mensualidad vencida / impago</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Usuarios del Sistema ({filtered.length})</CardTitle>
          <SearchInput value={search} onChange={setSearch} className="w-full sm:w-64" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Detalles de Cuenta</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Vencimiento Suscripción</TableHead>
                    <TableHead>Mensualidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {search ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(u => {
                      const isCurrentUser = u.email === session?.user?.email
                      
                      // Subscription payment calculations
                      let statusText = "Gratuito"
                      let statusBadgeClass = "bg-slate-100 text-slate-700 border-slate-200"
                      let isExpired = false

                      if (u.plan === "PRO") {
                        if (!u.planExpiresAt) {
                          statusText = "Activo (Sin Expiración)"
                          statusBadgeClass = "bg-green-100 text-green-800 border-green-200"
                        } else {
                          const expiryDate = new Date(u.planExpiresAt)
                          if (expiryDate >= new Date()) {
                            statusText = `Activo`
                            statusBadgeClass = "bg-green-100 text-green-800 border-green-200"
                          } else {
                            statusText = "Suspendido (Mora)"
                            statusBadgeClass = "bg-red-100 text-red-800 border-red-200"
                            isExpired = true
                          }
                        }
                      }

                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || "-"}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-semibold ${u.plan === "PRO" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"}`}>
                                Plan {u.plan}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Rol: {u.role} • Proyectos: {u._count?.proyectos || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(u.createdAt), "dd MMM yyyy", { locale: es })}</TableCell>
                          <TableCell>
                            {u.planExpiresAt ? (
                              <div className="flex items-center gap-1.5 text-sm text-foreground">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{format(new Date(u.planExpiresAt), "dd MMM yyyy", { locale: es })}</span>
                              </div>
                            ) : u.plan === "PRO" ? (
                              <span className="text-xs text-muted-foreground italic">Permanente</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
                              {statusText}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {isCurrentUser ? (
                              <span className="text-xs text-muted-foreground italic">Tú (Actual)</span>
                            ) : updatingId === u.id ? (
                              <Button disabled size="sm" variant="outline">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </Button>
                            ) : u.plan === "FREE" || isExpired ? (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                                onClick={() => handleTogglePlan(u.id, true)}
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                Activar PRO
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="font-bold gap-1.5"
                                onClick={() => handleTogglePlan(u.id, false)}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Desactivar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

