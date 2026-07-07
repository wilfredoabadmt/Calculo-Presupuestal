import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proyectoId = searchParams.get("proyectoId") || "cmr8g6wn0007bz69scr54qmz"

    const project = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
    })

    const capitulos = await prisma.capituloPresupuesto.findMany({
      where: { proyectoId },
      include: {
        partidas: true,
      },
    })

    const allCapitulosCount = await prisma.capituloPresupuesto.count()
    const allPartidasCount = await prisma.partidaPresupuesto.count()
    const allProyectosCount = await prisma.proyecto.count()

    const sampleMediciones = await prisma.medicionPartida.findMany({
      take: 5,
    })

    return NextResponse.json({
      success: true,
      targetProject: {
        id: proyectoId,
        exists: !!project,
        nombre: project?.nombre || null,
        capitulosCount: capitulos.length,
        capitulos: capitulos.map(c => ({
          id: c.id,
          codigo: c.codigo,
          nombre: c.nombre,
          activo: c.activo,
          partidasCount: c.partidas.length,
          partidas: c.partidas.map(p => ({
            id: p.id,
            codigo: p.codigo,
            descripcion: p.descripcion,
            activo: p.activo,
          })),
        })),
      },
      globalCounts: {
        proyectos: allProyectosCount,
        capitulos: allCapitulosCount,
        partidas: allPartidasCount,
      },
      sampleMediciones,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
