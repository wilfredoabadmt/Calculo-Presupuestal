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
    materiales: i.materiales,
    manoObra: i.manoObra,
    beneficiosSociales: i.beneficiosSociales,
    iva: i.iva,
    equipoMaquinaria: i.equipoMaquinaria,
    gastosGenerales: i.gastosGenerales,
    utilidad: i.utilidad,
    it: i.it,
  }))

  return NextResponse.json({
    items: mapped,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      codigo,
      actividad,
      unidad,
      categoria,
      subcategoria,
      precioUnitario,
      materiales,
      manoObra,
      beneficiosSociales,
      iva,
      equipoMaquinaria,
      gastosGenerales,
      utilidad,
      it,
    } = body

    const newItem = await prisma.bancoPrecio.create({
      data: {
        codigo: codigo || null,
        actividad,
        unidad,
        cantidad: 1,
        categoria,
        subcategoria: subcategoria || null,
        precioUnitario: parseFloat(precioUnitario) || 0,
        materiales: materiales ? (typeof materiales === "string" ? materiales : JSON.stringify(materiales)) : "[]",
        manoObra: manoObra ? (typeof manoObra === "string" ? manoObra : JSON.stringify(manoObra)) : "[]",
        beneficiosSociales: parseFloat(beneficiosSociales) ?? 71.18,
        iva: parseFloat(iva) ?? 14.94,
        equipoMaquinaria: parseFloat(equipoMaquinaria) ?? 5,
        gastosGenerales: parseFloat(gastosGenerales) ?? 11,
        utilidad: parseFloat(utilidad) ?? 7,
        it: parseFloat(it) ?? 3.09,
      },
    })

    return NextResponse.json(newItem)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear el ítem" }, { status: 500 })
  }
}
