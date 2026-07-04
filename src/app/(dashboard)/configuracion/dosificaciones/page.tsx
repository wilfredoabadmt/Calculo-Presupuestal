"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/shared/PageHeader"
import { Beaker, Plus, Edit, Trash2 } from "lucide-react"

const dosificacionesConcreto = [
  { ratio: "1:2:2", resistencia: 280, cemento: 420, arena: 0.67, grava: 0.67, agua: 190 },
  { ratio: "1:2:2.5", resistencia: 240, cemento: 380, arena: 0.60, grava: 0.76, agua: 180 },
  { ratio: "1:2:3", resistencia: 226, cemento: 350, arena: 0.55, grava: 0.84, agua: 170 },
  { ratio: "1:2:3.5", resistencia: 210, cemento: 320, arena: 0.52, grava: 0.90, agua: 170 },
  { ratio: "1:2:4", resistencia: 200, cemento: 300, arena: 0.48, grava: 0.95, agua: 158 },
  { ratio: "1:2.5:4", resistencia: 189, cemento: 280, arena: 0.55, grava: 0.89, agua: 158 },
  { ratio: "1:3:3", resistencia: 168, cemento: 300, arena: 0.72, grava: 0.72, agua: 158 },
  { ratio: "1:3:4", resistencia: 159, cemento: 260, arena: 0.63, grava: 0.83, agua: 163 },
  { ratio: "1:3:5", resistencia: 140, cemento: 230, arena: 0.55, grava: 0.92, agua: 148 },
  { ratio: "1:3:6", resistencia: 119, cemento: 210, arena: 0.50, grava: 1.00, agua: 143 },
  { ratio: "1:4:7", resistencia: 109, cemento: 175, arena: 0.55, grava: 0.98, agua: 133 },
  { ratio: "1:4:8", resistencia: 99, cemento: 160, arena: 0.55, grava: 1.03, agua: 125 },
]

const dosificacionesMortero = [
  { ratio: "1:2", cemento: 400, arena: 1.00, agua: 200 },
  { ratio: "1:3", cemento: 300, arena: 1.00, agua: 180 },
  { ratio: "1:4", cemento: 240, arena: 1.00, agua: 160 },
  { ratio: "1:5", cemento: 200, arena: 1.00, agua: 150 },
  { ratio: "1:6", cemento: 170, arena: 1.00, agua: 140 },
]

export default function DosificacionesPage() {
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
          <CardTitle>Dosificaciones de Concreto (12)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
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
                {dosificacionesConcreto.map(d => (
                  <TableRow key={d.ratio}>
                    <TableCell className="font-mono font-medium">{d.ratio}</TableCell>
                    <TableCell className="text-right">{d.resistencia}</TableCell>
                    <TableCell className="text-right">{d.cemento}</TableCell>
                    <TableCell className="text-right">{d.arena}</TableCell>
                    <TableCell className="text-right">{d.grava}</TableCell>
                    <TableCell className="text-right">{d.agua}</TableCell>
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
          <CardTitle>Dosificaciones de Mortero (5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
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
                {dosificacionesMortero.map(d => (
                  <TableRow key={d.ratio}>
                    <TableCell className="font-mono font-medium">{d.ratio}</TableCell>
                    <TableCell className="text-right">{d.cemento}</TableCell>
                    <TableCell className="text-right">{d.arena}</TableCell>
                    <TableCell className="text-right">{d.agua}</TableCell>
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
