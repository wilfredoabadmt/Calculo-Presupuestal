import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await auth()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const grupo = searchParams.get("grupo") || ""
  const subcategoria = searchParams.get("subcategoria") || ""

  const where: any = { activo: true }

  // Aislamiento por Workspace
  let workspaceId: string | null = null
  if (session?.user?.id) {
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id }
    })
    if (member) {
      workspaceId = member.workspaceId
    }
  }

  // Devolver materiales globales y de este workspace
  where.OR = [
    { workspaceId: null }
  ]
  if (workspaceId) {
    where.OR.push({ workspaceId })
  }

  // Si hay búsqueda por texto, combinarla con el filtro de visibilidad
  if (search) {
    const searchFilter = {
      OR: [
        { nombre: { contains: search, mode: "insensitive" } },
        { codigo: { contains: search, mode: "insensitive" } },
      ]
    }
    where.AND = [
      { OR: where.OR },
      searchFilter
    ]
    delete where.OR
  }

  if (grupo) {
    where.grupo = grupo
  }
  if (subcategoria) {
    where.subcategoria = subcategoria
  }

  const materiales = await prisma.material.findMany({
    where,
    orderBy: { nombre: "asc" },
  })

  // Cargar y fusionar los precios personalizados del workspace
  if (workspaceId) {
    const customPrices = await prisma.workspaceMaterialPrice.findMany({
      where: { workspaceId }
    })

    const priceMap = new Map(customPrices.map(cp => [cp.materialId, cp.precio]))

    materiales.forEach(m => {
      if (priceMap.has(m.id)) {
        m.precio = priceMap.get(m.id)!
      }
    })
  }

  return NextResponse.json(materiales)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const { codigo, nombre, unidad, precio, grupo, subcategoria, proveedor, descripcion } = body

  if (!codigo || !nombre || !unidad || precio === undefined || !grupo) {
    return NextResponse.json({ error: "Campos requeridos: codigo, nombre, unidad, precio, grupo" }, { status: 400 })
  }

  // Obtener el workspace del usuario
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })

  const material = await prisma.material.create({
    data: { 
      codigo, 
      nombre, 
      unidad, 
      precio: parseFloat(precio), 
      grupo, 
      subcategoria, 
      proveedor, 
      descripcion,
      workspaceId: member?.workspaceId || null
    },
  })

  return NextResponse.json(material, { status: 201 })
}
