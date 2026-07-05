"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/shared/SearchInput"
import { Users, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Usuario {
  id: string
  name: string | null
  email: string
  role: string
  plan: string
  createdAt: string
  _count?: { proyectos: number }
}

export default function UsuariosPage() {
  const [search, setSearch] = useState("")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then(r => r.json())
      .then(data => {
        setUsuarios(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = usuarios.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administración de usuarios del sistema"
        icon={<Users className="h-7 w-7 text-primary" />}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuarios ({filtered.length})</CardTitle>
          <SearchInput value={search} onChange={setSearch} className="w-64" />
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
                    <TableHead>Rol</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Proyectos</TableHead>
                    <TableHead>Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {search ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name || "-"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${u.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-muted"}`}>
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${u.plan === "PRO" ? "bg-green-100 text-green-800" : "bg-muted"}`}>
                            {u.plan}
                          </span>
                        </TableCell>
                        <TableCell>{u._count?.proyectos || 0}</TableCell>
                        <TableCell>{format(new Date(u.createdAt), "dd MMM yyyy", { locale: es })}</TableCell>
                      </TableRow>
                    ))
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
