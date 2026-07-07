import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; capituloId: string }> }
) {
  const { capituloId } = await params

  const partidas = await prisma.partidaPresupuesto.findMany({
    where: { capituloId, activo: true },
    orderBy: { codigo: "asc" },
  })

  return NextResponse.json(partidas)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; capituloId: string }> }
) {
  const { capituloId } = await params
  const body = await request.json()
  const { codigo, descripcion, unidad, precioBase } = body

  if (!codigo || !descripcion || !unidad) {
    return NextResponse.json(
      { error: "Campos requeridos: codigo, descripcion, unidad" },
      { status: 400 }
    )
  }

  const existing = await prisma.partidaPresupuesto.findUnique({
    where: { capituloId_codigo: { capituloId, codigo } },
  })

  if (existing) {
    return NextResponse.json(
      { error: `Ya existe la partida ${codigo} en este capítulo` },
      { status: 409 }
    )
  }

  const partida = await prisma.partidaPresupuesto.create({
    data: {
      capituloId,
      codigo,
      descripcion,
      unidad,
      precioBase: precioBase || 0,
    },
  })

  return NextResponse.json(partida, { status: 201 })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; capituloId: string }> }
) {
  const { capituloId } = await params
  const body = await request.json()
  const { partidaId, descripcion, unidad, precioBase, activo } = body

  if (!partidaId) {
    return NextResponse.json({ error: "Se requiere partidaId" }, { status: 400 })
  }

  const partida = await prisma.partidaPresupuesto.update({
    where: { id: partidaId },
    data: { descripcion, unidad, precioBase, activo },
  })

  return NextResponse.json(partida)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; capituloId: string }> }
) {
  const { capituloId } = await params
  const { searchParams } = new URL(request.url)
  const partidaId = searchParams.get("partidaId")

  if (!partidaId) {
    return NextResponse.json({ error: "Se requiere partidaId" }, { status: 400 })
  }

  await prisma.partidaPresupuesto.update({
    where: { id: partidaId },
    data: { activo: false },
  })

  return NextResponse.json({ ok: true })
}
