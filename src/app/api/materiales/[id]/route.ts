import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  // Buscar el material actual
  const existingMaterial = await prisma.material.findUnique({
    where: { id }
  })
  if (!existingMaterial) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  // Obtener workspace del usuario
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })
  const workspaceId = member?.workspaceId || null

  // Si el material es global (workspaceId es null) y el usuario pertenece a un workspace
  if (existingMaterial.workspaceId === null && workspaceId !== null) {
    // Si están intentando actualizar el precio, creamos o actualizamos un override
    if (body.precio !== undefined) {
      const customPrice = await prisma.workspaceMaterialPrice.upsert({
        where: {
          workspaceId_materialId: {
            workspaceId,
            materialId: id
          }
        },
        update: {
          precio: parseFloat(body.precio)
        },
        create: {
          workspaceId,
          materialId: id,
          precio: parseFloat(body.precio)
        }
      })
      
      return NextResponse.json({
        ...existingMaterial,
        precio: customPrice.precio
      })
    } else {
      return NextResponse.json({ error: "No puedes editar campos estructurales de materiales globales" }, { status: 403 })
    }
  }

  // Si el material pertenece al workspace del usuario
  if (existingMaterial.workspaceId === workspaceId) {
    const updated = await prisma.material.update({
      where: { id },
      data: {
        nombre: body.nombre,
        unidad: body.unidad,
        precio: body.precio !== undefined ? parseFloat(body.precio) : undefined,
        grupo: body.grupo,
        subcategoria: body.subcategoria,
        proveedor: body.proveedor,
        descripcion: body.descripcion
      }
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "No autorizado para modificar este material" }, { status: 403 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params

  const existingMaterial = await prisma.material.findUnique({
    where: { id }
  })
  if (!existingMaterial) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })
  const workspaceId = member?.workspaceId || null

  // No se permite borrar materiales globales
  if (existingMaterial.workspaceId === null) {
    return NextResponse.json({ error: "No se pueden eliminar materiales de referencia global" }, { status: 403 })
  }

  // Solo se pueden borrar materiales del propio workspace
  if (existingMaterial.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  await prisma.material.update({
    where: { id },
    data: { activo: false },
  })
  return NextResponse.json({ ok: true })
}
