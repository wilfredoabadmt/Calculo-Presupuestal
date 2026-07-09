import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { isProActive, FREE_PROJECT_LIMIT } from "@/lib/workspace-access"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const proyectos = await prisma.proyecto.findMany({
    where: { userId: session.user.id },
    include: { 
      _count: { select: { elementos: true } },
      presupuesto: { select: { totalGeneral: true } },
      presupuestoDetallado: { select: { totalPresupuesto: true } }
    },
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

  // Límite de proyectos del plan FREE. El plan PRO (o ADMIN) no tiene límite.
  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true, role: true },
  })

  if (!isProActive(usuario)) {
    const proyectosCount = await prisma.proyecto.count({
      where: { userId: session.user.id },
    })

    if (proyectosCount >= FREE_PROJECT_LIMIT) {
      return NextResponse.json(
        {
          error: `El plan FREE permite un máximo de ${FREE_PROJECT_LIMIT} proyecto. Actualiza a PRO para crear más.`,
          code: "FREE_PROJECT_LIMIT_REACHED",
        },
        { status: 403 }
      )
    }
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
