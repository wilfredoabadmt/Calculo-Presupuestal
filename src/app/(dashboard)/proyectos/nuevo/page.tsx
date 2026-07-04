"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Building2, Calendar, Users, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NuevoProyectoPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    nombre: "",
    cliente: "",
    empresa: "",
    fecha: new Date().toISOString().split("T")[0],
    validez: 30,
    moneda: "Bs.",
    descripcion: "",
    presupuesto: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del proyecto es requerido"
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = "Mínimo 3 caracteres"
    }

    if (!formData.cliente.trim()) {
      newErrors.cliente = "El cliente es requerido"
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = "La empresa es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    if (!validate()) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const projectId = "new-" + Date.now()
      router.push(`/proyectos/${projectId}`)
    } catch {
      setServerError("Error al crear el proyecto. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Proyecto</h1>
          <p className="text-muted-foreground">Configura los datos básicos de tu proyecto de construcción</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>Datos básicos para identificar el proyecto en presupuestos y reportes</CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form id="proyecto-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Proyecto *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Edificio Los Andes"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  className={cn(errors.nombre && "border-destructive")}
                />
                {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  placeholder="Ej: Constructora ABC SRL"
                  value={formData.cliente}
                  onChange={(e) => handleChange("cliente", e.target.value)}
                  className={cn(errors.cliente && "border-destructive")}
                />
                {errors.cliente && <p className="text-sm text-destructive">{errors.cliente}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa Ejecutora *</Label>
              <Input
                id="empresa"
                placeholder="Ej: Mi Empresa Constructora"
                value={formData.empresa}
                onChange={(e) => handleChange("empresa", e.target.value)}
                className={cn(errors.empresa && "border-destructive")}
              />
              {errors.empresa && <p className="text-sm text-destructive">{errors.empresa}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de Inicio</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange("fecha", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validez">Validez (días)</Label>
                <Input
                  id="validez"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.validez}
                  onChange={(e) => handleChange("validez", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda</Label>
                <select
                  id="moneda"
                  value={formData.moneda}
                  onChange={(e) => handleChange("moneda", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Bs.">Bolivianos (Bs.)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presupuesto">Presupuesto Estimado</Label>
                <Input
                  id="presupuesto"
                  type="number"
                  placeholder="0"
                  value={formData.presupuesto || ""}
                  onChange={(e) => handleChange("presupuesto", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                rows={3}
                placeholder="Detalles del proyecto, ubicación, observaciones..."
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Link href="/proyectos">
            <Button variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Button type="submit" form="proyecto-form" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Proyecto"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-primary bg-primary/5">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Próximo paso: Calculadoras
          </h3>
          <p className="text-muted-foreground mb-4">
            Una vez creado el proyecto, podrás agregar elementos constructivos usando nuestras 10 calculadoras especializadas:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            {[
              "Concreto", "Paredes", "Columnas", "Vigas", "Losas",
              "Cimientos", "Muros", "Techos", "Pisos", "Cielos Rasos"
            ].map((calc, i) => (
              <span key={calc} className={`px-3 py-1 rounded-full text-center ${i < 3 ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary'}`}>
                {calc} {i < 3 && <span className="ml-1">✓</span>}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Los 3 primeros (Concreto, Paredes, Pisos) son gratuitos en el plan FREE.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}