import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Building, FileText, Calendar, BarChart, Users, Shield, Zap } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Calculator,
      title: "10 Calculadoras Especializadas",
      description: "Concreto, paredes, columnas, vigas, losas, cimientos, muros, techos, pisos y cielos rasos con fórmulas exactas del sistema PlugCAD",
    },
    {
      icon: Building,
      title: "Presupuestos Completos",
      description: "Estructura por módulos (Obras Preliminares, Obra Gruesa, Obra Fina, Instalaciones) con APU detallado",
    },
    {
      icon: FileText,
      title: "Computos Métricos",
      description: "Mediciones detalladas por ejes y zonas con exportación a Excel y PDF profesional",
    },
    {
      icon: Calendar,
      title: "Cronograma Gantt Interactivo",
      description: "Diagrama de Gantt con drag-and-drop, ruta crítica y curva S de inversión",
    },
    {
      icon: BarChart,
      title: "Análisis de Precios Unitarios (APU)",
      description: "Desglose completo: Materiales + Mano de Obra + Cargas Sociales + IVA + Equipo + Gastos Generales + Utilidad + IT",
    },
    {
      icon: Users,
      title: "Banco de Precios GMLP 2007",
      description: "36,000+ ítems pre-cargados con análisis completo para licitaciones públicas bolivianas",
    },
    {
      icon: Shield,
      title: "Multi-moneda y Localización",
      description: "Configurado nativamente en Bolivianos (Bs.) con soporte para normas SABS y licitaciones bolivianas",
    },
    {
      icon: Zap,
      title: "Freemium - Inicio Gratis",
      description: "Plan gratuito con 3 calculadoras básicas. Pro ilimitado desde $19/mes",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nuevo: Sistema Web Profesional - Freemium
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-slide-in">
              Calcula presupuestos de construcción en minutos, no en horas
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-in" style={{ animationDelay: '100ms' }}>
              Sistema web profesional para cálculo de materiales, análisis de precios unitarios (APU), 
              computos métricos y cronogramas de obra. Basado en el sistema PlugCAD con 36,000+ ítems GMLP.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in" style={{ animationDelay: '200ms' }}>
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto gap-2" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                  <Zap className="h-5 w-5" />
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                  Ver Características
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="text-center p-4">
              <div className="text-3xl lg:text-4xl font-bold text-primary">10</div>
              <div className="text-sm text-muted-foreground">Calculadoras</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl lg:text-4xl font-bold text-primary">36K+</div>
              <div className="text-sm text-muted-foreground">Ítems GMLP</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl lg:text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Bolivianos (Bs.)</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl lg:text-4xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Proyectos Pro</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas para tus proyectos de construcción
            </h2>
            <p className="text-lg text-muted-foreground">
              Desde el cálculo de una viga hasta el presupuesto completo de un edificio con cronograma Gantt
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculadoras Preview */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Calculadoras disponibles
            </h2>
            <p className="text-lg text-muted-foreground">
              Cada calculadora replica las fórmulas exactas del sistema PlugCAD con esquemas visuales guía
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: "Concreto", icon: Building, desc: "Columnas, vigas, losas", free: true },
              { name: "Paredes", icon: Building, desc: "Bloques, ladrillos, repello", free: true },
              { name: "Columnas", icon: Building, desc: "Acero + concreto + estribos", free: false },
              { name: "Vigas", icon: Building, desc: "Acero (+)/(-) + estribos", free: false },
              { name: "Losas", icon: Building, desc: "Macizas y aligeradas", free: false },
              { name: "Cimientos", icon: Building, desc: "Corridos, zapatas, piedra", free: false },
              { name: "Muros Piedra", icon: Building, desc: "Muros de contención", free: false },
              { name: "Techos", icon: Building, desc: "Teja, lámina, pendiente", free: false },
              { name: "Pisos", icon: Building, desc: "Cerámica, porcelanato", free: true },
              { name: "Cielos Rasos", icon: Building, desc: "Drywall, viguetas, omega", free: false },
            ].map((calc, index) => (
              <Card key={calc.name} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-primary">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <calc.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">{calc.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{calc.desc}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    calc.free 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {calc.free ? 'Gratis' : 'Pro'}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Acceder a todas las calculadoras
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Listo para optimizar tus presupuestos?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Únete a cientos de ingenieros y constructores que ya calculan más rápido y preciso.
            Sin tarjeta de crédito. Cancela cuando quieras.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-4">
              Crear cuenta gratis
              <Zap className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Cálculo Presupuestal</h3>
              <p className="text-sm text-muted-foreground">
                Sistema profesional para cálculo de materiales, presupuestos y APU de construcción.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Calculadoras</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Concreto</Link></li>
                <li><Link href="#" className="hover:text-foreground">Paredes</Link></li>
                <li><Link href="#" className="hover:text-foreground">Columnas</Link></li>
                <li><Link href="#" className="hover:text-foreground">Vigas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Documentación</Link></li>
                <li><Link href="#" className="hover:text-foreground">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-foreground">Términos</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 Cálculo Presupuestal. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}