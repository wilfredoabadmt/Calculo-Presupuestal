"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchInput } from "@/components/shared/SearchInput"
import { DollarSign, Upload, Download, Eye } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface BancoPrecio {
  id: string
  actividad: string
  unidad: string
  categoria: string
  precioUnitario: number
}

export default function BancoPreciosPage() {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("TODAS")

  const items: BancoPrecio[] = []
  const categorias = ["TODAS", "GENERALES", "ESTRUCTURAS", "HIDRAULICA", "VIAS_URBANAS"]

  const filtered = items.filter(i => {
    const matchSearch = i.actividad.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === "TODAS" || i.categoria === catFilter
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banco de Precios GMLP"
        description="Base de precios unitarios GMLP 2007 - 36,220+ ítems"
        icon={<DollarSign className="h-7 w-7 text-primary" />}
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Importar Excel</Button>
          </>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ítems del Banco de Precios ({filtered.length})</CardTitle>
          <SearchInput value={search} onChange={setSearch} className="w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categorias.map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${catFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="h-12 w-12" />}
              title="Banco de precios vacío"
              description="Importa la base GMLP 2007 desde un archivo Excel"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">P.U.</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.actividad}</TableCell>
                      <TableCell>{item.unidad}</TableCell>
                      <TableCell><span className="px-2 py-1 rounded-full text-xs bg-muted">{item.categoria}</span></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.precioUnitario)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
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
