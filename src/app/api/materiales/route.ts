import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const grupo = searchParams.get("grupo") || ""

  const where: any = { activo: true }
  if (search) {
    where.OR = [
      { nombre: { contains: search } },
      { codigo: { contains: search } },
    ]
  }
  if (grupo) {
    where.grupo = grupo
  }

  const materiales = await prisma.material.findMany({
    where,
    orderBy: { nombre: "asc" },
  })

  return NextResponse.json(materiales)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { codigo, nombre, unidad, precio, grupo, proveedor, descripcion } = body

  if (!codigo || !nombre || !unidad || precio === undefined || !grupo) {
    return NextResponse.json({ error: "Campos requeridos: codigo, nombre, unidad, precio, grupo" }, { status: 400 })
  }

  const material = await prisma.material.create({
    data: { codigo, nombre, unidad, precio, grupo, proveedor, descripcion },
  })

  return NextResponse.json(material, { status: 201 })
}
