import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function verifyElementOwnership(userId: string, projectId: string, elementId: string) {
  const proyecto = await prisma.proyecto.findUnique({
    where: { id: projectId },
    select: { userId: true },
  })
  if (!proyecto) return { error: "Proyecto no encontrado", status: 404 }
  if (proyecto.userId !== userId) return { error: "No autorizado", status: 403 }
  const elemento = await prisma.elementoPresupuesto.findUnique({
    where: { id: elementId },
    select: { proyectoId: true },
  })
  if (!elemento || elemento.proyectoId !== projectId) return { error: "Elemento no encontrado", status: 404 }
  return null
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; eid: string }> }) {
  const { id, eid } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyElementOwnership(session.user.id, id, eid)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  const body = await request.json()
  const elemento = await prisma.elementoPresupuesto.update({
    where: { id: eid },
    data: body,
  })

  return NextResponse.json(elemento)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; eid: string }> }) {
  const { id, eid } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyElementOwnership(session.user.id, id, eid)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  await prisma.elementoPresupuesto.delete({ where: { id: eid } })

  return NextResponse.json({ ok: true })
}
