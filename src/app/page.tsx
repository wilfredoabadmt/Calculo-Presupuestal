import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Building, FileText, Calendar, BarChart, Users, Shield, Zap, Check, ArrowRight, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Industrial/Construction aesthetic */}
      <section className="relative overflow-hidden border-b-4 border-primary">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-sm text-sm font-bold uppercase tracking-wider mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
              </span>
              Sistema Web v2.0 — Freemium
            </div>

            {/* Headline - Specific, benefit-focused */}
            <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.05]">
              Calcula presupuestos de{" "}
              <span className="text-primary underline decoration-4 decoration-primary/30 underline-offset-8">
                construcción
              </span>{" "}
              en minutos
            </h1>

            {/* Subheadline - Pain point + solution */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Deja de perder horas con Excel. Sistema profesional con{" "}
              <strong className="text-foreground">10 calculadoras</strong>,{" "}
              <strong className="text-foreground">36,000+ ítems GMLP</strong> y{" "}
              <strong className="text-foreground">cronograma Gantt</strong>.{" "}
              Gratis para empezar.
            </p>

            {/* CTAs - Primary + Secondary */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-base gap-2 font-bold shadow-lg shadow-primary/20">
                  <Zap className="h-5 w-5" />
                  Crear Cuenta Gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base gap-2 font-bold">
                  Ya tengo cuenta — Iniciar Sesión
                </Button>
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-600" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-600" />
                3 calculadoras gratis
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-600" />
                Cancela cuando quieras
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-border pt-8">
            {[
              { value: "10", label: "Calculadoras", sub: "especializadas" },
              { value: "36K+", label: "Ítems GMLP", sub: "pre-cargados" },
              { value: "Bs.", label: "Moneda", sub: "bolivianos" },
              { value: "100%", label: "Web", sub: "sin instalar" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-sm font-semibold text-foreground mt-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain/Solution Section */}
      <section className="py-20 lg:py-28 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-3">El problema</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              ¿Cansado de calcular presupuestos a mano?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los ingenieros y constructores bolivianos pierden <strong>8-12 horas por proyecto</strong> 
              copiando datos entre hojas de cálculo. Hay una mejor manera.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before */}
            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                  <span className="text-2xl">❌</span> Sin nuestro sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2"><span className="text-destructive">•</span> Horas copiando fórmulas en Excel</div>
                <div className="flex items-start gap-2"><span className="text-destructive">•</span> Errores de cálculo en materiales</div>
                <div className="flex items-start gap-2"><span className="text-destructive">•</span> Sin GMLP para comparar precios</div>
                <div className="flex items-start gap-2"><span className="text-destructive">•</span> Cronograma manual en PowerPoint</div>
                <div className="flex items-start gap-2"><span className="text-destructive">•</span> Sin reportes profesionales</div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2 text-lg">
                  <span className="text-2xl">✅</span> Con Cálculo Presupuestal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2"><span className="text-green-600">•</span> 10 calculadoras con fórmulas exactas</div>
                <div className="flex items-start gap-2"><span className="text-green-600">•</span> Cálculos automáticos verificados</div>
                <div className="flex items-start gap-2"><span className="text-green-600">•</span> 946 ítems GMLP integrados</div>
                <div className="flex items-start gap-2"><span className="text-green-600">•</span> Gantt interactivo con Curva S</div>
                <div className="flex items-start gap-2"><span className="text-green-600">•</span> Export PDF y Excel en un clic</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features - How it works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Cómo funciona</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              3 pasos para tu primer presupuesto
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            {[
              { step: "01", title: "Crea tu proyecto", desc: "Regístrate gratis y crea un proyecto con datos del cliente y empresa.", icon: Building },
              { step: "02", title: "Calcula materiales", desc: "Usa las 10 calculadoras para obtener materiales, cantidades y costos exactos.", icon: Calculator },
              { step: "03", title: "Exporta resultados", desc: "Genera PDFs profesionales, Excel, cronograma Gantt y Curva S.", icon: FileText },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-extrabold text-primary/10 mb-4">{item.step}</div>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Calculator Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                10 Calculadoras Especializadas
              </h2>
              <p className="text-lg text-muted-foreground">
                Cada una replica las fórmulas exactas del sistema PlugCAD
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: "Concreto", free: true },
                { name: "Paredes", free: true },
                { name: "Columnas", free: false },
                { name: "Vigas", free: false },
                { name: "Losas", free: false },
                { name: "Cimientos", free: false },
                { name: "Muros", free: false },
                { name: "Techos", free: false },
                { name: "Pisos", free: true },
                { name: "Cielos", free: false },
              ].map((calc) => (
                <div
                  key={calc.name}
                  className="relative p-4 border-2 border-border rounded-lg text-center hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="font-semibold text-sm">{calc.name}</div>
                  <div className={`text-xs mt-1 font-bold ${calc.free ? "text-green-600" : "text-primary"}`}>
                    {calc.free ? "GRATIS" : "PRO"}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/register">
                <Button className="gap-2 font-bold">
                  Prueba gratis — 3 calculadoras incluidas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 lg:py-28 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Confianza</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Diseñado para profesionales bolivianos
            </h2>
            <p className="text-lg text-muted-foreground">
              Basado en el sistema PlugCAD con normas SABS y precios GMLP 2007
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Precios Oficiales", desc: "Base GMLP 2007 con 946 ítems para licitaciones públicas" },
              { icon: Users, title: "Multi-usuario", desc: "Rol admin y usuario estándar con permisos por proyecto" },
              { icon: Star, title: "Export Profesional", desc: "PDFs con formato oficial, Excel editable, Gantt interactivo" },
            ].map((item) => (
              <Card key={item.title} className="text-center border-0 shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Planes</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Empieza gratis, escala cuando necesites
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-lg">Plan Free</CardTitle>
                <div className="text-4xl font-extrabold text-foreground mt-2">$0</div>
                <p className="text-sm text-muted-foreground">Para siempre</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "3 calculadoras (Concreto, Paredes, Pisos)",
                  "1 proyecto activo",
                  "Export PDF limitado (5/mes)",
                  "Catálogo de materiales",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                <Link href="/register" className="block mt-6">
                  <Button variant="outline" className="w-full font-bold">
                    Crear cuenta gratis
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
                <div className="text-4xl font-extrabold text-foreground mt-2">$19<span className="text-lg font-normal text-muted-foreground">/mes</span></div>
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
                <Link href="/register" className="block mt-6">
                  <Button className="w-full font-bold gap-2">
                    Empezar Plan Pro
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4">
            ¿Listo para calcular más rápido?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Únete a ingenieros y constructores que ya ahorran horas por proyecto.
            Sin tarjeta de crédito. Cancela cuando quieras.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-4 font-bold">
              <Zap className="h-5 w-5" />
              Crear Cuenta Gratis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-3 text-foreground">Cálculo Presupuestal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sistema profesional para cálculo de materiales, presupuestos y APU de construcción en Bolivia.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Calculadoras</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Concreto</li>
                <li>Paredes y Bloques</li>
                <li>Columnas y Vigas</li>
                <li>Losas y Cimientos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground">Crear Cuenta</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Iniciar Sesión</Link></li>
                <li>Precios</li>
                <li>Documentación</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacidad</li>
                <li>Términos</li>
                <li>Contacto</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cálculo Presupuestal. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
