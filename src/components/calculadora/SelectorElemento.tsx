"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Box, Droplets, Ruler, ArrowRight, SquareStack, Hammer, Mountain, Home, Grid3X3, PanelTop } from "lucide-react"

const elementos = [
  { nombre: "Concreto", href: "concreto", icon: Box, color: "text-blue-600", desc: "Volumen, cemento, arena, grava" },
  { nombre: "Paredes", href: "pared", icon: SquareStack, color: "text-orange-600", desc: "Bloques, pega, repello, afinado" },
  { nombre: "Columnas", href: "columna", icon: Ruler, color: "text-green-600", desc: "Concreto + acero long + estribos" },
  { nombre: "Vigas", href: "viga", icon: ArrowRight, color: "text-purple-600", desc: "Concreto + acero (+)(-) + estribos" },
  { nombre: "Losas", href: "losa", icon: Grid3X3, color: "text-red-600", desc: "Concreto + acero 4 dirs + bovedillas" },
  { nombre: "Cimientos", href: "cimiento", icon: Mountain, color: "text-amber-600", desc: "Piedra + mortero" },
  { nombre: "Muros", href: "muro", icon: Hammer, color: "text-teal-600", desc: "Piedra + mortero (trapezoidal)" },
  { nombre: "Techos", href: "techo", icon: Home, color: "text-indigo-600", desc: "Tejas con pendiente" },
  { nombre: "Pisos", href: "piso", icon: PanelTop, color: "text-pink-600", desc: "Cerámicas + adhesivo + boquilla" },
  { nombre: "Cielos Rasos", href: "cielo", icon: Droplets, color: "text-cyan-600", desc: "Paneles + viguetas + omegas" },
]

interface SelectorElementoProps {
  projectId: string
}

export function SelectorElemento({ projectId }: SelectorElementoProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {elementos.map(el => (
        <Link key={el.href} href={`/proyectos/${projectId}/calculadora/${el.href}`}>
          <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-4 text-center">
              <el.icon className={`h-10 w-10 mx-auto mb-3 ${el.color}`} />
              <h3 className="font-semibold text-sm">{el.nombre}</h3>
              <p className="text-xs text-muted-foreground mt-1">{el.desc}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
