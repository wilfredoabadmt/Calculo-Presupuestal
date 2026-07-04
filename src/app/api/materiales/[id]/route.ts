import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const material = await prisma.material.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(material)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.material.update({
    where: { id: params.id },
    data: { activo: false },
  })
  return NextResponse.json({ ok: true })
}
