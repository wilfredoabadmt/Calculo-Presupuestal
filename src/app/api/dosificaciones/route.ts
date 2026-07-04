import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo") || "concreto"

  if (tipo === "concreto") {
    const dosificaciones = await prisma.dosificacionConcreto.findMany({ orderBy: { ratio: "asc" } })
    return NextResponse.json(dosificaciones)
  }

  if (tipo === "mortero") {
    const dosificaciones = await prisma.dosificacionMortero.findMany({ orderBy: { ratio: "asc" } })
    return NextResponse.json(dosificaciones)
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
}
