"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Home,
  Award,
  Calculator,
  Activity,
  MessageSquare,
  CreditCard,
  HelpCircle,
  Menu,
  X
} from "lucide-react"

// Definición de las secciones de la página
const NAV_ITEMS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "experiencia", label: "Experiencia", icon: Award },
  { id: "calculadoras", label: "Calculadoras", icon: Calculator },
  { id: "comparativa", label: "Comparativa", icon: Activity },
  { id: "testimonios", label: "Opiniones", icon: MessageSquare },
  { id: "precios", label: "Precios", icon: CreditCard },
  { id: "faq", label: "FAQ", icon: HelpCircle }
]

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("inicio")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Detectar scroll para encoger el header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    // Ejecutar una vez al inicio por si ya está scrollado
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Configurar IntersectionObserver para resaltar la sección activa
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Detecta cuando la sección ocupa la zona central/superior de la pantalla
      threshold: 0
    }

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(callback, options)
    observerRef.current = observer

    // Observar cada sección por ID
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Desplazamiento suave con compensación por el tamaño de la cabecera fija
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setMobileMenuOpen(false) // Cerrar menú móvil si está abierto
    
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = scrolled ? 76 : 96 // Altura de la cabecera + margen
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })

      // Actualizar estado manualmente al hacer clic
      setActiveSection(id)
    }
  }

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled 
          ? "pt-3 px-4 md:px-8 lg:px-12" 
          : "pt-6 px-6 md:px-12 lg:px-16"
      }`}
    >
      <div className="max-w-[1440px] mx-auto">
        <header 
          className={`liquid-glass rounded-xl flex items-center justify-between border transition-all duration-500 ease-in-out ${
            scrolled 
              ? "py-2 px-4 bg-slate-950/85 border-cyan-500/20 shadow-lg shadow-cyan-500/5 backdrop-blur-md" 
              : "py-3.5 px-6 bg-slate-950/40 border-white/10 shadow-none backdrop-blur-sm"
          }`}
        >
          {/* Logo y Enlace Principal */}
          <a 
            href="#inicio" 
            onClick={(e) => handleScrollTo(e, "inicio")} 
            className="flex items-center gap-2 group shrink-0"
          >
            <div 
              className={`relative flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 shadow-lg transition-all duration-500 overflow-hidden shrink-0 ${
                scrolled 
                  ? "h-10 w-10 shadow-cyan-500/5" 
                  : "h-14 w-14 shadow-cyan-500/10 group-hover:scale-105"
              }`}
            >
              <img 
                src="/logo.webp" 
                alt="Logo" 
                className="h-full w-full object-contain filter brightness-95 contrast-105 saturate-90" 
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 to-blue-600/30 mix-blend-color pointer-events-none" />
            </div>
          </a>

          {/* Menú de Navegación Escritorio */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                    isActive
                      ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                  )}
                </a>
              )
            })}
          </nav>

          {/* CTAs y Botón de Menú Móvil */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className={`text-slate-300 hover:text-white hover:bg-slate-900/60 font-medium transition-all duration-300 ${
                    scrolled ? "h-9 text-xs px-3" : "h-10 text-sm px-4"
                  }`}
                >
                  Acceso Profesional
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  className={`bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 transition-all duration-300 ${
                    scrolled ? "h-9 text-xs px-4" : "h-10 text-sm px-5"
                  }`}
                >
                  Iniciar Gratis
                </Button>
              </Link>
            </div>

            {/* Toggle Menú Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900/50 border border-white/5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Panel de Menú Móvil */}
        <div 
          className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden mt-2 ${
            mobileMenuOpen 
              ? "max-h-[420px] opacity-100 translate-y-0" 
              : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="liquid-glass border border-white/10 rounded-xl p-4 bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </a>
              )
            })}

            {/* CTAs Móvil (sólo visibles en pantallas extra pequeñas) */}
            <div className="flex sm:hidden flex-col gap-2 pt-3 border-t border-white/5 mt-2">
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full text-slate-300 hover:text-white hover:bg-slate-900 py-3 text-sm">
                  Acceso Profesional
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold py-3 text-sm">
                  Iniciar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
