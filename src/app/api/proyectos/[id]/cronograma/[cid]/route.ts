import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string; cid: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const item = await prisma.cronogramaItem.update({
    where: { id: params.cid },
    data: {
      codigo: body.codigo,
      item: body.item,
      fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      duracion: body.duracion,
      fechaFinal: body.fechaFinal ? new Date(body.fechaFinal) : undefined,
      dependeDe: body.dependeDe,
      progreso: body.progreso ?? undefined,
    },
  })

  return NextResponse.json(item)
}

export async function DELETE(request: Request, { params }: { params: { id: string; cid: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  await prisma.cronogramaItem.delete({ where: { id: params.cid } })

  return NextResponse.json({ ok: true })
}
