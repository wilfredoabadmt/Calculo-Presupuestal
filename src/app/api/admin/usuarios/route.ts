import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      planExpiresAt: true,
      workspaceEnabled: true,
      workspaceExpiresAt: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { proyectos: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(usuarios)
}
