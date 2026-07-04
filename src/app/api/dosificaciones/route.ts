import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo") || "concreto"
  const ratio = searchParams.get("ratio") || ""

  if (tipo === "concreto") {
    if (ratio) {
      const dosificacion = await prisma.dosificacionConcreto.findUnique({ where: { ratio } })
      return NextResponse.json(dosificacion || null)
    }
    const dosificaciones = await prisma.dosificacionConcreto.findMany({ orderBy: { ratio: "asc" } })
    return NextResponse.json(dosificaciones)
  }

  if (tipo === "mortero") {
    if (ratio) {
      const dosificacion = await prisma.dosificacionMortero.findUnique({ where: { ratio } })
      return NextResponse.json(dosificacion || null)
    }
    const dosificaciones = await prisma.dosificacionMortero.findMany({ orderBy: { ratio: "asc" } })
    return NextResponse.json(dosificaciones)
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
}
