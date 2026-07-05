import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function verifyOwnership(userId: string, projectId: string) {
  const proyecto = await prisma.proyecto.findUnique({
    where: { id: projectId },
    select: { userId: true },
  })
  if (!proyecto) return { error: "Proyecto no encontrado", status: 404 }
  if (proyecto.userId !== userId) return { error: "No autorizado", status: 403 }
  return null
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyOwnership(session.user.id, id)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    include: {
      elementos: true,
      presupuesto: true,
      cronograma: true,
      _count: { select: { elementos: true } },
    },
  })

  return NextResponse.json(proyecto)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyOwnership(session.user.id, id)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  const body = await request.json()
  const proyecto = await prisma.proyecto.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(proyecto)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyOwnership(session.user.id, id)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  await prisma.proyecto.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
