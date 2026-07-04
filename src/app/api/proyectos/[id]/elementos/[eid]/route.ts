import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string; eid: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const elemento = await prisma.elementoPresupuesto.update({
    where: { id: params.eid },
    data: body,
  })

  return NextResponse.json(elemento)
}

export async function DELETE(request: Request, { params }: { params: { id: string; eid: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  await prisma.elementoPresupuesto.delete({ where: { id: params.eid } })

  return NextResponse.json({ ok: true })
}
