"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { Users2, Mail, Plus, Trash2, Edit3, Check, Loader2, UserPlus, AlertCircle, Lock, Building2, ShieldCheck, FolderKanban, Crown, ArrowRight, Sparkles, Headset, Info, Calendar, Quote, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useSession } from "next-auth/react"
import { isProActive } from "@/lib/plan"

interface Member {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
}

interface Workspace {
  id: string
  name: string
  members: Member[]
}

export default function EquipoConfigPage() {
  const { data: session, status } = useSession()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [userRole, setUserRole] = useState<string>("MEMBER")
  const [loading, setLoading] = useState(true)

  // Estado cuando no hay workspace: ¿el usuario puede crear uno?
  const [canCreate, setCanCreate] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  
  // Workspace name editing
  const [editingName, setEditingName] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [savingName, setSavingName] = useState(false)

  // Inviting member
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("MEMBER")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")

  // Member management states
  const [actionMemberId, setActionMemberId] = useState<string | null>(null)

  const isPro = isProActive(session?.user as any)

  useEffect(() => {
    if (status === "authenticated" && isPro) {
      loadWorkspace()
    } else if (status === "unauthenticated" || (status === "authenticated" && !isPro)) {
      setLoading(false)
    }
  }, [status, isPro])

  async function loadWorkspace() {
    setLoading(true)
    try {
      const res = await fetch("/api/workspace")
      const data = await res.json()
      if (data?.workspace) {
        setWorkspace(data.workspace)
        setWorkspaceName(data.workspace.name)
        setUserRole(data.role)
      } else {
        setCanCreate(Boolean(data?.canCreate))
      }
    } catch (e) {
      console.error("Error cargando workspace:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (newWorkspaceName.trim().length < 2) return
    setCreating(true)
    setCreateError("")
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorkspaceName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || "No se pudo crear el espacio de trabajo.")
      } else {
        setWorkspace(data.workspace)
        setWorkspaceName(data.workspace.name)
        setUserRole(data.role || "ADMIN")
      }
    } catch (e) {
      setCreateError("Error de conexión al servidor.")
    } finally {
      setCreating(false)
    }
  }

  const isAdmin = userRole === "ADMIN"

  async function handleSaveWorkspaceName() {
    if (!workspace || workspaceName.trim().length < 2) return
    setSavingName(true)
    try {
      const res = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName.trim() })
      })
      if (res.ok) {
        setWorkspace({ ...workspace, name: workspaceName.trim() })
        setEditingName(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingName(false)
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError("")
    setInviteSuccess("")
    try {
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error || "Ocurrió un error inesperado al invitar al miembro.")
      } else {
        setInviteSuccess("¡Miembro añadido exitosamente al equipo!")
        setInviteEmail("")
        // Recargar miembros en la UI
        if (workspace) {
          setWorkspace({
            ...workspace,
            members: [...workspace.members, data]
          })
        }
      }
    } catch (e) {
      setInviteError("Error de conexión al servidor.")
    } finally {
      setInviting(false)
    }
  }

  async function handleChangeRole(memberId: string, newRole: string) {
    setActionMemberId(memberId)
    try {
      const res = await fetch("/api/workspace/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole })
      })
      if (res.ok) {
        const updated = await res.json()
        if (workspace) {
          setWorkspace({
            ...workspace,
            members: workspace.members.map(m => m.id === memberId ? updated : m)
          })
        }
      } else {
        const data = await res.json()
        alert(data.error || "No se pudo cambiar el rol.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionMemberId(null)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("¿Estás seguro de que deseas remover a este miembro del espacio de trabajo? Perderá acceso a todos los proyectos compartidos.")) return
    setActionMemberId(memberId)
    try {
      const res = await fetch(`/api/workspace/members?memberId=${memberId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        if (workspace) {
          setWorkspace({
            ...workspace,
            members: workspace.members.filter(m => m.id !== memberId)
          })
        }
      } else {
        const data = await res.json()
        alert(data.error || "No se pudo eliminar al miembro.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionMemberId(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Redirigir a los usuarios con plan FREE o no autenticados a la pantalla persuasiva
  if (!session || !isPro) {
    return <TeamUpsell />
  }

  // Sin workspace pero con permiso activo: permitir crear uno (auto-servicio)
  if (!workspace && canCreate) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <PageHeader
          title="Crear mi Equipo"
          description="Aún no tienes un espacio de trabajo. Crea el de tu empresa para empezar a colaborar."
          icon={<Users2 className="h-7 w-7 text-primary" />}
          backHref="/configuracion"
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Nuevo Espacio de Trabajo
            </CardTitle>
            <CardDescription>
              Serás el administrador de la organización y podrás invitar a tu equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Nombre de la Organización</Label>
                <Input
                  id="workspaceName"
                  placeholder="Constructora Ejemplo S.R.L."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  disabled={creating}
                  required
                />
              </div>

              {createError && (
                <div className="flex items-start gap-2 bg-destructive/15 text-destructive p-3 rounded-md text-xs border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={creating || newWorkspaceName.trim().length < 2}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Espacio de Trabajo
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sin workspace y sin permiso: pantalla persuasiva para invitar a habilitar el módulo de Equipo
  if (!workspace) {
    return <TeamUpsell />
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Mi Equipo y Espacio de Trabajo"
        description="Gestiona los miembros de tu empresa, colaboradores y permisos del sistema"
        icon={<Users2 className="h-7 w-7 text-primary" />}
        backHref="/configuracion"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Workspace Details */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Espacio de Trabajo</CardTitle>
              <CardDescription>Detalles de tu organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Organización</Label>
                {editingName && isAdmin ? (
                  <div className="flex gap-2">
                    <Input 
                      value={workspaceName} 
                      onChange={e => setWorkspaceName(e.target.value)} 
                      disabled={savingName}
                    />
                    <Button size="icon" onClick={handleSaveWorkspaceName} disabled={savingName}>
                      {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border bg-slate-900/40 p-2.5 rounded-md">
                    <span className="font-semibold text-sm">{workspace.name}</span>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditingName(true)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Label className="text-xs text-muted-foreground">Tu Rol</Label>
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isAdmin ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {userRole === "ADMIN" ? "Administrador de Organización" : "Miembro de Organización"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invite Member Card */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Invitar Miembro</CardTitle>
                <CardDescription>Añade un colega a tu equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@constructora.com"
                        className="pl-9"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Ingeniero / Miembro</SelectItem>
                        <SelectItem value="ADMIN">Co-Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {inviteError && (
                    <div className="flex items-start gap-2 bg-destructive/15 text-destructive p-3 rounded-md text-xs border border-destructive/20">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{inviteError}</span>
                    </div>
                  )}

                  {inviteSuccess && (
                    <div className="flex items-start gap-2 bg-green-500/15 text-green-400 p-3 rounded-md text-xs border border-green-500/20">
                      <Check className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{inviteSuccess}</span>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={inviting}>
                    {inviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Invitando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Miembro
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Members Management Table */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Miembros del Equipo</CardTitle>
              <CardDescription>Colaboradores con acceso a este Espacio de Trabajo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha de Unión</TableHead>
                      {isAdmin && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workspace.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.user.name || <span className="text-muted-foreground italic">Sin nombre registrado</span>}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.user.email}</TableCell>
                        <TableCell>
                          {isAdmin && member.user.id !== workspace.members[0].user.id ? (
                            <Select
                              value={member.role}
                              onValueChange={(val) => handleChangeRole(member.id, val)}
                              disabled={actionMemberId === member.id}
                            >
                              <SelectTrigger className="h-8 w-[110px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                                <SelectItem value="MEMBER">MEMBER</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${member.role === "ADMIN" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                              {member.role}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(member.createdAt), "dd MMM yyyy", { locale: es })}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            {member.user.id !== workspace.members[0].user.id ? ( // No borrar al administrador principal
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/15"
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={actionMemberId === member.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Pantalla de venta (upsell) para el plan Free / sin permiso de Equipo      */
/* -------------------------------------------------------------------------- */

const TEAM_BENEFITS = [
  {
    icon: UserPlus,
    title: "Invita a todo tu equipo",
    desc: "Suma ingenieros, presupuestistas y socios a un mismo espacio y trabajen juntos sin duplicar planillas.",
  },
  {
    icon: FolderKanban,
    title: "Proyectos compartidos",
    desc: "Todos ven y editan los presupuestos de la empresa en tiempo real. Nada se queda en una sola computadora.",
  },
  {
    icon: ShieldCheck,
    title: "Roles y permisos",
    desc: "Define quién es Administrador y quién Miembro. Tú controlas quién puede invitar, editar o eliminar.",
  },
  {
    icon: Crown,
    title: "Todo el Plan Pro incluido",
    desc: "Las 14 calculadoras, proyectos ilimitados, exportación sin límites y precios referenciales integrados.",
  },
]

export function TeamUpsell() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-16 px-4">
      {/* Header */}
      <PageHeader
        title="Colaboración y Espacios de Trabajo"
        description="Lleva la productividad de tu constructora al siguiente nivel colaborando en tiempo real"
        icon={<Users2 className="h-7 w-7 text-primary" />}
        backHref="/configuracion"
      />

      {/* Hero + Mockup */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 lg:items-center w-full max-w-full overflow-hidden">
        {/* Copy Persuasivo (Left) */}
        <div className="space-y-6 lg:w-1/2 order-2 lg:order-1 text-left w-full">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Productividad Sin Límites
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Multiplica la eficiencia de tu constructora{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">colaborando en tiempo real.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Deja atrás las hojas de cálculo individuales y las discrepancias de precios. El módulo de Equipo te permite centralizar el control de costos de tus obras en un único espacio seguro en la nube.
            </p>
          </div>

          {/* Beneficios Clave */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {TEAM_BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-3 bg-card/40 border border-border/60 p-3 rounded-lg hover:border-primary/40 hover:bg-card/85 transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Captura de Pantalla Premium (Right) */}
        <div className="lg:w-1/2 order-1 lg:order-2 w-full max-w-full min-w-0 overflow-hidden px-1">
          <div className="relative w-full max-w-[500px] mx-auto overflow-hidden sm:overflow-visible">
            {/* Glow decorativo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-violet-500/20 blur-2xl rounded-2xl -z-10" />
            
            {/* Imagen del Mockup */}
            <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl shadow-black/40 w-full max-w-full">
              <img
                src="/team_workspace_mockup.png"
                alt="Vista previa de Workspace de Equipo"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ maxWidth: "500px", width: "100%" }}
              />
              
              {/* Overlay de Candado / Premium */}
              <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-slate-950/20" style={{ maxWidth: "100%" }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-background/90 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <span className="mt-3 rounded-full bg-background/90 px-3.5 py-1 text-xs font-bold text-foreground shadow-lg tracking-wide border border-border">
                  MÓDULO DE COLABORACIÓN PREMIUM
                </span>
              </div>
            </div>

            {/* Badge flotante interactivo */}
            <div className="absolute -bottom-4 -right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-border/80 flex items-center gap-3 shadow-xl max-w-[280px] hidden sm:flex">
              <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                <CheckCircle2 className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground">Sincronización en la Nube</p>
                <p className="text-[10px] text-muted-foreground">Cambios instantáneos y control de versiones automático.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Comparativa de Planes */}
      <Card className="border-border/80 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold">¿Qué incluye la función de Equipo?</CardTitle>
          <CardDescription>Compara el plan básico individual con las capacidades del plan corporativo.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full table-fixed text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-2 sm:p-4 font-bold text-foreground w-[40%] whitespace-normal break-words">Característica</th>
                  <th className="p-2 sm:p-4 font-bold text-center text-muted-foreground w-[30%] whitespace-normal break-words">Plan Personal (FREE)</th>
                  <th className="p-2 sm:p-4 font-bold text-center text-primary w-[30%] bg-primary/5 whitespace-normal break-words">Plan Equipo (Premium)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Colaboradores</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">1 usuario</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Usuarios Ilimitados</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Sincronización en Tiempo Real</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">No disponible (Local)</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Sí, en la Nube</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Proyectos y Presupuestos</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">Límite de 1 proyecto</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Proyectos Ilimitados</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Roles y Permisos Granulares</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">—</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Admin, Colaborador, Auditor</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Base de Materiales Compartida</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">Individual por computadora</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Compartida para toda la Empresa</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial de Cliente */}
      <div className="bg-muted/30 border border-border/80 rounded-xl p-8 max-w-4xl mx-auto text-center relative overflow-hidden">
        <Quote className="h-10 w-10 text-primary/20 absolute -top-2 -left-2 rotate-180" />
        <p className="text-base sm:text-lg italic text-muted-foreground leading-relaxed relative z-10">
          "Desde que habilitamos el módulo de equipo en nuestra constructora, pudimos centralizar todos los presupuestos de obra. Ya no tenemos planillas duplicadas y todo el equipo edita en tiempo real. ¡Altamente recomendado para agilizar los cierres de licitaciones!"
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-violet-500 text-white font-bold text-sm shadow">
            RS
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground">Ing. Roberto Silva</h4>
            <p className="text-xs text-muted-foreground">Gerente de Operaciones · Constructora Alfa</p>
          </div>
        </div>
      </div>

      {/* Informative Alert for Admins / User activation */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card">
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex items-start gap-4 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 mt-1">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                ¿Cómo activar esta funcionalidad?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Actualmente, el <span className="font-bold text-foreground">administrador de tu sistema</span> es el único que puede habilitar esta opción para tu cuenta de usuario desde el panel de control. Muy pronto, la habilitación se procesará de forma automática al realizar el pago del módulo.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 pt-2 border-t border-border/40 text-center w-full">
            <span className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Headset className="h-3.5 w-3.5 shrink-0" />
              ¿Tienes dudas? Contacta a soporte para más información.
            </span>
            <Link href="/precios" className="w-full max-w-[280px] block">
              <Button size="lg" className="w-full gap-2 font-bold">
                Ver planes y precios
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
