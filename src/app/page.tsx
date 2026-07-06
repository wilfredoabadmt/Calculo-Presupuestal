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
  HelpCircle
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
      {/* Background Neon Grid & Cinematic Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Floating Animated Grid Line Beam */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none opacity-40 animate-pulse" />

      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950/60 border border-slate-800 shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-all duration-300 overflow-hidden shrink-0">
              <img src="/logo.webp" alt="Logo" className="h-full w-full object-contain filter brightness-95 contrast-105 saturate-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 to-blue-600/30 mix-blend-color pointer-events-none" />
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

      {/* Hero Cinematográfico */}
      <section className="relative pt-16 pb-24 lg:pt-28 lg:pb-36 flex flex-col items-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-20 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Isometric Wireframe SVG Background representing a digital city grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <svg className="w-full max-w-6xl h-full min-h-[600px]" viewBox="0 0 1000 600" fill="none" stroke="currentColor">
            <path d="M100 500 L500 100 L900 500 Z" strokeWidth="1" />
            <path d="M100 500 L500 300 L900 500 Z" strokeWidth="0.5" strokeDasharray="5,5" />
            <path d="M500 100 L500 600" strokeWidth="1" />
            <path d="M50 400 L950 400" strokeWidth="0.5" />
            <circle cx="500" cy="100" r="8" fill="currentColor" className="animate-ping" />
            <circle cx="100" cy="500" r="6" fill="currentColor" />
            <circle cx="900" cy="500" r="6" fill="currentColor" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-full px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-10 backdrop-blur-sm shadow-inner shadow-white/5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            Tecnología Paramétrica · Edición 2026
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05] drop-shadow-lg">
            La ingeniería del futuro,<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              presupuestada hoy
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Optimiza tus licitaciones públicas y proyectos privados con precisión milimétrica. 
            Calcula materiales con <strong>14 calculadoras avanzadas</strong>, accede a la base GMLP y visualiza rutas críticas en Gantt dinámicos.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 px-8 py-6 rounded-xl shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02]">
                Registrarse Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-bold border-slate-800 bg-slate-900/40 text-slate-200 hover:bg-slate-900 hover:text-white px-8 py-6 rounded-xl transition-all duration-300">
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          {/* Live CAD simulator preview container */}
          <div className="max-w-4xl mx-auto mb-16 relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl opacity-30 pointer-events-none" />
            <div className="text-left mb-4 flex justify-between items-center">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                SIMULADOR CAD INTERACTIVO EN VIVO
              </span>
              <p className="text-[10px] text-slate-500 hidden sm:block">Fórmulas automatizadas según dosificación oficial</p>
            </div>
            <CalculatorShowcase />
          </div>
        </div>
      </section>

      {/* Sección de Experiencia */}
      <section className="py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 rounded-md px-3 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Trayectoria de Precisión
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Respaldando las obras más exigentes del país
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                Nuestra plataforma consolida décadas de conocimiento de ingeniería civil, automatizando cálculos complejos de materiales que antes tomaban horas de revisión manual.
              </p>
              <div className="space-y-3.5">
                {[
                  "Fórmulas validadas bajo normas bolivianas de construcción",
                  "Cálculo automatizado de desperdicio por tipo de ítem",
                  "Reportes ejecutivos listos para auditorías públicas"
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
                { val: "Bs. 940M+", label: "Presupuestos Calculados", desc: "En volumen total financiero", icon: Scale },
                { val: "12,000+", label: "Proyectos Procesados", desc: "Privados y gubernamentales", icon: Building2 },
                { val: "4.8M m³", label: "Hormigón Estimado", desc: "Con dosificaciones exactas", icon: Layers },
                { val: "99.98%", label: "Precisión Paramétrica", desc: "Sin errores de redondeo", icon: Activity }
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-slate-800/80 hover:bg-slate-900/20 transition-all duration-300">
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
      <section className="py-20 bg-slate-950/50 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">14 Calculadoras de Obra Integradas</h2>
            <p className="text-slate-400 mt-2">Acceso a cálculos paramétricos precisos en cualquier dispositivo sin instalaciones.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Concreto Standard",
                free: true,
                spec: "Dosificación cemento/arena",
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
                spec: "Cómputo piezas y mezcla",
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
                spec: "Piezas, juntas y pegamento",
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
                spec: "Rendimiento y manos de pintura",
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
                spec: "Acero longitudinal y estribos",
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
                spec: "Encofrados y fierrería",
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
                spec: "Aligeradas y macizas",
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
                spec: "Tejas, listones y aleros",
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
                spec: "Perfiles y placas drywall",
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
                spec: "Pernos, rieles y masilla",
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
                spec: "Armaduras y vaciado",
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
                spec: "Pegamento y piezas lineales",
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

      {/* Testimonios Ficticios */}
      <section className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-full px-3.5 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
              <MessageSquare className="h-3.5 w-3.5" />
              Casos de Éxito
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Opiniones de Líderes de la Construcción
            </h2>
            <p className="text-slate-400 mt-2">
              Empresas constructoras y consultores independientes comparten su experiencia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Redujimos el tiempo de preparación de ofertas de licitación de 3 días a solo un par de horas. Las calculadoras de dosificación son sumamente precisas.",
                author: "Ing. Carlos Mendoza",
                role: "Director de Proyectos",
                org: "Constructora Andes SRL",
                initials: "CM"
              },
              {
                quote: "La integración directa de los cómputos métricos con la generación del diagrama de Gantt y la curva S nos da un control financiero absoluto.",
                author: "Arq. Laura Salinas",
                role: "Supervisora de Obras",
                org: "Consultores y Constructores Asociados",
                initials: "LS"
              },
              {
                quote: "Para consultores que trabajamos con el estado, contar con los parámetros de rendimiento y desperdicio oficiales listos es un salto tecnológico enorme.",
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
      <section className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-full px-3.5 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
              <HelpCircle className="h-3.5 w-3.5" />
              Soporte Técnico
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-slate-400 mt-2">Respuestas rápidas a las consultas de ingeniería más habituales.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "¿Cómo se calculan las dosificaciones y cantidades de materiales?",
                a: "Nuestras calculadoras emplean fórmulas estandarizadas de ingeniería civil basadas en ratios oficiales de rendimiento por metro cúbico o metro cuadrado. Cada calculadora tiene en cuenta el factor de desperdicio ingresado por el usuario."
              },
              {
                q: "¿Puedo exportar mis presupuestos a Excel y PDF?",
                a: "Sí, todos los cómputos métricos, presupuestos generales consolidados y diagramas de Gantt se pueden descargar en un solo clic con formatos profesionales ideales para carpetas de licitación."
              },
              {
                q: "¿Qué es el Plan Free y qué limitaciones tiene?",
                a: "El Plan Free te permite crear hasta 1 proyecto activo simultáneo y utilizar 4 de nuestras calculadoras principales (Concreto, Paredes, Pisos y Pintura) de forma ilimitada y sin costo."
              },
              {
                q: "¿Cómo funciona el generador de cronograma Gantt y la curva S?",
                a: "Una vez que guardas tus elementos calculados en el presupuesto, el sistema te permite en la sección 'Cronograma' agendar las actividades asignándoles una fecha de inicio y duración. La curva S se calcula acumulando automáticamente el progreso financiero de las partidas."
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
                    <span className="text-cyan-400">✓</span> 4 calculadoras habilitadas
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
                <button className="w-full bg-slate-900 hover:bg-slate-850 text-cyan-400 font-bold border border-slate-800 py-2.5 rounded-lg text-sm transition-colors duration-300">
                  Comenzar Gratis
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 flex flex-col justify-between relative shadow-xl shadow-cyan-500/5">
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
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <a href="https://wa.me/59171523780" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors block">
                    WhatsApp: +591 71523780
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/59171572401" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors block">
                    WhatsApp: +591 71572401
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
