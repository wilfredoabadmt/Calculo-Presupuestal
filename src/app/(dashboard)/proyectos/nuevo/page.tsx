"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/shared/PageHeader"
import { isProActive } from "@/lib/plan"
import { 
  Loader2, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  AlertCircle,
  Lock,
  Crown,
  Ruler,
  FileText,
  FileSpreadsheet,
  Quote,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function NuevoProyectoPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

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

  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)

  useEffect(() => {
    async function checkLimit() {
      try {
        const res = await fetch("/api/proyectos")
        if (res.ok) {
          const data = await res.json()
          setProjectCount(data.length)
        }
      } catch (e) {
        console.error("Error al cargar contador de proyectos:", e)
      } finally {
        setLoadingCount(false)
      }
    }
    if (status === "authenticated") {
      checkLimit()
    } else if (status === "unauthenticated") {
      setLoadingCount(false)
    }
  }, [status])

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
      const res = await fetch("/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          cliente: formData.cliente,
          empresa: formData.empresa,
          fecha: formData.fecha,
          validez: parseInt(String(formData.validez)) || 30,
          moneda: formData.moneda,
          descripcion: formData.descripcion,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Error al crear el proyecto")
      }
      const proyecto = await res.json()
      router.push(`/proyectos/${proyecto.id}`)
    } catch (err: any) {
      setServerError(err.message || "Error al crear el proyecto. Intenta de nuevo.")
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

  if (status === "loading" || loadingCount) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const isPro = isProActive(session?.user as any)
  const limitReached = !isPro && projectCount !== null && projectCount >= 1

  if (limitReached) {
    return <ProyectoLimitUpsell />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nuevo Proyecto</h1>
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

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
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
          <Link href="/proyectos" className="w-full sm:flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <Button type="submit" form="proyecto-form" disabled={isLoading} className="w-full sm:flex-1">
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
            Una vez creado el proyecto, podrás agregar elementos constructivos usando nuestras 14 calculadoras especializadas:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            {[
              "Concreto", "Paredes", "Pisos", "Pintura", "Columnas",
              "Vigas", "Losas", "Cimientos", "Muros", "Techos"
            ].map((calc) => {
              const gratis = ["Concreto", "Paredes", "Pisos", "Pintura"].includes(calc)
              return (
                <span key={calc} className={`px-3 py-1 rounded-full text-center ${gratis ? 'bg-green-100 text-green-800' : 'bg-primary/10 text-primary'}`}>
                  {calc} {gratis && <span className="ml-1">✓</span>}
                </span>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            4 calculadoras (Concreto, Paredes, Pisos, Pintura) son gratuitas en el plan FREE.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function ProyectoLimitUpsell() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-16 px-4">
      {/* Header */}
      <PageHeader
        title="Límite de Proyectos Alcanzado"
        description="El plan FREE está limitado a 1 proyecto. Desbloquea proyectos ilimitados y funciones profesionales."
        icon={<Lock className="h-7 w-7 text-primary" />}
        backHref="/proyectos"
      />

      {/* Hero + Mockup */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 lg:items-center w-full max-w-full overflow-hidden">
        {/* Copy Persuasivo (Left) */}
        <div className="space-y-6 lg:w-1/2 order-2 lg:order-1 text-left w-full">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Acceso Profesional Ilimitado
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Crea proyectos ilimitados y{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">automatiza tus licitaciones.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              ¿Estás limitado a un solo proyecto activo? Con el Plan Pro puedes crear y administrar todas tus obras simultáneamente, sincronizar cómputos métricos con cronogramas Gantt y generar el Formulario B-1 oficial de licitación.
            </p>
          </div>

          {/* Beneficios Clave */}
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {[
              {
                icon: Building2,
                title: "Proyectos Ilimitados",
                desc: "Crea y administra múltiples obras y presupuestos a la vez, ideal para comparar opciones de diseño o cotizar varios clientes.",
                stat: "Sin límites",
                statLabel: "de almacenamiento",
              },
              {
                icon: Ruler,
                title: "Las 14 Calculadoras",
                desc: "Desbloquea cálculos para Columnas, Vigas, Losas, Cimientos, Muros de Contención, Drywall, Cielos Rasos y Zócalos.",
                stat: "14 calculadoras",
                statLabel: "técnicas completas",
              },
              {
                icon: FileText,
                title: "Formulario B-1 Oficial",
                desc: "Genera automáticamente las planillas de APU oficiales en PDF listas para carpetas de licitación del SICOES.",
                stat: "SICOES Bolivia",
                statLabel: "100% compatible",
              },
              {
                icon: Calendar,
                title: "Gantt y Curva S",
                desc: "Planifica plazos de obra, calcula la ruta crítica y monitorea la inversión acumulada sincronizada con tus presupuestos.",
                stat: "Control total",
                statLabel: "financiero y plazos",
              },
            ].map((b) => (
              <div key={b.title} className="flex gap-3 bg-card/40 border border-border/60 p-3 rounded-lg hover:border-primary/40 hover:bg-card/85 transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-xs font-bold text-primary">{b.stat}</span>
                    <span className="text-[10px] text-muted-foreground">{b.statLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prueba Social Rápida */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/40">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-violet-500/80 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                  {["CM", "LS", "RV", "AP"][i - 1]}
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">+1,200 ingenieros</span> ya calculan sin límites con el plan Pro
            </div>
          </div>
        </div>

        {/* Captura de Pantalla Premium (Right) */}
        <div className="lg:w-1/2 order-1 lg:order-2 w-full max-w-full min-w-0 overflow-hidden px-1">
          <div className="relative w-full max-w-[500px] mx-auto overflow-hidden sm:overflow-visible">
            {/* Glow decorativo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-violet-500/20 blur-2xl rounded-2xl -z-10" />
            
            {/* Imagen del Mockup */}
            <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl shadow-black/40 w-full max-w-full">
              <img
                src="/team_workspace_mockup.png"
                alt="Proyectos Ilimitados Premium"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ maxWidth: "500px", width: "100%" }}
              />
              
              {/* Overlay de Candado / Premium */}
              <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-slate-950/20" style={{ maxWidth: "100%" }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-background/90 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <span className="mt-3 rounded-full bg-background/90 px-3.5 py-1 text-xs font-bold text-foreground shadow-lg tracking-wide border border-border">
                  PLAN PROFESIONAL PRO
                </span>
              </div>
            </div>

            {/* Badge flotante interactivo */}
            <div className="absolute -bottom-4 -right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-border/80 flex items-center gap-3 shadow-xl max-w-[280px] hidden sm:flex">
              <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                <CheckCircle2 className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-foreground">Proyectos Ilimitados</p>
                <p className="text-[10px] text-muted-foreground">Prepara y archiva todas tus propuestas en un solo lugar.</p>
              </div>
            </div>

            {/* Badge de urgencia */}
            <div className="absolute -top-3 -left-3 bg-red-500/90 backdrop-blur-md p-2 rounded-lg flex items-center gap-2 shadow-xl hidden sm:flex">
              <AlertCircle className="h-4 w-4 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Límite Superado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Comparativa de Planes */}
      <Card className="border-border/80 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold">Compara: Plan Free vs. Plan Pro</CardTitle>
          <CardDescription>Conoce los límites y ventajas técnicas de cada plan</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full table-fixed text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-2 sm:p-4 font-bold text-foreground w-[40%] whitespace-normal break-words">Funcionalidad</th>
                  <th className="p-2 sm:p-4 font-bold text-center text-muted-foreground w-[30%] whitespace-normal break-words">
                    Plan Free
                    <span className="block text-[10px] text-muted-foreground mt-0.5">Límite alcanzado</span>
                  </th>
                  <th className="p-2 sm:p-4 font-bold text-center text-primary w-[30%] bg-primary/5 whitespace-normal break-words">
                    Plan Pro
                    <span className="block text-[10px] text-primary/70 mt-0.5">Recomendado</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="bg-red-500/5">
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">
                    <span className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-red-500" />
                      Proyectos Activos
                    </span>
                  </td>
                  <td className="p-2 sm:p-4 text-center whitespace-normal break-words font-semibold text-red-500">
                    Máximo 1 proyecto
                  </td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ilimitados
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Calculadoras Técnicas</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">Solo 4 básicas</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Las 14 calculadoras</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Formulario B-1 Oficial APU</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">No disponible</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Sí, exportación PDF ilimitada</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Cronograma Gantt y Curva S</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">No disponible</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Habilitado en tiempo real</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Importación/Exportación Excel</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">No disponible</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Excel bidireccional</td>
                </tr>
                <tr>
                  <td className="p-2 sm:p-4 font-medium text-foreground whitespace-normal break-words">Workspaces de Equipo</td>
                  <td className="p-2 sm:p-4 text-center text-muted-foreground whitespace-normal break-words">No disponible</td>
                  <td className="p-2 sm:p-4 text-center text-foreground font-semibold bg-primary/5 whitespace-normal break-words">Hasta 5 miembros</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial de Cliente */}
      <div className="bg-muted/30 border border-border/80 rounded-xl p-8 max-w-4xl mx-auto text-center relative overflow-hidden">
        <Quote className="h-10 w-10 text-primary/20 absolute -top-2 -left-2 rotate-180" />
        <p className="text-base sm:text-lg italic text-muted-foreground leading-relaxed relative z-10">
          "La capacidad de tener todos nuestros proyectos guardados en la nube y listos para exportar como Formulario B-1 nos ahorra días enteros de trabajo administrativo."
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-violet-500 text-white font-bold text-sm shadow">
            CM
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground">Ing. Carlos Mendoza</h4>
            <p className="text-xs text-muted-foreground">Director de Proyectos · Constructora Andes SRL</p>
            <p className="text-[10px] text-primary font-medium">Cliente Pro</p>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Crown className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground">Desbloquea el Plan Pro hoy mismo</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Por solo Bs. 137 al mes, accede a proyectos ilimitados y todas las herramientas de cálculo y reportes del sistema.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/proyectos">
              <Button variant="outline" className="w-full sm:w-auto">
                Volver a Proyectos
              </Button>
            </Link>
            <Link href="/precios">
              <Button className="w-full sm:w-auto gap-2 font-bold">
                Ver planes y precios
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}