import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const categoria = searchParams.get("categoria") || ""
  const subcategoria = searchParams.get("subcategoria") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const categorias = searchParams.get("categorias") === "true"

  // Solo devolver categorías únicas
  if (categorias) {
    const cats = await prisma.bancoPrecio.groupBy({
      by: ["categoria"],
      _count: { id: true },
      orderBy: { categoria: "asc" },
    })
    return NextResponse.json({
      categorias: cats.map(c => ({ nombre: c.categoria, count: c._count.id })),
    })
  }

  const where: any = {}
  if (search) {
    where.actividad = { contains: search }
  }
  if (categoria) {
    where.categoria = categoria
  }
  if (subcategoria) {
    where.subcategoria = subcategoria
  }

  const [items, total] = await Promise.all([
    prisma.bancoPrecio.findMany({
      where,
      orderBy: { actividad: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bancoPrecio.count({ where }),
  ])

  const mapped = items.map(i => ({
    id: i.id,
    codigo: i.codigo || i.id.slice(0, 8).toUpperCase(),
    actividad: i.actividad,
    unidad: i.unidad,
    precioUnitario: i.precioUnitario,
    categoria: i.categoria,
    subcategoria: i.subcategoria,
  }))

  return NextResponse.json({
    items: mapped,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
