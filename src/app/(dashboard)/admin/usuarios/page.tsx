"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { 
  Users, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  CreditCard,
  MoreVertical,
  Mail,
  Key,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Save,
  Users2,
  Building2
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
  workspaceEnabled: boolean
  workspaceExpiresAt: string | null
  emailVerified: string | null
  createdAt: string
  _count?: { proyectos: number }
}

export default function UsuariosPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState("")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Deletion States
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  // Password Change States
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  
  // Toast Notification State
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Workspace / Equipo settings
  const [wsUpdatingId, setWsUpdatingId] = useState<string | null>(null)
  const [wsPrice, setWsPrice] = useState<string>("")
  const [wsCurrency, setWsCurrency] = useState<string>("USD")
  const [savingPrice, setSavingPrice] = useState(false)

  const triggerSuccessMsg = (msg: string) => {
    setSuccessMsg(msg)
    const timer = setTimeout(() => {
      setSuccessMsg(null)
    }, 4000)
    return () => clearTimeout(timer)
  }

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then(r => r.json())
      .then(data => {
        setUsuarios(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data?.priceMonthly !== undefined) setWsPrice(String(data.priceMonthly))
        if (data?.currency) setWsCurrency(data.currency)
      })
      .catch(() => {})
  }, [])

  const handleSavePrice = async () => {
    const parsed = Number(wsPrice)
    if (!Number.isFinite(parsed) || parsed < 0) {
      alert("Ingresa un precio mensual válido")
      return
    }
    setSavingPrice(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceMonthly: parsed, currency: wsCurrency }),
      })
      if (res.ok) {
        const data = await res.json()
        setWsPrice(String(data.priceMonthly))
        setWsCurrency(data.currency)
        triggerSuccessMsg("Precio del módulo de Equipo actualizado.")
      } else {
        alert("Error al guardar el precio.")
      }
    } catch {
      alert("Error de conexión al servidor.")
    } finally {
      setSavingPrice(false)
    }
  }

  const handleToggleWorkspace = async (userId: string, isActivating: boolean) => {
    setWsUpdatingId(userId)
    try {
      const expiresAt = isActivating
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
        : null

      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceEnabled: isActivating,
          workspaceExpiresAt: expiresAt,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setUsuarios(usuarios.map(u =>
          u.id === userId
            ? { ...u, workspaceEnabled: updated.workspaceEnabled, workspaceExpiresAt: updated.workspaceExpiresAt }
            : u
        ))
        triggerSuccessMsg(
          isActivating ? "Función de Equipo activada (+30 días)." : "Función de Equipo desactivada."
        )
      } else {
        alert("Error al actualizar la función de Equipo.")
      }
    } catch {
      alert("Error al conectar con el servidor.")
    } finally {
      setWsUpdatingId(null)
    }
  }

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
        triggerSuccessMsg(`Plan actualizado a ${updatedUser.plan} con éxito.`)
      } else {
        alert("Error al actualizar el plan del usuario.")
      }
    } catch {
      alert("Error al conectar con el servidor.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMailAction = async (userId: string, actionType: "resendVerification" | "resendPasswordReset") => {
    setUpdatingId(userId)
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType }),
      })

      if (res.ok) {
        const data = await res.json()
        triggerSuccessMsg(data.message || "Correo enviado exitosamente.")
      } else {
        alert("Error al enviar el correo.")
      }
    } catch {
      alert("Error al conectar con el servidor.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleChangePassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setChangingPassword(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changePassword", newPassword }),
      })

      if (res.ok) {
        const data = await res.json()
        triggerSuccessMsg(data.message || "Contraseña cambiada exitosamente.")
        setPasswordUserId(null)
        setNewPassword("")
        setShowNewPassword(false)
      } else {
        const data = await res.json()
        alert(data.error || "Error al cambiar la contraseña.")
      }
    } catch {
      alert("Error al conectar con el servidor.")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${deleteId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setUsuarios(usuarios.filter(u => u.id !== deleteId))
        setDeleteId(null)
        triggerSuccessMsg("Usuario eliminado del sistema correctamente.")
      } else {
        const data = await res.json()
        alert(data.error || "Error al eliminar usuario")
      }
    } catch {
      alert("Error de conexión")
    } finally {
      setDeleting(false)
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
        description="Administración de usuarios, planes, mensualidades, correos y bajas de cuenta"
        icon={<Users className="h-7 w-7 text-primary" />}
      />

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}

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

      {/* Configuración del módulo de Equipo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            Módulo de Equipo — Precio Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="wsPrice" className="text-xs text-muted-foreground">Precio mensual</Label>
              <Input
                id="wsPrice"
                type="number"
                min={0}
                step="0.01"
                value={wsPrice}
                onChange={e => setWsPrice(e.target.value)}
                className="h-9 w-40"
                placeholder="29"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wsCurrency" className="text-xs text-muted-foreground">Moneda</Label>
              <Input
                id="wsCurrency"
                value={wsCurrency}
                onChange={e => setWsCurrency(e.target.value)}
                className="h-9 w-28"
                placeholder="USD"
                maxLength={8}
              />
            </div>
            <Button onClick={handleSavePrice} disabled={savingPrice} className="gap-2 h-9">
              {savingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar precio
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Este precio se muestra en la página pública de precios. Habilita la función por usuario con el botón &quot;Equipo&quot; en la tabla.
          </p>
        </CardContent>
      </Card>

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
                    <TableHead>Contraseña</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Vencimiento Suscripción</TableHead>
                    <TableHead>Correos</TableHead>
                    <TableHead>Mensualidad</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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

                      const isEditingPassword = passwordUserId === u.id

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
                          {/* Password Column */}
                          <TableCell>
                            {isEditingPassword ? (
                              <div className="flex items-center gap-1.5 min-w-[200px]">
                                <div className="relative flex-1">
                                  <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Nueva contraseña"
                                    className="h-8 text-xs pr-8"
                                    disabled={changingPassword}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showNewPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </button>
                                </div>
                                <Button
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleChangePassword(u.id)}
                                  disabled={changingPassword || !newPassword}
                                >
                                  {changingPassword ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2"
                                  onClick={() => { setPasswordUserId(null); setNewPassword(""); setShowNewPassword(false) }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => { setPasswordUserId(u.id); setNewPassword(""); setShowNewPassword(false) }}
                              >
                                <Lock className="h-3 w-3" />
                                Cambiar
                              </Button>
                            )}
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
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${u.emailVerified ? "bg-green-500" : "bg-amber-500"}`} />
                                <span className="text-muted-foreground">Registro:</span>
                                <span className="font-medium">{u.emailVerified ? "Verificado" : "Enviado"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-muted-foreground">Accesos:</span>
                                <span className="font-medium text-foreground">Enviados</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
                              {statusText}
                            </span>
                          </TableCell>
                          {/* Workspace / Equipo Column */}
                          <TableCell>
                            {(() => {
                              const wsActive =
                                u.workspaceEnabled &&
                                (!u.workspaceExpiresAt || new Date(u.workspaceExpiresAt) >= new Date())
                              const wsExpired = u.workspaceEnabled && !wsActive
                              return (
                                <div className="flex flex-col items-start gap-1.5">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                    wsActive
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : wsExpired
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}>
                                    <Users2 className="h-3 w-3" />
                                    {wsActive ? "Activo" : wsExpired ? "Vencido" : "Inactivo"}
                                  </span>
                                  {u.workspaceExpiresAt && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {format(new Date(u.workspaceExpiresAt), "dd MMM yyyy", { locale: es })}
                                    </span>
                                  )}
                                  {!isCurrentUser && (
                                    wsUpdatingId === u.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    ) : wsActive ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-[11px] px-2 text-destructive hover:text-destructive"
                                        onClick={() => handleToggleWorkspace(u.id, false)}
                                      >
                                        Desactivar
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-[11px] px-2 text-emerald-700 hover:text-emerald-700"
                                        onClick={() => handleToggleWorkspace(u.id, true)}
                                      >
                                        Activar
                                      </Button>
                                    )
                                  )}
                                </div>
                              )
                            })()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isCurrentUser ? (
                                <span className="text-xs text-muted-foreground italic mr-2">Tú (Actual)</span>
                              ) : updatingId === u.id ? (
                                <Button disabled size="sm" variant="outline">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </Button>
                              ) : (
                                <>
                                  {u.plan === "FREE" || isExpired ? (
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

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menú</span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem 
                                        className="gap-2 cursor-pointer"
                                        onClick={() => handleMailAction(u.id, "resendVerification")}
                                      >
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Reenviar Verificación
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="gap-2 cursor-pointer"
                                        onClick={() => handleMailAction(u.id, "resendPasswordReset")}
                                      >
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        Restablecer Contraseña
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                        onClick={() => setDeleteId(u.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Eliminar Usuario
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
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

      {/* Confirm User Deletion Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="¿Eliminar usuario?"
        description="Esta acción no se puede deshacer. Se eliminarán permanentemente el usuario, todos sus proyectos, elementos presupuestados, cronogramas y análisis de precios unitarios del sistema."
        onConfirm={handleDeleteUser}
        confirmText={deleting ? "Eliminando..." : "Eliminar"}
      />
    </div>
  )
}
