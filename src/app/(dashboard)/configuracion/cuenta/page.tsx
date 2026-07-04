"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/shared/PageHeader"
import { User, Save, Shield, CreditCard } from "lucide-react"

export default function CuentaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Cuenta"
        description="Gestiona tu perfil y configuración de cuenta"
        backHref="/configuracion"
        icon={<User className="h-7 w-7 text-primary" />}
        actions={<Button><Save className="mr-2 h-4 w-4" /> Guardar</Button>}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input defaultValue="Usuario" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" defaultValue="usuario@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>Cambiar Contraseña</Label>
              <Input type="password" placeholder="Nueva contraseña" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Plan y Suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Plan FREE</div>
                  <div className="text-sm text-muted-foreground">3 calculadoras · 1 proyecto</div>
                </div>
                <Button size="sm">Upgrade a PRO</Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Calculadoras usadas:</span><span>2 / 3</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Proyectos activos:</span><span>1 / 1</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Exportaciones PDF:</span><span>3 / 5 este mes</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
