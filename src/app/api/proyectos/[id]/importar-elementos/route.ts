import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularCostoMedicion, calcularCascadaFinanciera } from "@/lib/financial-calc"

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

    // Buscar o crear PresupuestoDetallado del proyecto
    let presupuesto = await prisma.presupuestoDetallado.findUnique({
      where: { proyectoId },
    })

    if (!presupuesto) {
      presupuesto = await prisma.presupuestoDetallado.create({
        data: { proyectoId },
      })
    }
    const presupuestoId = presupuesto.id

    // Agrupar por tipo → capítulo
    const grouped = new Map<string, typeof elementos>()
    for (const el of elementos) {
      const key = el.tipoElemento
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(el)
    }

    let capitulosCreados = 0
    let capitulosEncontrados = 0
    let partidasCreadas = 0
    const errores: string[] = []

    for (const [tipo, els] of grouped) {
      const capDef = TIPO_A_CAPITULO[tipo] || { codigo: 99, nombre: tipo }

      // Buscar o crear capítulo
      let capituloId: string | null = null
      const existing = await prisma.capituloPresupuesto.findFirst({
        where: { proyectoId, codigo: capDef.codigo },
      })

      if (existing) {
        capituloId = existing.id
        capitulosEncontrados++
        if (!existing.activo) {
          await prisma.capituloPresupuesto.update({
            where: { id: existing.id },
            data: { activo: true },
          })
        }
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
            activo: true,
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

        // Mapear dimensiones físicas del elemento para la medición
        const veces = el.cantidad || 1
        let largo = 1
        let ancho = 1
        let alto = 1

        if (unidad === "m3") {
          largo = el.dimLargo || el.dimA || 1
          ancho = el.dimAncho || el.dimB || 1
          alto = el.dimEspesor || el.dimH || 1
        } else if (unidad === "m2") {
          largo = el.dimLargo || el.dimA || 1
          ancho = el.dimAncho || el.dimB || 1
          alto = 1
        } else if (unidad === "ml") {
          largo = el.dimLargo || el.dimH || el.dimA || 1
          ancho = 1
          alto = 1
        }

        const { parcial } = calcularCostoMedicion(veces, largo, ancho, alto, 1)

        // El precio base de la partida debe ser el costo total del elemento dividido por el parcial calculado
        const precioUnitario = parcial > 0 ? Math.round((el.costoTotal / parcial) * 100) / 100 : el.costoTotal

        try {
          const partida = await prisma.partidaPresupuesto.create({
            data: {
              capituloId,
              codigo: partidaCodigo,
              descripcion: el.descripcion,
              unidad,
              precioBase: precioUnitario,
              activo: true,
            },
          })

          const { parcial: finalParcial, costoTotal: finalCostoTotal } = calcularCostoMedicion(
            veces,
            largo,
            ancho,
            alto,
            precioUnitario
          )

          await prisma.medicionPartida.create({
            data: {
              partidaId: partida.id,
              presupuestoId,
              veces,
              largo: largo === 1 && unidad !== "m3" && unidad !== "m2" && unidad !== "ml" ? 0 : largo,
              ancho: ancho === 1 && unidad !== "m3" && unidad !== "m2" ? 0 : ancho,
              alto: alto === 1 && unidad !== "m3" ? 0 : alto,
              parcial: finalParcial,
              precioUnitario,
              costoTotal: finalCostoTotal,
              calculadoraUsada: el.tipoElemento,
              calculadoraDatos: el.materiales ? JSON.parse(el.materiales) : undefined,
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

    // Recalcular presupuesto completo
    await recalcularPresupuesto(presupuestoId)

    return NextResponse.json({
      ok: true,
      capitulosCreados,
      capitulosEncontrados,
      partidasCreadas,
      errores,
      mensaje: `Importados ${partidasCreadas} elementos del proyecto en ${capitulosCreados + capitulosEncontrados} capítulos`,
    })
  } catch (e: any) {
    console.error("Error importando elementos del proyecto:", e)
    return NextResponse.json({ error: "Error al importar: " + (e.message || "Error desconocido") }, { status: 500 })
  }
}

async function recalcularPresupuesto(presupuestoId: string) {
  try {
    const presupuesto = await prisma.presupuestoDetallado.findUnique({
      where: { id: presupuestoId },
    })
    if (!presupuesto) return

    const result = await prisma.medicionPartida.aggregate({
      where: { presupuestoId },
      _sum: { costoTotal: true },
    })

    const subtotalMaterial = result._sum.costoTotal || 0

    const totales = calcularCascadaFinanciera(
      subtotalMaterial,
      presupuesto.porcentajeBI,
      presupuesto.porcentajeIVA
    )

    await prisma.presupuestoDetallado.update({
      where: { id: presupuestoId },
      data: {
        subtotalMaterial: totales.costoDirecto,
        beneficioIndustrial: totales.beneficioIndustrial,
        baseImponible: totales.baseImponible,
        montoIVA: totales.iva,
        totalPresupuesto: totales.totalGeneral,
      },
    })
  } catch (e) {
    console.error("Error recalculando presupuesto:", e)
  }
}
