import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const categoria = searchParams.get("categoria") || ""

  const where: any = {}
  if (search) {
    where.actividad = { contains: search }
  }
  if (categoria) {
    where.categoria = categoria
  }

  const items = await prisma.bancoPrecioGMLP.findMany({
    where,
    orderBy: { actividad: "asc" },
    take: 100,
  })

  const total = await prisma.bancoPrecioGMLP.count({ where })

  const mapped = items.map(i => ({
    id: i.id,
    codigo: i.id.slice(0, 8).toUpperCase(),
    actividad: i.actividad,
    descripcion: i.actividad,
    unidad: i.unidad,
    categoria: i.categoria,
    subcategoria: i.subcategoria,
    precioUnitario: i.precioUnitario,
    materiales: i.materiales,
    manoObra: i.manoObra,
  }))

  return NextResponse.json({ items: mapped, total })
}
