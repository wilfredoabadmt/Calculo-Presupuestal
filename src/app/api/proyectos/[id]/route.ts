import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: params.id },
    include: {
      elementos: true,
      presupuesto: true,
      cronograma: true,
      _count: { select: { elementos: true } },
    },
  })

  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
  }

  return NextResponse.json(proyecto)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const proyecto = await prisma.proyecto.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(proyecto)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  await prisma.proyecto.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
