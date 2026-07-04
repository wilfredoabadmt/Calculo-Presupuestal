import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const items = await prisma.cronogramaItem.findMany({
    where: { proyectoId: params.id },
    orderBy: { fechaInicio: "asc" },
  })

  return NextResponse.json(items)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { codigo, item, fechaInicio, duracion, fechaFinal, dependeDe } = body

  if (!codigo || !item || !fechaInicio || !duracion) {
    return NextResponse.json({ error: "Campos requeridos: codigo, item, fechaInicio, duracion" }, { status: 400 })
  }

  const cronogramaItem = await prisma.cronogramaItem.create({
    data: {
      proyectoId: params.id,
      codigo,
      item,
      fechaInicio: new Date(fechaInicio),
      duracion,
      fechaFinal: fechaFinal ? new Date(fechaFinal) : new Date(new Date(fechaInicio).getTime() + duracion * 86400000),
      dependeDe: dependeDe || null,
    },
  })

  return NextResponse.json(cronogramaItem, { status: 201 })
}
