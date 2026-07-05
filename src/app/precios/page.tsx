import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-foreground">
            Cálculo Presupuestal
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-bold">Crear Cuenta Gratis</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Planes y Precios</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            Elige el plan perfecto para ti
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empieza gratis y escala cuando tu negocio lo necesite.
            Sin sorpresas. Sin compromisos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {/* Free */}
          <Card className="relative shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Plan Free</CardTitle>
              <div className="text-5xl font-extrabold text-foreground mt-2">$0</div>
              <p className="text-sm text-muted-foreground">Para siempre • Sin tarjeta</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "3 calculadoras (Concreto, Paredes, Pisos)",
                "1 proyecto activo",
                "Export PDF limitado (5/mes)",
                "Catálogo básico de materiales",
                "Soporte por email",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              <Link href="/register" className="block mt-8">
                <Button variant="outline" className="w-full font-bold" size="lg">
                  Empezar Gratis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="relative border-2 border-primary shadow-lg shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-sm text-xs font-bold uppercase tracking-wider">
              Recomendado
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Plan Pro</CardTitle>
              <div className="text-5xl font-extrabold text-foreground mt-2">
                $19<span className="text-lg font-normal text-muted-foreground">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground">Facturación mensual</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Las 10 calculadoras completas",
                "Proyectos ilimitados",
                "Export PDF y Excel ilimitado",
                "946 ítems GMLP integrados",
                "Cronograma Gantt + Curva S",
                "Reportes ejecutivos",
                "Soporte prioritario",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              <Link href="/register" className="block mt-8">
                <Button className="w-full font-bold gap-2" size="lg">
                  Empezar Plan Pro
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
          <div className="space-y-6">
            {[
              {
                q: "¿Qué incluye el plan Free?",
                a: "Acceso a 3 calculadoras (Concreto, Paredes, Pisos), 1 proyecto activo y exportación PDF limitada. Sin tiempo de expiración.",
              },
              {
                q: "¿Puedo cambiar de plan en cualquier momento?",
                a: "Sí. Puedes actualizar o cancelar tu plan cuando quieras. Los cambios se aplican inmediatamente.",
              },
              {
                q: "¿Qué moneda utilizan los precios GMLP?",
                a: "Todos los precios están en Bolivianos (Bs.), basados en la Guía de Materiales y Mano de Obra (GMLP) 2007 oficial de Bolivia.",
              },
              {
                q: "¿Necesito instalar algo?",
                a: "No. El sistema es 100% web. Solo necesitas un navegador moderno y conexión a internet.",
              },
              {
                q: "¿Puedo exportar a PDF y Excel?",
                a: "El plan Free incluye 5 exports PDF/mes. El plan Pro incluye exportación ilimitada a PDF y Excel con formato profesional.",
              },
            ].map((item) => (
              <div key={item.q} className="border border-border rounded-lg p-5">
                <h3 className="font-bold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
