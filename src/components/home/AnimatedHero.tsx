"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

// Types/Interfaces
interface AnimatedHeadingProps {
  text: string
  className?: string
  delay?: number
  charDelay?: number
}

// AnimatedHeading Component
export function AnimatedHeading({
  text,
  className = "",
  delay = 200,
  charDelay = 30,
}: AnimatedHeadingProps) {
  const [start, setStart] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStart(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const lines = text.split("\n")

  return (
    <h1 className={className} style={{ letterSpacing: "-0.04em" }}>
      {lines.map((line, lineIndex) => {
        // Calculate cumulative character offset for delay matching across lines
        const previousLinesLength = lines
          .slice(0, lineIndex)
          .reduce((sum, l) => sum + l.length, 0)

        const words = line.split(" ")
        let charCounter = 0

        return (
          <div key={lineIndex} className="flex flex-wrap justify-center gap-y-2">
            {words.map((word, wordIndex) => {
              const wordStartOffset = charCounter
              charCounter += word.length + 1 // +1 for the space that follows

              return (
                <React.Fragment key={wordIndex}>
                  <span className="inline-block whitespace-nowrap">
                    {word.split("").map((char, charIndex) => {
                      const localOffset = wordStartOffset + charIndex
                      const globalCharIndex = previousLinesLength + localOffset
                      const charDelayTime = globalCharIndex * charDelay

                      return (
                        <span
                          key={charIndex}
                          className={`inline-block transition-all duration-500 transform ${
                            start
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-[18px]"
                          }`}
                          style={{
                            transitionDelay: start ? `${charDelayTime}ms` : "0ms",
                          }}
                        >
                          {char}
                        </span>
                      )
                    })}
                  </span>
                  {/* Space between words, but only if not the last word */}
                  {wordIndex < words.length - 1 && (
                    <span
                      className={`inline-block transition-all duration-500 transform ${
                        start
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-[18px]"
                      }`}
                      style={{
                        transitionDelay: start
                          ? `${(previousLinesLength + wordStartOffset + word.length) * charDelay}ms`
                          : "0ms",
                      }}
                    >
                      {"\u00A0"}
                    </span>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )
      })}
    </h1>
  )
}

// FadeIn Component
interface FadeInProps {
  children: React.ReactNode
  delay: number
  duration?: number
}

export function FadeIn({ children, delay, duration = 800 }: FadeInProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className="transition-opacity w-full flex flex-col items-center"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Main AnimatedHero Component
export default function AnimatedHero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden pt-28 sm:pt-32 pb-16 sm:pb-24">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_084718_72a17915-4964-4059-afcd-22d59399b72e.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay to darken video for text readability */}
      <div className="absolute inset-0 bg-slate-950/75 z-0 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
        
        <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center max-w-5xl my-auto">
          {/* Badge */}
          <FadeIn delay={100} duration={800}>
            <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-full px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-10 backdrop-blur-sm shadow-inner shadow-white/5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              Tecnología Paramétrica · Edición 2026
            </div>
          </FadeIn>

          {/* Title */}
          <AnimatedHeading
            text={"La ingeniería del futuro,\npresupuestada hoy"}
            className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05] drop-shadow-lg text-white"
            delay={200}
            charDelay={30}
          />

          {/* Subtitle */}
          <FadeIn delay={800} duration={1000}>
            <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Optimiza tus licitaciones públicas y proyectos privados con precisión milimétrica.
              Calcula materiales con <strong>14 calculadoras avanzadas</strong>, accede a la base de precios referenciales y visualiza rutas críticas en Gantt dinámicos.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={1200} duration={1000}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto text-base font-bold bg-white text-slate-950 hover:bg-slate-100 px-8 py-4 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center">
                  Registrarse Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto text-base font-bold liquid-glass border border-white/20 text-white hover:bg-white hover:text-black px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center">
                  Iniciar Sesión
                </button>
              </Link>
            </div>
          </FadeIn>

          {/* Live CAD simulator preview container */}
          <FadeIn delay={1400} duration={1000}>
            <div className="max-w-4xl mx-auto mb-16 relative w-full">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl opacity-30 pointer-events-none" />
              <div className="text-left mb-4 flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  SIMULADOR CAD INTERACTIVO EN VIVO
                </span>
                <p className="text-[10px] text-slate-400 hidden sm:block">Fórmulas automatizadas según dosificación oficial</p>
              </div>
              {children}
            </div>
          </FadeIn>
        </div>

        {/* Bottom Tagline Pill */}
        <div className="flex justify-center mt-6">
          <FadeIn delay={1600} duration={1000}>
            <div className="liquid-glass border border-white/10 px-5 sm:px-8 py-3.5 rounded-2xl mx-4">
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-light text-slate-200 tracking-wide text-center">
                Cálculo · Planificación · Licitaciones
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
