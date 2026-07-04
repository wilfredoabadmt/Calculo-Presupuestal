"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchInput } from "@/components/shared/SearchInput"
import { Box, Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Material {
  id: string
  codigo: string
  nombre: string
  unidad: string
  precio: number
  grupo: string
}

export default function MaterialesPage() {
  const [search, setSearch] = useState("")
  const [grupoFilter, setGrupoFilter] = useState("TODOS")
  const [materiales, setMateriales] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/materiales")
      .then(r => r.json())
      .then(data => {
        setMateriales(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const grupos = ["TODOS", ...Array.from(new Set(materiales.map(m => m.grupo)))]

  const filtered = materiales.filter(m => {
    const matchSearch = m.nombre.toLowerCase().includes(search.toLowerCase()) || m.codigo.toLowerCase().includes(search.toLowerCase())
    const matchGrupo = grupoFilter === "TODOS" || m.grupo === grupoFilter
    return matchSearch && matchGrupo
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Materiales"
        description="Gestión de materiales y precios de referencia"
        icon={<Box className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Importar</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Material</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Materiales ({filtered.length})</CardTitle>
          <div className="flex gap-2">
            <SearchInput value={search} onChange={setSearch} className="w-64" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {grupos.map(g => (
              <button
                key={g}
                onClick={() => setGrupoFilter(g)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${grupoFilter === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                {g}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Box className="h-12 w-12" />}
              title="No hay materiales"
              description="Agrega materiales al catálogo o importa desde Excel"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono">{m.codigo}</TableCell>
                      <TableCell className="font-medium">{m.nombre}</TableCell>
                      <TableCell>{m.unidad}</TableCell>
                      <TableCell><span className="px-2 py-1 rounded-full text-xs bg-muted">{m.grupo}</span></TableCell>
                      <TableCell className="text-right">{formatCurrency(m.precio)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
