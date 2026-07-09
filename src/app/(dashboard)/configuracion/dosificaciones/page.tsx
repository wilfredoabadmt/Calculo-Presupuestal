"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { Beaker, Plus, Edit, Trash2, Loader2 } from "lucide-react"

interface DosificacionConcreto {
  id: string
  ratio: string
  resistencia: number
  cementoKg: number
  arenaM3: number
  gravaM3: number
  aguaLt: number
}

interface DosificacionMortero {
  id: string
  ratio: string
  cementoKg: number
  arenaM3: number
  aguaLt: number
}

export default function DosificacionesPage() {
  const [concreto, setConcreto] = useState<DosificacionConcreto[]>([])
  const [mortero, setMortero] = useState<DosificacionMortero[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/dosificaciones?tipo=concreto").then(r => r.json()),
      fetch("/api/dosificaciones?tipo=mortero").then(r => r.json()),
    ]).then(([c, m]) => {
      setConcreto(Array.isArray(c) ? c : [])
      setMortero(Array.isArray(m) ? m : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

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
        title="Dosificaciones"
        description="Tablas de dosificación de concreto y mortero"
        backHref="/configuracion"
        icon={<Beaker className="h-7 w-7 text-primary" />}
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Nueva Dosificación</Button>}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dosificaciones de Concreto ({concreto.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ratio</TableHead>
                  <TableHead className="text-right">Resist. (kg/cm²)</TableHead>
                  <TableHead className="text-right">Cemento (kg/m³)</TableHead>
                  <TableHead className="text-right">Arena (m³/m³)</TableHead>
                  <TableHead className="text-right">Grava (m³/m³)</TableHead>
                  <TableHead className="text-right">Agua (lt/m³)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concreto.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium">{d.ratio}</TableCell>
                    <TableCell className="text-right">{d.resistencia}</TableCell>
                    <TableCell className="text-right">{d.cementoKg}</TableCell>
                    <TableCell className="text-right">{d.arenaM3}</TableCell>
                    <TableCell className="text-right">{d.gravaM3}</TableCell>
                    <TableCell className="text-right">{d.aguaLt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dosificaciones de Mortero ({mortero.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ratio</TableHead>
                  <TableHead className="text-right">Cemento (kg/m³)</TableHead>
                  <TableHead className="text-right">Arena (m³/m³)</TableHead>
                  <TableHead className="text-right">Agua (lt/m³)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mortero.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium">{d.ratio}</TableCell>
                    <TableCell className="text-right">{d.cementoKg}</TableCell>
                    <TableCell className="text-right">{d.arenaM3}</TableCell>
                    <TableCell className="text-right">{d.aguaLt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
