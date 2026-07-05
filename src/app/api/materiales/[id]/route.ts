import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const material = await prisma.material.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(material)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.material.update({
    where: { id },
    data: { activo: false },
  })
  return NextResponse.json({ ok: true })
}
