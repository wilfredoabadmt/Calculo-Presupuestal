"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormularioMaterialProps {
  onSubmit?: (data: any) => void
}

export function FormularioMaterial({ onSubmit }: FormularioMaterialProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Nuevo Material</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Código</Label><Input placeholder="M-001" /></div>
          <div className="space-y-2"><Label>Nombre</Label><Input placeholder="Cemento CP-40" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Unidad</Label>
            <Select><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>{["kg","m³","m²","ml","lt","bolsa","pza","lote","rolling","hoja"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Precio Unitario</Label><Input type="number" step="0.01" placeholder="0.00" /></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Grupo</Label>
            <Select><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>{["CEMENTO","ARENA","GRAVA","ACERO","BLOQUE","CERAMICA","TEJA","MADERA","YESO","OTROS"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Proveedor</Label><Input placeholder="Opcional" /></div>
        </div>
        <Button className="w-full">Guardar Material</Button>
      </CardContent>
    </Card>
  )
}
