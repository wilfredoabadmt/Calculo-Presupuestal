"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/shared/PageHeader"
import { Settings, Save, Box, DollarSign, Percent } from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Parámetros generales del sistema"
        icon={<Settings className="h-7 w-7 text-primary" />}
        actions={<Button><Save className="mr-2 h-4 w-4" /> Guardar Cambios</Button>}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Moneda e Impuestos</CardTitle>
            <CardDescription>Configuración de moneda y porcentajes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Moneda Default</Label>
              <Input defaultValue="Bs." />
            </div>
            <div className="space-y-2">
              <Label>IVA (%)</Label>
              <Input type="number" defaultValue="14.94" />
            </div>
            <div className="space-y-2">
              <Label>Impuesto IT (%)</Label>
              <Input type="number" defaultValue="3.09" />
            </div>
            <div className="space-y-2">
              <Label>Cargas Sociales (%)</Label>
              <Input type="number" defaultValue="55" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" /> Porcentajes AIU</CardTitle>
            <CardDescription>Administración, Imprevistos y Utilidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Gastos Generales (%)</Label>
              <Input type="number" defaultValue="15" />
            </div>
            <div className="space-y-2">
              <Label>Utilidad (%)</Label>
              <Input type="number" defaultValue="10" />
            </div>
            <div className="space-y-2">
              <Label>Desperdicio Default (%)</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label>Peso Bolsa Cemento (kg)</Label>
              <Input type="number" defaultValue="42.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Box className="h-5 w-5" /> Atajos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/configuracion/dosificaciones">
              <Button variant="outline" className="w-full justify-start">Gestionar Dosificaciones</Button>
            </Link>
            <Link href="/configuracion/cuenta">
              <Button variant="outline" className="w-full justify-start">Mi Cuenta</Button>
            </Link>
            <Link href="/materiales/precios">
              <Button variant="outline" className="w-full justify-start">Banco de Precios GMLP</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
