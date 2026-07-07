import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const soloActivos = searchParams.get("activos") !== "false"

    const where: any = { proyectoId: id }
    if (soloActivos) where.activo = true

    const capitulos = await prisma.capituloPresupuesto.findMany({
      where,
      include: {
        partidas: {
          where: { activo: true },
          orderBy: { codigo: "asc" },
        },
      },
      orderBy: { orden: "asc" },
    })

    return NextResponse.json(capitulos)
  } catch (e) {
    console.error("Error GET capitulos:", e)
    return NextResponse.json([])
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { codigo, nombre, descripcion } = body

    if (!codigo || !nombre) {
      return NextResponse.json({ error: "Campos requeridos: codigo, nombre" }, { status: 400 })
    }

    const existing = await prisma.capituloPresupuesto.findUnique({
      where: { proyectoId_codigo: { proyectoId: id, codigo: parseInt(codigo) } },
    })

    if (existing) {
      return NextResponse.json({ error: `Ya existe el capítulo ${codigo} en este proyecto` }, { status: 409 })
    }

    const lastCapitulo = await prisma.capituloPresupuesto.findFirst({
      where: { proyectoId: id },
      orderBy: { orden: "desc" },
    })

    const capitulo = await prisma.capituloPresupuesto.create({
      data: {
        proyectoId: id,
        codigo: parseInt(codigo),
        nombre,
        descripcion,
        orden: (lastCapitulo?.orden || 0) + 1,
      },
    })

    return NextResponse.json(capitulo, { status: 201 })
  } catch (e) {
    console.error("Error POST capitulo:", e)
    return NextResponse.json({ error: "Error al crear capítulo. Verifica que las tablas existan." }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { capitulos } = body

    if (Array.isArray(capitulos)) {
      const updates = capitulos.map((c: { id: string; orden: number }) =>
        prisma.capituloPresupuesto.update({
          where: { id: c.id },
          data: { orden: c.orden },
        })
      )
      await prisma.$transaction(updates)
      return NextResponse.json({ ok: true })
    }

    const { capituloId, nombre, descripcion, activo } = body
    if (!capituloId) {
      return NextResponse.json({ error: "Se requiere capituloId" }, { status: 400 })
    }

    const capitulo = await prisma.capituloPresupuesto.update({
      where: { id: capituloId },
      data: { nombre, descripcion, activo },
    })

    return NextResponse.json(capitulo)
  } catch (e) {
    console.error("Error PUT capitulo:", e)
    return NextResponse.json({ error: "Error al actualizar capítulo" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const capituloId = searchParams.get("capituloId")

    if (!capituloId) {
      return NextResponse.json({ error: "Se requiere capituloId" }, { status: 400 })
    }

    await prisma.capituloPresupuesto.update({
      where: { id: capituloId },
      data: { activo: false },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Error DELETE capitulo:", e)
    return NextResponse.json({ error: "Error al eliminar capítulo" }, { status: 500 })
  }
}
