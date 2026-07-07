import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface ImportItem {
  bancoPrecioId: string
  capituloId?: string
  capituloNombre?: string
  capituloCodigo?: number
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: proyectoId } = await params
    const body = await request.json()
    const { items, crearCapitulos }: { items: ImportItem[]; crearCapitulos?: boolean } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay items para importar" }, { status: 400 })
    }

    const bancoIds = items.map(i => i.bancoPrecioId)
    const bancoItems = await prisma.bancoPrecio.findMany({
      where: { id: { in: bancoIds } },
    })

    const bancoMap = new Map(bancoItems.map(b => [b.id, b]))

    let capitulosCreados = 0
    let partidasCreadas = 0
    const errores: string[] = []

    // Agrupar items por capítulo destino
    const itemsByCapitulo = new Map<string, ImportItem[]>()
    for (const item of items) {
      const key = item.capituloId || `nuevo_${item.capituloCodigo || 0}`
      if (!itemsByCapitulo.has(key)) itemsByCapitulo.set(key, [])
      itemsByCapitulo.get(key)!.push(item)
    }

    for (const [capKey, capItems] of itemsByCapitulo) {
      let capituloId = capKey.startsWith("nuevo_") ? null : capKey

      // Crear capítulo si es nuevo
      if (!capituloId && crearCapitulos) {
        const primerBanco = bancoMap.get(capItems[0].bancoPrecioId)
        const cod = capItems[0].capituloCodigo || 1
        const nombre = capItems[0].capituloNombre || primerBanco?.categoria || "SIN NOMBRE"

        const existing = await prisma.capituloPresupuesto.findUnique({
          where: { proyectoId_codigo: { proyectoId, codigo: cod } },
        })

        if (existing) {
          capituloId = existing.id
        } else {
          const lastCap = await prisma.capituloPresupuesto.findFirst({
            where: { proyectoId },
            orderBy: { orden: "desc" },
          })
          const nuevo = await prisma.capituloPresupuesto.create({
            data: {
              proyectoId,
              codigo: cod,
              nombre,
              orden: (lastCap?.orden || 0) + 1,
            },
          })
          capituloId = nuevo.id
          capitulosCreados++
        }
      }

      if (!capituloId) {
        errores.push(`No se pudo determinar capítulo para ${capItems.length} items`)
        continue
      }

      // Obtener partida existentes para evitar duplicados
      const existingPartidas = await prisma.partidaPresupuesto.findMany({
        where: { capituloId },
        select: { codigo: true },
      })
      const existingCodes = new Set(existingPartidas.map(p => p.codigo))

      // Obtener el último código numérico del capítulo
      const lastPartida = await prisma.partidaPresupuesto.findFirst({
        where: { capituloId },
        orderBy: { codigo: "desc" },
      })
      let nextNum = 1
      if (lastPartida) {
        const match = lastPartida.codigo.match(/\.(\d+)$/)
        if (match) nextNum = parseInt(match[1]) + 1
      }

      for (const item of capItems) {
        const banco = bancoMap.get(item.bancoPrecioId)
        if (!banco) {
          errores.push(`Item del banco no encontrado: ${item.bancoPrecioId}`)
          continue
        }

        // Generar código de partida
        const cap = await prisma.capituloPresupuesto.findUnique({ where: { id: capituloId }, select: { codigo: true } })
        const capCodigo = cap?.codigo || 0
        let partidaCodigo = `${capCodigo}.${nextNum.toString().padStart(2, "0")}`

        // Saltar si ya existe
        while (existingCodes.has(partidaCodigo)) {
          nextNum++
          partidaCodigo = `${capCodigo}.${nextNum.toString().padStart(2, "0")}`
        }

        try {
          await prisma.partidaPresupuesto.create({
            data: {
              capituloId,
              codigo: partidaCodigo,
              descripcion: banco.actividad,
              unidad: banco.unidad,
              precioBase: banco.precioUnitario,
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
      mensaje: `Importados ${partidasCreadas} partidas en ${capitulosCreados} capítulos nuevos`,
    })
  } catch (e: any) {
    console.error("Error importando del banco de precios:", e)
    return NextResponse.json({ error: "Error al importar: " + (e.message || "Error desconocido") }, { status: 500 })
  }
}
