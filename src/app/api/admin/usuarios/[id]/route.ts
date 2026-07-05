import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { plan, planExpiresAt } = body

    // Validate plan
    if (plan !== undefined && plan !== "FREE" && plan !== "PRO") {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(plan !== undefined && { plan }),
        planExpiresAt: planExpiresAt !== undefined 
          ? (planExpiresAt ? new Date(planExpiresAt) : null) 
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
