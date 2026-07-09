"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { Users2, Mail, Plus, Trash2, Edit3, Check, Loader2, UserPlus, AlertCircle, Lock, Building2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

  useEffect(() => {
    loadWorkspace()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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

  // Sin workspace y sin permiso: invitar a contratar el módulo de Equipo
  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Función de Equipo</h2>
            <p className="text-muted-foreground mb-6">
              La colaboración en equipo es una función adicional. Contáctate con el
              administrador para habilitarla en tu cuenta y crear tu espacio de trabajo.
            </p>
            <Link href="/precios">
              <Button className="w-full gap-2 font-bold">
                Ver planes y precios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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
