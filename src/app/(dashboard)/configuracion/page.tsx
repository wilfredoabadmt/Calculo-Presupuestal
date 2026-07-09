"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/shared/PageHeader"
import { Settings, Save, Box, DollarSign, Percent, CheckCircle } from "lucide-react"
import Link from "next/link"

const defaultConfig = {
  moneda: "Bs.",
  iva: 14.94,
  impuestoIT: 3.09,
  cargasSociales: 55,
  gastosGenerales: 15,
  utilidad: 10,
  desperdicio: 5,
  pesoBolsaCemento: 42.5,
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState(defaultConfig)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedConfig = localStorage.getItem("app-config")
    if (savedConfig) {
      setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) })
    }
  }, [])

  function handleSave() {
    localStorage.setItem("app-config", JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Parámetros generales del sistema"
        icon={<Settings className="h-7 w-7 text-primary" />}
        actions={
          <Button onClick={handleSave}>
            {saved ? <CheckCircle className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            {saved ? "Guardado" : "Guardar Cambios"}
          </Button>
        }
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
              <Input value={config.moneda} onChange={e => setConfig({...config, moneda: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>IVA (%)</Label>
              <Input type="number" step="0.01" value={config.iva} onChange={e => setConfig({...config, iva: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Impuesto IT (%)</Label>
              <Input type="number" step="0.01" value={config.impuestoIT} onChange={e => setConfig({...config, impuestoIT: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Cargas Sociales (%)</Label>
              <Input type="number" step="0.01" value={config.cargasSociales} onChange={e => setConfig({...config, cargasSociales: parseFloat(e.target.value) || 0})} />
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
              <Input type="number" step="0.01" value={config.gastosGenerales} onChange={e => setConfig({...config, gastosGenerales: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Utilidad (%)</Label>
              <Input type="number" step="0.01" value={config.utilidad} onChange={e => setConfig({...config, utilidad: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Desperdicio Default (%)</Label>
              <Input type="number" value={config.desperdicio} onChange={e => setConfig({...config, desperdicio: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Peso Bolsa Cemento (kg)</Label>
              <Input type="number" step="0.1" value={config.pesoBolsaCemento} onChange={e => setConfig({...config, pesoBolsaCemento: parseFloat(e.target.value) || 42.5})} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Box className="h-5 w-5" /> Atajos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/configuracion/equipo">
              <Button variant="outline" className="w-full justify-start">Mi Equipo y Espacio de Trabajo</Button>
            </Link>
            <Link href="/configuracion/dosificaciones">
              <Button variant="outline" className="w-full justify-start">Gestionar Dosificaciones</Button>
            </Link>
            <Link href="/configuracion/cuenta">
              <Button variant="outline" className="w-full justify-start">Mi Cuenta</Button>
            </Link>
            <Link href="/materiales/precios">
              <Button variant="outline" className="w-full justify-start">Banco de Precios Referenciales</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
