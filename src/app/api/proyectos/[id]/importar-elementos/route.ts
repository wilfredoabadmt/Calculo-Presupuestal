import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const TIPO_A_CAPITULO: Record<string, { codigo: number; nombre: string }> = {
  CONCRETO: { codigo: 4, nombre: "ESTRUCTURAS" },
  COLUMNA: { codigo: 4, nombre: "ESTRUCTURAS" },
  VIGA: { codigo: 4, nombre: "ESTRUCTURAS" },
  LOSA: { codigo: 4, nombre: "ESTRUCTURAS" },
  CIMIENTO: { codigo: 2, nombre: "CIMENTACION" },
  MURO: { codigo: 6, nombre: "ALBANILERIA" },
  PARED: { codigo: 6, nombre: "ALBANILERIA" },
  PARED_CONCRETO: { codigo: 6, nombre: "ALBANILERIA" },
  PARED_DRYWALL: { codigo: 6, nombre: "ALBANILERIA" },
  PISO: { codigo: 7, nombre: "REVESTIMIENTOS" },
  ZOCALO: { codigo: 7, nombre: "REVESTIMIENTOS" },
  TECHO: { codigo: 5, nombre: "CUBIERTAS" },
  CIELO: { codigo: 5, nombre: "CUBIERTAS" },
  PINTURA: { codigo: 11, nombre: "PINTURAS" },
}

function getUnidadFromTipo(tipo: string): string {
  switch (tipo) {
    case "CONCRETO": case "LOSAS": return "m3"
    case "COLUMNA": case "VIGA": return "ml"
    case "MURO": case "PARED": case "PARED_CONCRETO": case "PARED_DRYWALL": return "m2"
    case "CIMIENTO": return "ml"
    case "PISO": case "ZOCALO": return "m2"
    case "TECHO": case "CIELO": return "m2"
    case "PINTURA": return "m2"
    default: return "ud"
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: proyectoId } = await params
    const body = await request.json()
    const { elementoIds, crearCapitulos = true } = body

    if (!elementoIds || elementoIds.length === 0) {
      return NextResponse.json({ error: "No hay elementos para importar" }, { status: 400 })
    }

    const elementos = await prisma.elementoPresupuesto.findMany({
      where: { id: { in: elementoIds }, proyectoId },
    })

    if (elementos.length === 0) {
      return NextResponse.json({ error: "No se encontraron elementos del proyecto" }, { status: 404 })
    }

    // Agrupar por tipo → capítulo
    const grouped = new Map<string, typeof elementos>()
    for (const el of elementos) {
      const key = el.tipoElemento
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(el)
    }

    let capitulosCreados = 0
    let partidasCreadas = 0
    const errores: string[] = []

    for (const [tipo, els] of grouped) {
      const capDef = TIPO_A_CAPITULO[tipo] || { codigo: 99, nombre: tipo }

      // Buscar o crear capítulo
      let capituloId: string | null = null
      const existing = await prisma.capituloPresupuesto.findUnique({
        where: { proyectoId_codigo: { proyectoId, codigo: capDef.codigo } },
      })

      if (existing) {
        capituloId = existing.id
      } else if (crearCapitulos) {
        const lastCap = await prisma.capituloPresupuesto.findFirst({
          where: { proyectoId },
          orderBy: { orden: "desc" },
        })
        const nuevo = await prisma.capituloPresupuesto.create({
          data: {
            proyectoId,
            codigo: capDef.codigo,
            nombre: capDef.nombre,
            orden: (lastCap?.orden || 0) + 1,
          },
        })
        capituloId = nuevo.id
        capitulosCreados++
      }

      if (!capituloId) {
        errores.push(`No se pudo determinar capítulo para tipo ${tipo}`)
        continue
      }

      // Obtener códigos existentes
      const existingPartidas = await prisma.partidaPresupuesto.findMany({
        where: { capituloId },
        select: { codigo: true },
      })
      const existingCodes = new Set(existingPartidas.map(p => p.codigo))

      let nextNum = 1
      if (existingPartidas.length > 0) {
        const lastPartida = await prisma.partidaPresupuesto.findFirst({
          where: { capituloId },
          orderBy: { codigo: "desc" },
        })
        if (lastPartida) {
          const match = lastPartida.codigo.match(/\.(\d+)$/)
          if (match) nextNum = parseInt(match[1]) + 1
        }
      }

      for (const el of els) {
        let partidaCodigo = `${capDef.codigo}.${nextNum.toString().padStart(2, "0")}`
        while (existingCodes.has(partidaCodigo)) {
          nextNum++
          partidaCodigo = `${capDef.codigo}.${nextNum.toString().padStart(2, "0")}`
        }

        const unidad = getUnidadFromTipo(el.tipoElemento)
        const precioUnitario = el.cantidad > 0 ? Math.round((el.costoTotal / el.cantidad) * 100) / 100 : el.costoTotal

        try {
          await prisma.partidaPresupuesto.create({
            data: {
              capituloId,
              codigo: partidaCodigo,
              descripcion: el.descripcion,
              unidad,
              precioBase: precioUnitario,
            },
          })
          existingCodes.add(partidaCodigo)
          partidasCreadas++
          nextNum++
        } catch (e: any) {
          errores.push(`Error creando partida ${partidaCodigo}: ${e.message?.slice(0, 80)}`)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      capitulosCreados,
      partidasCreadas,
      errores,
      mensaje: `Importados ${partidasCreadas} elementos del proyecto en ${capitulosCreados} capítulos`,
    })
  } catch (e: any) {
    console.error("Error importando elementos del proyecto:", e)
    return NextResponse.json({ error: "Error al importar: " + (e.message || "Error desconocido") }, { status: 500 })
  }
}
