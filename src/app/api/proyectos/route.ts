import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const proyectos = await prisma.proyecto.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { elementos: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(proyectos)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { nombre, cliente, empresa, fecha, validez, moneda, descripcion } = body

  if (!nombre || !cliente || !empresa) {
    return NextResponse.json({ error: "Nombre, cliente y empresa son requeridos" }, { status: 400 })
  }

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre,
      cliente,
      empresa,
      fecha: fecha ? new Date(fecha) : new Date(),
      validez: validez || 30,
      moneda: moneda || "Bs.",
      descripcion,
      userId: session.user.id,
    },
  })

  return NextResponse.json(proyecto, { status: 201 })
}
