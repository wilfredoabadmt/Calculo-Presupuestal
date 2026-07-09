"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Calculator, 
  Home, 
  Layers,
  Box,
  Maximize,
  Minimize,
  Triangle,
  Grid,
  Square,
  RectangleHorizontal,
  Lock,
  ArrowRight,
  Droplets
} from "lucide-react"
import { isProActive } from "@/lib/plan"

const calculators = [
  { 
    id: "concreto", 
    name: "Concreto", 
    icon: Box, 
    desc: "Columnas, vigas, losas, cimientos",
    free: true,
    formulas: ["Volumen = a × b × h", "Cemento, Arena, Grava, Agua", "Conversión a bolsas, barriles, galones"]
  },
  { 
    id: "pared", 
    name: "Paredes", 
    icon: RectangleHorizontal, 
    desc: "Bloques, ladrillos, repello, afinado",
    free: true,
    formulas: ["Bloques = Área × Unid/m²", "Pega, Repello, Afinado", "Mortero por dosificación"]
  },
  { 
    id: "columna", 
    name: "Columnas", 
    icon: Maximize, 
    desc: "Concreto + Acero longitudinal + Estribos",
    free: false,
    formulas: ["Acero longitudinal con/sin traslape", "Estribos por zonas (confinada, central, nudos)", "Peso total acero en kg"]
  },
  { 
    id: "viga", 
    name: "Vigas", 
    icon: Minimize, 
    desc: "Concreto + Acero (+)/(-) + Estribos",
    free: false,
    formulas: ["Refuerzo superior e inferior", "Estribos zonas confinada/central", "Volumen concreto"]
  },
  { 
    id: "losa", 
    name: "Losas", 
    icon: Grid, 
    desc: "Macizas, aligeradas, bovedillas, electromalla",
    free: false,
    formulas: ["Acero 4 direcciones (Xa, Xb, Ya, Yb)", "Bovedillas cerámicas", "Electromalla 6x6"]
  },
  { 
    id: "cimiento", 
    name: "Cimientos", 
    icon: Home, 
    desc: "Corridos, zapatas, piedra, mortero",
    free: false,
    formulas: ["Volumen = base × altura × largo", "Separación piedra / mortero %", "Dosificación mortero"]
  },
  { 
    id: "muro", 
    name: "Muros Piedra", 
    icon: Layers, 
    desc: "Muros de contención, ciclópeos",
    free: false,
    formulas: ["Volumen = ((C+B)/2) × H × L", "Piedra % + Mortero %", "Dosificación por m³"]
  },
  { 
    id: "techo", 
    name: "Techos", 
    icon: Triangle, 
    desc: "Tejas, láminas, área real pendiente",
    free: false,
    formulas: ["Área real = √(L²+H²) × A", "Tejas por m² según tipo", "Desperdicio configurable"]
  },
  { 
    id: "piso", 
    name: "Pisos", 
    icon: Square, 
    desc: "Cerámica, porcelanato, adhesivo, boquilla",
    free: true,
    formulas: ["Piezas y cajas", "Adhesivo por m²/rendimiento", "Boquilla por m²/rendimiento"]
  },
  { 
    id: "cielo", 
    name: "Cielos Rasos", 
    icon: Maximize, 
    desc: "Paneles, viguetas, omega, ángulo perimetral",
    free: false,
    formulas: ["Paneles con redondeo", "Viguetas y omegas por separación", "Ángulo perimetral"]
  },
  { 
    id: "pared-concreto", 
    name: "Paredes de Concreto", 
    icon: Building2, 
    desc: "Paredes de concreto simple y armado con rebar",
    free: false,
    formulas: ["Volumen = A × L × E", "Cemento, Arena, Grava, Agua", "% de Acero por densidad"]
  },
  { 
    id: "pared-drywall", 
    name: "Paredes Drywall", 
    icon: Layers, 
    desc: "Paredes de panel yeso, parantes, canales y tornillos",
    free: false,
    formulas: ["Placas de yeso de 1.22x2.44m", "Parantes y canales metálicos", "Tornillos para estructura y panel"]
  },
  { 
    id: "pintura", 
    name: "Pintura", 
    icon: Droplets, 
    desc: "Pintura por área, manos, lados y rendimiento",
    free: true,
    formulas: ["Área total = A × Manos × Lados", "Rendimiento m²/litro", "Litros y galones necesarios"]
  },
  { 
    id: "zocalo", 
    name: "Zócalos", 
    icon: Square, 
    desc: "Zócalos cerámicos/rodapié por metro lineal",
    free: false,
    formulas: ["Tiras cortadas por pieza cerámica", "Cajas de cerámica", "Pegamento y boquilla por m²"]
  },
]

export default function CalculadoraSelectorPage() {
  const params = useParams()
  const router = useRouter() // Wait, let's keep router if it's there
  const projectId = params.id as string
  const { data: session } = useSession()
  const isPro = isProActive(session?.user as any)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href={`/proyectos/${projectId}`} className="text-sm text-muted-foreground hover:text-foreground mb-1 block">
            ← Volver al proyecto
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Seleccionar Calculadora</h1>
          <p className="text-muted-foreground">
            {isPro ? "Acceso completo a las 14 calculadoras" : "Plan Free: 4 calculadoras disponibles · Plan Pro: las 14 completas"}
          </p>
        </div>
        {!isPro && (
          <Link href="/precios">
            <Button className="gap-2 font-bold">
              Desbloquear Pro
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {calculators.map((calc) => {
          const locked = calc.free === false && !isPro
          return (
            <Link 
              key={calc.id} 
              href={locked ? "/precios" : `/proyectos/${projectId}/calculadora/${calc.id}`}
            >
              <Card className={`h-full transition-all duration-300 cursor-pointer border-l-4 group ${
                locked 
                  ? "border-muted hover:border-primary/50 opacity-75 hover:opacity-100" 
                  : "border-primary hover:shadow-lg"
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg transition-colors ${
                      locked 
                        ? "bg-muted group-hover:bg-primary/10" 
                        : "bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground"
                    }`}>
                      <calc.icon className={`h-6 w-6 ${locked ? "text-muted-foreground" : "text-primary group-hover:text-primary-foreground"}`} />
                    </div>
                    {calc.free ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">Gratis</span>
                    ) : locked ? (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Pro
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full font-medium">Pro</span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{calc.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{calc.desc}</p>
                  <div className="pt-2 border-t space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Fórmulas principales:</p>
                    {calc.formulas.map((f, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${locked ? "bg-muted-foreground/30" : "bg-primary/50"}`} />
                        {f}
                      </p>
                    ))}
                  </div>
                  {locked && (
                    <div className="pt-2">
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        Desbloquear con Pro <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="border-primary bg-primary/5">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ¿Cómo funciona?
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span> Selecciona el tipo de elemento</li>
            <li className="flex gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span> Ingresa las dimensiones y parámetros</li>
            <li className="flex gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</span> El sistema calcula materiales y costos automáticamente</li>
            <li className="flex gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">4</span> Guarda el elemento en tu proyecto</li>
            <li className="flex gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">5</span> Genera el presupuesto consolidado</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
