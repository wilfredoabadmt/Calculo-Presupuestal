import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// Agregar miembro al Workspace
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  // 1. Obtener workspace y validar rol del solicitante
  const requesterMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })
  if (!requesterMember || requesterMember.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado. Debes ser ADMIN del espacio de trabajo." }, { status: 403 })
  }

  const body = await request.json()
  const { email, role } = body

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "El correo electrónico es requerido" }, { status: 400 })
  }

  const memberRole = role === "ADMIN" ? "ADMIN" : "MEMBER"

  // 2. Buscar al usuario destino por email
  const targetUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() }
  })

  if (!targetUser) {
    return NextResponse.json({ 
      error: "El usuario no está registrado. Debe registrarse en la plataforma antes de ser invitado a tu equipo." 
    }, { status: 404 })
  }

  // 3. Verificar si ya es miembro de este espacio de trabajo
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: requesterMember.workspaceId,
        userId: targetUser.id
      }
    }
  })

  if (existingMember) {
    return NextResponse.json({ error: "El usuario ya es miembro de tu espacio de trabajo" }, { status: 400 })
  }

  // 4. Crear el miembro
  const newMember = await prisma.workspaceMember.create({
    data: {
      workspaceId: requesterMember.workspaceId,
      userId: targetUser.id,
      role: memberRole
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return NextResponse.json(newMember, { status: 201 })
}

// Modificar rol de miembro
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const requesterMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })
  if (!requesterMember || requesterMember.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado. Debes ser ADMIN." }, { status: 403 })
  }

  const body = await request.json()
  const { memberId, role } = body

  if (!memberId || !role || (role !== "ADMIN" && role !== "MEMBER")) {
    return NextResponse.json({ error: "Campos requeridos: memberId, role ('ADMIN' o 'MEMBER')" }, { status: 400 })
  }

  // Buscar al miembro a modificar
  const targetMember = await prisma.workspaceMember.findUnique({
    where: { id: memberId }
  })

  if (!targetMember || targetMember.workspaceId !== requesterMember.workspaceId) {
    return NextResponse.json({ error: "Miembro no encontrado en este espacio de trabajo" }, { status: 404 })
  }

  // Evitar cambiarse el rol a uno mismo si es el único ADMIN
  if (targetMember.userId === session.user.id && role !== "ADMIN") {
    const adminCount = await prisma.workspaceMember.count({
      where: {
        workspaceId: requesterMember.workspaceId,
        role: "ADMIN"
      }
    })
    if (adminCount <= 1) {
      return NextResponse.json({ error: "No puedes quitarte el rol de ADMIN si eres el único administrador" }, { status: 400 })
    }
  }

  const updatedMember = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return NextResponse.json(updatedMember)
}

// Eliminar miembro del Workspace
export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const requesterMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })
  if (!requesterMember || requesterMember.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado. Debes ser ADMIN." }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")

  if (!memberId) {
    return NextResponse.json({ error: "memberId es requerido" }, { status: 400 })
  }

  const targetMember = await prisma.workspaceMember.findUnique({
    where: { id: memberId }
  })

  if (!targetMember || targetMember.workspaceId !== requesterMember.workspaceId) {
    return NextResponse.json({ error: "Miembro no encontrado en este espacio de trabajo" }, { status: 404 })
  }

  // Evitar eliminarse a uno mismo
  if (targetMember.userId === session.user.id) {
    return NextResponse.json({ error: "No puedes eliminarte a ti mismo del espacio de trabajo" }, { status: 400 })
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId }
  })

  return NextResponse.json({ ok: true })
}
