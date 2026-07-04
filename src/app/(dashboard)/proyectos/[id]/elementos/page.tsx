"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchInput } from "@/components/shared/SearchInput"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Boxes, Plus, Trash2, Calculator, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Elemento {
  id: string
  tipoElemento: string
  descripcion: string
  cantidad: number
  costoTotal: number
}

export default function ElementosPage() {
  const params = useParams()
  const projectId = params.id as string
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [elementos, setElementos] = useState<Elemento[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/proyectos/${projectId}/elementos`)
      .then(r => r.json())
      .then(data => {
        setElementos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  const filtered = elementos.filter(e =>
    e.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    e.tipoElemento.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/proyectos/${projectId}/elementos/${deleteId}`, { method: "DELETE" })
      setElementos(prev => prev.filter(e => e.id !== deleteId))
      setDeleteId(null)
    } catch {
      alert("Error al eliminar")
    }
    setDeleting(false)
  }

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
        title="Elementos del Presupuesto"
        description="Elementos constructivos calculados"
        backHref={`/proyectos/${projectId}`}
        icon={<Boxes className="h-7 w-7 text-primary" />}
        actions={
          <Link href={`/proyectos/${projectId}/calculadora`}>
            <Button><Plus className="mr-2 h-4 w-4" /> Agregar Elemento</Button>
          </Link>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Elementos ({filtered.length})</CardTitle>
          <SearchInput value={search} onChange={setSearch} className="w-64" />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Boxes className="h-12 w-12" />}
              title="No hay elementos"
              description="Agrega elementos usando las calculadoras"
              action={
                <Link href={`/proyectos/${projectId}/calculadora`}>
                  <Button><Calculator className="mr-2 h-4 w-4" /> Ir a Calculadoras</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(el => (
                    <TableRow key={el.id}>
                      <TableCell className="font-medium">{el.tipoElemento}</TableCell>
                      <TableCell>{el.descripcion}</TableCell>
                      <TableCell className="text-right">{el.cantidad}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(el.costoTotal)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(el.id)} disabled={deleting}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex justify-between items-center">
            <span className="font-medium">Total Presupuesto:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(filtered.reduce((sum, e) => sum + e.costoTotal, 0))}
            </span>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Eliminar elemento"
        description="¿Estás seguro de eliminar este elemento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
