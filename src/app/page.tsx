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
  Cpu,
  Award,
  HardHat,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Users2,
  Hourglass,
  Scale,
  Activity,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  FileSpreadsheet,
  Sliders,
  Smartphone,
  Share2
} from "lucide-react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import CalculatorShowcase from "@/components/shared/CalculatorShowcase"
import AnimatedHero from "@/components/home/AnimatedHero"
import LandingHeader from "@/components/layout/LandingHeader"

export default async function HomePage() {
  const session = await auth()
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans overflow-x-hidden">
      {/* Floating Navbar Header */}
      <LandingHeader />

      {/* Animated Video Background & Hero Content */}
      <div id="inicio">
        <AnimatedHero>
          <CalculatorShowcase />
        </AnimatedHero>
      </div>

      {/* Sección de Experiencia */}
      <section id="experiencia" className="py-16 sm:py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-md px-3 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Trayectoria de Precisión en Bolivia
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Respaldando las obras y licitaciones más exigentes
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                Nuestra plataforma consolida el conocimiento técnico de ingeniería civil, automatizando presupuestos complejos y dosificaciones de materiales bajo la normativa de construcción local.
              </p>
              <div className="space-y-3.5">
                {[
                  "Fórmulas paramétricas validadas técnicamente",
                  "Cálculo automatizado de desperdicio por tipo de ítem",
                  "Reportes ejecutivos listos para licitaciones públicas y SICOES"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-cyan-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              {[
                { val: "Bs. 940M+", label: "Presupuestos Calculados", desc: "Volumen financiero estimado", icon: Scale },
                { val: "12,000+", label: "Proyectos Procesados", desc: "Privados y estatales en Bolivia", icon: Building2 },
                { val: "4.8M m³", label: "Hormigón Estimado", desc: "Con dosificaciones exactas", icon: Layers },
                { val: "99.98%", label: "Precisión Paramétrica", desc: "Sin errores de redondeo en APU", icon: Activity }
              ].map((stat, i) => (
                <div key={i} className="p-4 sm:p-6 rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-slate-800/80 hover:bg-slate-900/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{stat.val}</div>
                  <div className="text-xs font-bold text-slate-300 mt-1">{stat.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid de 14 Calculadoras */}
      <section id="calculadoras" className="py-16 sm:py-20 bg-slate-950/50 border-t border-slate-900">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">14 Calculadoras de Obra Integradas</h2>
            <p className="text-slate-400 mt-2">Acceso a cálculos paramétricos precisos en cualquier dispositivo sin instalaciones.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Concreto Standard",
                free: true,
                spec: "Dosificación cemento/arena/grava/agua",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="10" y="20" width="30" height="30" />
                    <line x1="10" y1="20" x2="25" y2="10" />
                    <line x1="40" y1="20" x2="50" y2="10" />
                    <line x1="40" y1="50" x2="50" y2="40" />
                    <rect x="20" y="10" width="30" height="30" strokeDasharray="2,2" />
                    <line x1="10" y1="50" x2="20" y2="40" strokeDasharray="2,2" />
                  </svg>
                )
              },
              {
                name: "Paredes de Ladrillo",
                free: true,
                spec: "Cómputo de piezas, pegas y morteros",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-orange-500/20 group-hover:text-orange-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="5" y="10" width="50" height="40" rx="2" />
                    <line x1="5" y1="23" x2="55" y2="23" />
                    <line x1="5" y1="36" x2="55" y2="36" />
                    <line x1="20" y1="10" x2="20" y2="23" />
                    <line x1="40" y1="10" x2="40" y2="23" />
                    <line x1="10" y1="23" x2="10" y2="36" />
                    <line x1="30" y1="23" x2="30" y2="36" />
                    <line x1="50" y1="23" x2="50" y2="36" />
                    <line x1="20" y1="36" x2="20" y2="50" />
                    <line x1="40" y1="36" x2="40" y2="50" />
                  </svg>
                )
              },
              {
                name: "Pisos y Cerámicas",
                free: true,
                spec: "Piezas, pegamento y juntas",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-emerald-500/20 group-hover:text-emerald-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="8" y="8" width="44" height="44" rx="1" />
                    <line x1="8" y1="22" x2="52" y2="22" />
                    <line x1="8" y1="37" x2="52" y2="37" />
                    <line x1="22" y1="8" x2="22" y2="52" />
                    <line x1="37" y1="8" x2="37" y2="52" />
                  </svg>
                )
              },
              {
                name: "Pintura y Acabados",
                free: true,
                spec: "Rendimiento, áreas y manos",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="15" y="10" width="30" height="40" rx="2" />
                    <path d="M15,25 Q30,30 45,25" />
                    <path d="M15,35 Q30,40 45,35" />
                    <path d="M22,10 L22,50" strokeWidth="0.8" strokeDasharray="1,2" />
                    <path d="M38,10 L38,50" strokeWidth="0.8" strokeDasharray="1,2" />
                  </svg>
                )
              },
              {
                name: "Columnas de Hormigón",
                free: false,
                spec: "Acero longitudinal y estribado",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="20" y="5" width="20" height="50" />
                    <line x1="24" y1="5" x2="24" y2="55" strokeWidth="0.8" strokeDasharray="2,1" />
                    <line x1="36" y1="5" x2="36" y2="55" strokeWidth="0.8" strokeDasharray="2,1" />
                    <rect x="20" y="15" width="20" height="4" strokeWidth="0.8" />
                    <rect x="20" y="27" width="20" height="4" strokeWidth="0.8" />
                    <rect x="20" y="39" width="20" height="4" strokeWidth="0.8" />
                  </svg>
                )
              },
              {
                name: "Vigas Estructurales",
                free: false,
                spec: "Encofrados y armadura de refuerzo",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="5" y="20" width="50" height="20" />
                    <line x1="5" y1="24" x2="55" y2="24" strokeWidth="0.8" strokeDasharray="2,1" />
                    <line x1="5" y1="36" x2="55" y2="36" strokeWidth="0.8" strokeDasharray="2,1" />
                    <line x1="15" y1="20" x2="15" y2="40" strokeWidth="0.8" />
                    <line x1="30" y1="20" x2="30" y2="40" strokeWidth="0.8" />
                    <line x1="45" y1="20" x2="45" y2="40" strokeWidth="0.8" />
                  </svg>
                )
              },
              {
                name: "Losas de Concreto",
                free: false,
                spec: "Aligeradas, macizas y bovedillas",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="5" y="25" width="50" height="15" />
                    <line x1="5" y1="25" x2="15" y2="15" />
                    <line x1="55" y1="25" x2="45" y2="15" />
                    <line x1="15" y1="15" x2="45" y2="15" />
                    <rect x="12" y="29" width="8" height="8" strokeWidth="0.8" />
                    <rect x="26" y="29" width="8" height="8" strokeWidth="0.8" />
                    <rect x="40" y="29" width="8" height="8" strokeWidth="0.8" />
                  </svg>
                )
              },
              {
                name: "Cimientos Corridos",
                free: false,
                spec: "Hormigón ciclópeo e insumos",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="15" y="30" width="30" height="25" />
                    <line x1="5" y1="30" x2="15" y2="30" />
                    <line x1="45" y1="30" x2="55" y2="30" />
                    <line x1="15" y1="40" x2="45" y2="40" strokeDasharray="2,2" />
                    <circle cx="23" cy="46" r="2.5" fill="currentColor" opacity="0.3" />
                    <circle cx="35" cy="38" r="3.5" fill="currentColor" opacity="0.3" />
                    <circle cx="28" cy="50" r="1.5" fill="currentColor" opacity="0.3" />
                  </svg>
                )
              },
              {
                name: "Muros de Contención",
                free: false,
                spec: "Piedra y mortero trapezoidal",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <polygon points="20,10 40,10 50,50 10,50" />
                    <circle cx="20" cy="40" r="4" fill="currentColor" opacity="0.3" />
                    <circle cx="30" cy="25" r="3" fill="currentColor" opacity="0.3" />
                    <circle cx="40" cy="42" r="5" fill="currentColor" opacity="0.3" />
                    <circle cx="30" cy="45" r="3" fill="currentColor" opacity="0.3" />
                  </svg>
                )
              },
              {
                name: "Techos y Coberturas",
                free: false,
                spec: "Tejas, listonados y faldones",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <polygon points="10,45 50,45 50,20" />
                    <line x1="10" y1="45" x2="50" y2="20" strokeWidth="1.5" strokeDasharray="3,2" />
                  </svg>
                )
              },
              {
                name: "Cielo Raso y Yeso",
                free: false,
                spec: "Perfiles, paneles y drywall",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="5" y="15" width="50" height="30" rx="1" />
                    <line x1="5" y1="25" x2="55" y2="25" strokeDasharray="3,3" />
                    <line x1="5" y1="35" x2="55" y2="35" strokeDasharray="3,3" />
                    <line x1="17" y1="15" x2="17" y2="45" strokeDasharray="3,3" />
                    <line x1="30" y1="15" x2="30" y2="45" strokeDasharray="3,3" />
                    <line x1="43" y1="15" x2="43" y2="45" strokeDasharray="3,3" />
                  </svg>
                )
              },
              {
                name: "Paredes Drywall",
                free: false,
                spec: "Parantes, canales, pernos y masilla",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="10" y="10" width="40" height="40" rx="1" />
                    <line x1="20" y1="10" x2="20" y2="50" />
                    <line x1="30" y1="10" x2="30" y2="50" />
                    <line x1="40" y1="10" x2="40" y2="50" />
                    <line x1="10" y1="25" x2="50" y2="25" strokeDasharray="3,3" />
                  </svg>
                )
              },
              {
                name: "Paredes de Concreto",
                free: false,
                spec: "Muros de concreto armado con rebar",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="10" y="10" width="40" height="40" />
                    <line x1="18" y1="10" x2="18" y2="50" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1="30" y1="10" x2="30" y2="50" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1="42" y1="10" x2="42" y2="50" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1="10" y1="18" x2="50" y2="18" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1="10" y1="30" x2="50" y2="30" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1="10" y1="42" x2="50" y2="42" strokeWidth="0.8" strokeDasharray="2,2" />
                  </svg>
                )
              },
              {
                name: "Zócalos de Acabado",
                free: false,
                spec: "Zócalos lineales y dosificaciones",
                renderSvg: () => (
                  <svg className="w-16 h-16 text-cyan-500/20 group-hover:text-cyan-400/40 transition-colors" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M10,10 L10,45 L50,45" />
                    <path d="M10,40 L50,40" stroke="#f97316" strokeWidth="1.5" />
                    <line x1="20" y1="40" x2="20" y2="45" />
                    <line x1="30" y1="40" x2="30" y2="45" />
                    <line x1="40" y1="40" x2="40" y2="45" />
                  </svg>
                )
              }
            ].map((calc, i) => (
              <div
                key={i}
                className="relative p-0.5 rounded-xl overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 min-h-[170px] flex flex-col justify-between"
              >
                {/* Rotating Saber Border Light */}
                <div className="absolute inset-[-1000%] bg-[conic-gradient(from_0deg,transparent_40%,rgba(34,211,238,0.12)_50%,transparent_60%)] animate-[spin_10s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Glassmorphic Inner Container */}
                <div className="relative flex-1 p-5 rounded-[10px] bg-slate-950/40 backdrop-blur-md border border-slate-900/60 group-hover:border-slate-800/30 transition-all duration-300 flex flex-col justify-between z-10">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${calc.free ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"}`}>
                        {calc.free ? "FREE" : "PRO"}
                      </span>
                    </div>
                    <div className="font-bold text-slate-100 text-sm leading-tight">{calc.name}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">{calc.spec}</div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    {calc.renderSvg()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 gap-2 font-bold px-6 py-5 rounded-lg transition-colors">
                Probar Todas las Calculadoras
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Nueva Sección: Características de Ingeniería Avanzada */}
      <section id="avanzado" className="py-16 sm:py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-full px-3.5 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
              <Cpu className="h-3.5 w-3.5" />
              Ingeniería de Siguiente Nivel
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Herramientas Diseñadas para Constructoras
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
              Hemos integrado potentes utilidades empresariales para optimizar cada fase de tus proyectos públicos y privados.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Workspaces Colaborativos",
                desc: "Invita a ingenieros, residentes de obra y administradores. Administra permisos con roles de ADMIN y MEMBER para trabajar en paralelo en los mismos presupuestos.",
                icon: Users2,
                tag: "Equipos"
              },
              {
                title: "Formulario B-1 Oficial PDF",
                desc: "Genera el Análisis de Precios Unitarios (APU) según las especificaciones de contratación pública de Bolivia (SICOES). Listo para incluir en tus propuestas formales.",
                icon: FileText,
                tag: "SICOES"
              },
              {
                title: "Importación/Exportación Excel",
                desc: "Sube tus listas de materiales o descarga presupuestos completos de forma bidireccional. Integración rápida con el Banco de Precios referencial de más de 36,000 ítems.",
                icon: FileSpreadsheet,
                tag: "Productividad"
              },
              {
                title: "Persistencia AIU Paramétrica",
                desc: "Configura valores de Cargas Sociales, IVA, IT, Gastos Generales y Utilidad de forma persistente para cada proyecto. Se aplican y recalculan en tiempo real.",
                icon: Sliders,
                tag: "Finanzas"
              },
              {
                title: "Precios Locales Sobreescritos",
                desc: "Visualiza de forma clara qué insumos han sido modificados con precios específicos para un proyecto, manteniendo intacta tu base de precios globales de referencia.",
                icon: Award,
                tag: "Control"
              },
              {
                title: "Planificación Gantt y Curva S",
                desc: "Planifica plazos con un cronograma visual, establece dependencias y analiza el progreso financiero a través de la Curva S integrada a los costos de tus cómputos.",
                icon: Calendar,
                tag: "Plazos"
              }
            ].map((feat, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-slate-800 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                      <feat.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/60 border border-slate-800/80 px-2 py-0.5 rounded">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-200 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Responsiveness Highlight banner */}
          <div className="mt-8 p-6 rounded-2xl border border-cyan-500/20 bg-cyan-950/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">100% Responsivo en Obra</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Accede a tus proyectos, edita presupuestos y ejecuta cálculos técnicos directamente desde tu smartphone o tablet en plena obra de construcción.
                </p>
              </div>
            </div>
            <Link href="/register">
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold whitespace-nowrap gap-2">
                Ver en Mi Celular
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison: Enterprise vs Standard */}
      <section id="comparativa" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Optimizado para Licitaciones y Obra</h2>
            <p className="text-slate-400 mt-2">Diferencia técnica frente a métodos de cálculo manuales tradicionales en Excel.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border border-slate-900 bg-slate-900/10 p-6 rounded-2xl relative">
              <h3 className="text-lg font-bold text-slate-400 flex items-center gap-2 mb-6">
                <span className="text-red-500 font-mono">⚡</span> Métodos Tradicionales (Excel)
              </h3>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Copiar y pegar fórmulas propenso a errores humanos fatales en volúmenes.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Sin base de datos oficial centralizada; cotizaciones desactualizadas.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Cronograma e inversión financiera (Curva S) desconectados del APU.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> Dificultad para generar reportes oficiales compatibles con el SICOES.
                </li>
              </ul>
            </Card>

            <Card className="border border-cyan-500/30 bg-cyan-950/10 p-6 rounded-2xl relative shadow-lg shadow-cyan-500/5">
              <div className="absolute top-4 right-4 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                SISTEMA INTEGRADO
              </div>
              <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-6">
                <span className="text-cyan-400">⚡</span> Motor Cálculo Presupuestal
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Fórmulas estandarizadas y validadas con precisión paramétrica.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Base de más de 36,000 precios referenciales con importación/exportación de Excel.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Cronograma Gantt interactivo y Curva S recalculados automáticamente.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">✓</span> Exportación del Formulario B-1 Oficial en un clic, reduciendo tiempos de propuesta.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="py-16 sm:py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-full px-3.5 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
              <MessageSquare className="h-3.5 w-3.5" />
              Casos de Éxito
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Opiniones de Líderes de la Construcción
            </h2>
            <p className="text-slate-400 mt-2">
              Empresas constructoras y consultores independientes comparten su experiencia en proyectos en Bolivia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Redujimos el tiempo de preparación de ofertas de licitación de 3 días a solo un par de horas. Las exportaciones en PDF del Formulario B-1 son sumamente profesionales.",
                author: "Ing. Carlos Mendoza",
                role: "Director de Proyectos",
                org: "Constructora Andes SRL",
                initials: "CM"
              },
              {
                quote: "La integración directa de los cómputos métricos con la generación del diagrama de Gantt y la curva S nos da un control financiero absoluto y transparente para nuestro equipo.",
                author: "Arq. Laura Salinas",
                role: "Supervisora de Obras",
                org: "Consultores y Constructores Asociados",
                initials: "LS"
              },
              {
                quote: "Poder configurar las cargas sociales, IVA y gastos generales por proyecto y exportar todo de manera consistente es un salto tecnológico enorme para las licitaciones estatales.",
                author: "Ing. Roberto Valdez",
                role: "Consultor Independiente",
                org: "Obras Públicas Bolivia",
                initials: "RV"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-slate-800/80 transition-all duration-300 flex flex-col justify-between relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{t.author}</h4>
                    <p className="text-[10px] text-slate-500">{t.role} · <span className="text-cyan-400">{t.org}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas Frecuentes (FAQ) */}
      <section id="faq" className="py-16 sm:py-24 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-full px-3.5 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
              <HelpCircle className="h-3.5 w-3.5" />
              Soporte Técnico
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-slate-400 mt-2">Respuestas rápidas a las consultas de ingeniería más habituales.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "¿Cómo se calculan las dosificaciones y cantidades de materiales?",
                a: "Nuestras calculadoras emplean fórmulas estandarizadas de ingeniería civil basadas en ratios de rendimiento oficiales. Cada calculadora tiene en cuenta el factor de desperdicio ingresado por el usuario y los coeficientes de aporte de los insumos."
              },
              {
                q: "¿El Formulario B-1 PDF es compatible con licitaciones estatales en Bolivia?",
                a: "Sí. El PDF exportado genera automáticamente la planilla de Análisis de Precios Unitarios (APU) oficial según el Formulario B-1 exigido por el SICOES y las alcaldías/gobernaciones, desglosando correctamente mano de obra, materiales, equipos, cargas sociales, impuestos (IVA, IT) y AIU."
              },
              {
                q: "¿Puedo importar mis propios precios referenciales en Excel?",
                a: "Sí, el plan PRO te permite subir planillas en Excel directamente al Banco de Precios. El sistema detecta y actualiza los costos de forma masiva para que no tengas que transcribirlos a mano."
              },
              {
                q: "¿Cómo funcionan los Workspaces colaborativos?",
                a: "Permiten agrupar a varios usuarios en un mismo espacio de trabajo. El administrador (ADMIN) puede invitar a miembros (MEMBER) para que colaboren en la edición de presupuestos, cómputos métricos y cronogramas Gantt del equipo en tiempo real."
              },
              {
                q: "¿Qué limitaciones tiene el Plan Free?",
                a: "El Plan Free está diseñado para pruebas individuales y pequeños presupuestos. Permite crear hasta 1 proyecto activo simultáneo y utilizar 4 calculadoras básicas (Concreto, Paredes, Pisos y Pintura) de forma ilimitada y gratuita."
              }
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group border border-slate-900 bg-slate-900/10 rounded-xl p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all duration-300 hover:border-slate-800"
              >
                <summary className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-200 select-none">
                  <span>{faq.q}</span>
                  <span className="transition-transform duration-300 group-open:-rotate-180 shrink-0 ml-4">
                    <ChevronDown className="h-5 w-5 text-cyan-400" />
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed pl-1 border-l-2 border-cyan-500/30">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Clear Pricing Section */}
      <section id="precios" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Planes Profesionales Sin Comisiones</h2>
            <p className="text-slate-400 mt-2">Empieza a trabajar en tus presupuestos sin costos ocultos.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-300">Acceso Inicial</h3>
                <div className="text-4xl font-extrabold mt-4">Bs. 0</div>
                <p className="text-xs text-slate-500 mt-1">Acceso libre para siempre</p>
                <div className="h-px bg-slate-900 my-6" />
                <ul className="space-y-3 text-sm text-slate-400 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> 4 calculadoras habilitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> 1 proyecto activo simultáneo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Exportación PDF básica
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 line-through">
                    <span>Workspaces de equipo</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 line-through">
                    <span>Formulario B-1 Oficial</span>
                  </li>
                </ul>
              </div>
              <Link href="/register" className="w-full">
                <button className="w-full bg-slate-900 hover:bg-slate-850 text-cyan-400 font-bold border border-slate-800 py-2.5 rounded-lg text-sm transition-colors duration-300">
                  Comenzar Gratis
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 flex flex-col justify-between relative shadow-xl shadow-cyan-500/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                Recomendado
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyan-400">Ingeniería Pro</h3>
                <div className="text-4xl font-extrabold mt-4">Bs. 137<span className="text-xs text-slate-400 font-normal"> / mes</span></div>
                <p className="text-xs text-slate-500 mt-1">Facturación mensual simple</p>
                <div className="h-px bg-slate-800/50 my-6" />
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> <strong>Las 14 calculadoras</strong> completas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Proyectos ilimitados y cómputos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> <strong>Exportación Formulario B-1 Oficial (SICOES)</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> <strong>Colaboración en Workspaces (Equipos)</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> <strong>Importación/Exportación de Excel masiva</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Cronograma Gantt y Curva S
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400">✓</span> Impuestos y AIU personalizables por proyecto
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
      <section className="py-16 sm:py-20 bg-slate-900/30 border-t border-slate-900 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl relative z-10">
          <Award className="h-10 w-10 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">¿Representas a una Constructora o Institución Pública?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Ofrecemos licencias corporativas multiusuario, base de precios centralizada para tu equipo y parametrización personalizada de catálogos para licitaciones públicas y privadas.
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
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950/60 border border-slate-800 shadow-lg shadow-cyan-500/10 overflow-hidden shrink-0 mb-4">
                <img src="/logo.webp" alt="Logo" className="h-full w-full object-contain filter brightness-95 contrast-105 saturate-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 to-blue-600/30 mix-blend-color pointer-events-none" />
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
                <li>Exportación Formulario B-1</li>
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
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <a href="https://wa.me/59171523780" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    +591 71523780
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/59171572401" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    +591 71572401
                  </a>
                </li>
                <li className="text-slate-600 mt-1">La Paz, Bolivia</li>
              </ul>
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
