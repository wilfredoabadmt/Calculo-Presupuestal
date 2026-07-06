import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calculator,
  Building2,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Award,
  Lock,
  Compass,
  Hammer,
  HardHat,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import CalculatorShowcase from "@/components/shared/CalculatorShowcase"

export default async function HomePage() {
  const session = await auth()
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans overflow-x-hidden">
      {/* Background Neon Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all duration-300">
              <HardHat className="h-5 w-5 text-slate-950 font-bold" />
              <div className="absolute inset-0 rounded-lg bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              CÁLCULO PRESUPUESTAL
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-900 font-medium">
                Acceso Profesional
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 transition-all duration-300">
                Iniciar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 flex flex-col items-center">
        {/* Glow Spheres */}
        <div className="absolute top-20 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            Plataforma BIM-Ready · Bolivia
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            La nueva era en{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
              presupuestos de obra
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Optimiza tus licitaciones públicas y proyectos privados con nuestro motor de cálculo inteligente. 
            <strong> 14 calculadoras paramétricas</strong>, integración de base de datos GMLP, y diagramas Gantt interactivos con curva de inversión S.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 px-8 py-6 rounded-xl shadow-xl shadow-cyan-500/20 transition-all duration-300">
                Registrarse Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-bold border-slate-800 bg-slate-900/40 text-slate-200 hover:bg-slate-900 hover:text-white px-8 py-6 rounded-xl transition-all duration-300">
                Acceder al Dashboard
              </Button>
            </Link>
          </div>

          {/* Live CAD simulator preview container */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="text-left mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                SIMULADOR INTERACTIVO EN VIVO
              </span>
              <p className="text-xs text-slate-400 mt-1">Prueba el comportamiento paramétrico introduciendo tus dimensiones abajo:</p>
            </div>
            <CalculatorShowcase />
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-900 pt-12 max-w-3xl mx-auto">
            {[
              { val: "14", label: "Módulos de Cálculo", desc: "Especializados" },
              { val: "36K+", label: "Ítems Bolivianos", desc: "Pre-cargados" },
              { val: "10x", label: "Mayor Velocidad", desc: "vs Hojas de Excel" },
              { val: "100%", label: "Curva S & Gantt", desc: "Automatizados" }
            ].map((m, idx) => (
              <div key={idx} className="group relative p-4 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-all duration-300">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300">
                  {m.val}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">{m.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Futuristic Feature Modules */}
      <section className="py-20 bg-slate-950 relative border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Infraestructura Digital de Alta Precisión
            </h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
              Diseñado específicamente para constructoras profesionales, consultores de ingeniería y entidades gubernamentales en Bolivia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: "Cálculos Paramétricos",
                desc: "Calculadoras automáticas para concreto, columnas, vigas, losas y más con dosificaciones exactas.",
                color: "from-cyan-500 to-blue-500"
              },
              {
                icon: Layers,
                title: "Base GMLP Consolidada",
                desc: "Acceso integrado a más de 36,000 ítems oficiales de construcción para licitaciones públicas rápidas.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: Calendar,
                title: "Diagrama de Gantt & Curva S",
                desc: "Planificación de obra dinámica y cálculo automático del avance de inversión financiera en PDF y Excel.",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((f, i) => (
              <div key={i} className="group relative p-8 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800/80 hover:bg-slate-900/40 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} p-2.5 flex items-center justify-center text-slate-950 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator Grid Display */}
      <section className="py-20 bg-slate-950/50 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">14 Calculadoras de Obra Integradas</h2>
            <p className="text-slate-400 mt-2">Acceso a cálculos paramétricos precisos en cualquier dispositivo sin instalaciones.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Concreto Standard", free: true, spec: "Dosificación cemento/arena" },
              { name: "Paredes de Ladrillo", free: true, spec: "Cómputo piezas y mezcla" },
              { name: "Pisos y Cerámicas", free: true, spec: "Piezas, juntas y pegamento" },
              { name: "Columnas de Hormigón", free: false, spec: "Acero longitudinal y estribos" },
              { name: "Vigas Estructurales", free: false, spec: "Encofrados y fierrería" },
              { name: "Losas de Concreto", free: false, spec: "Aligeradas y macizas" },
              { name: "Cimientos Corridos", free: false, spec: "Hormigón ciclópeo e insumos" },
              { name: "Muros de Contención", free: false, spec: "Piedra y mortero trapezoidal" },
              { name: "Techos y Coberturas", free: false, spec: "Tejas, listones y aleros" },
              { name: "Cielo Raso y Yeso", free: false, spec: "Perfiles y placas drywall" },
              { name: "Pintura y Acabados", free: false, spec: "Rendimiento y manos" },
              { name: "Paredes Drywall", free: false, spec: "Pernos, rieles y masilla" },
              { name: "Paredes de Concreto", free: false, spec: "Armaduras y vaciado" },
              { name: "Zócalos de Acabado", free: false, spec: "Pegamento y piezas lineales" }
            ].map((calc, i) => (
              <div
                key={i}
                className="relative p-5 rounded-xl border border-slate-900 bg-slate-950 hover:border-slate-800 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${calc.free ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"}`}>
                    {calc.free ? "FREE" : "PRO"}
                  </span>
                </div>
                <div className="font-bold text-slate-100 text-sm">{calc.name}</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">{calc.spec}</div>
                <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Calculator className="h-12 w-12 text-white" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 gap-2 font-bold px-6 py-5 rounded-lg transition-colors">
                Verificar Todas las Calculadoras
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison: Enterprise vs Standard */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold">Diseñado para Licitaciones Exigentes</h2>
            <p className="text-slate-400 mt-2">Diferencia técnica frente a métodos de cálculo manuales tradicionales.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-slate-900 bg-slate-900/10 p-6 rounded-2xl relative">
              <h3 className="text-lg font-bold text-slate-400 flex items-center gap-2 mb-6">
                <span className="text-red-500 font-mono">⚡</span> Métodos Tradicionales (Excel)
              </h3>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Copiar y pegar fórmulas propenso a errores humanos fatales.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Sin base de datos oficial actualizada; cotizaciones lentas.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Cronograma desconectado del análisis de materiales del presupuesto.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Reportes inconsistentes o difíciles de exportar a PDF formal.
                </li>
              </ul>
            </Card>

            <Card className="border border-cyan-500/30 bg-cyan-950/10 p-6 rounded-2xl relative shadow-lg shadow-cyan-500/5">
              <div className="absolute top-4 right-4 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                PROFESIONAL
              </div>
              <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-6">
                <span className="text-cyan-400">⚡</span> Motor Cálculo Presupuestal
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Fórmulas estandarizadas y validadas con precisión ingenieril.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Base GMLP integrada para precios referenciales oficiales al instante.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Cronograma Gantt y Curva S sincronizados en base al presupuesto.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Reportes ejecutivos formales listos para licitaciones públicas.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Clear Pricing Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold">Planes Profesionales Sin Comisiones</h2>
            <p className="text-slate-400 mt-2">Empieza a trabajar en tus presupuestos sin costos ocultos.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-300">Acceso Inicial</h3>
                <div className="text-4xl font-extrabold mt-4">Bs. 0</div>
                <p className="text-xs text-slate-500 mt-1">Acceso libre para siempre</p>
                <div className="h-px bg-slate-900 my-6" />
                <ul className="space-y-3 text-sm text-slate-400 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> 3 calculadoras habilitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> 1 proyecto activo simultáneo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Exportación PDF básica
                  </li>
                </ul>
              </div>
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full border-slate-800 hover:bg-slate-900 text-slate-200">
                  Comenzar Gratis
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 flex flex-col justify-between relative shadow-xl shadow-cyan-500/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                Recomendado
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyan-400">Ingeniería Pro</h3>
                <div className="text-4xl font-extrabold mt-4">Bs. 130<span className="text-xs text-slate-400 font-normal"> / mes</span></div>
                <p className="text-xs text-slate-500 mt-1">Facturación mensual simple</p>
                <div className="h-px bg-slate-800/50 my-6" />
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> <strong>Las 10 calculadoras</strong> completas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Proyectos ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Cronograma Gantt y Curva S
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Exportación PDF y Excel ilimitada
                  </li>
                </ul>
              </div>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold shadow-lg shadow-cyan-500/10">
                  Adquirir Plan Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise / Corporate Contact Call */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-900 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <Award className="h-10 w-10 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">¿Representas a una Constructora o Institución Pública?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Ofrecemos capacitación presencial, integración con ERP institucional y parametrización de catálogos municipales personalizados.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold px-8 py-5 rounded-lg">
              Solicitar Demostración Corporativa
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-xs">C</div>
                <span className="font-bold text-sm tracking-widest text-slate-100">CÁLCULO PRESUPUESTAL</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plataforma web avanzada para ingenieros civiles, arquitectos y constructoras en Bolivia.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest mb-4">Módulos</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>Hormigón Estructural</li>
                <li>Muros y Contenciones</li>
                <li>Planificación Gantt</li>
                <li>Exportación BIM-Excel</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest mb-4">Enlaces</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/login" className="hover:text-slate-300">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="hover:text-slate-300">Registro</Link></li>
                <li>Términos del Servicio</li>
                <li>Políticas de Privacidad</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest mb-4">Contacto</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                soporte@calculopresupuestal.com<br />
                La Paz, Bolivia
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 text-center text-[10px] text-slate-600">
            © {new Date().getFullYear()} Cálculo Presupuestal. Todos los derechos reservados. Desarrollado con precisión ingenieril.
          </div>
        </div>
      </footer>
    </div>
  )
}
