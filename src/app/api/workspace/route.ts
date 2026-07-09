import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasActiveWorkspace } from "@/lib/workspace-access"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                }
              }
            }
          },
          proyectos: {
            select: {
              id: true,
              nombre: true,
              cliente: true,
              empresa: true,
              fecha: true,
            }
          }
        }
      }
    }
  })

  if (!member) {
    // Sin workspace: informar si el usuario puede crear uno (permiso activo)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, workspaceEnabled: true, workspaceExpiresAt: true },
    })
    return NextResponse.json(
      {
        error: "No tienes ningún espacio de trabajo asignado",
        canCreate: hasActiveWorkspace(user),
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    workspace: member.workspace,
    role: member.role
  })
}

// Crear un espacio de trabajo (auto-servicio, requiere permiso de Equipo activo)
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  // Validar el permiso contra la BD (la sesión puede estar desactualizada)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, workspaceEnabled: true, workspaceExpiresAt: true },
  })

  if (!hasActiveWorkspace(user)) {
    return NextResponse.json(
      { error: "No tienes activada la función de Equipo. Contáctate con el administrador para habilitarla." },
      { status: 403 }
    )
  }

  // Un usuario no puede pertenecer a más de un espacio de trabajo
  const existing = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json(
      { error: "Ya perteneces a un espacio de trabajo." },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { name } = body

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Nombre del espacio de trabajo es requerido (mínimo 2 caracteres)" },
      { status: 400 }
    )
  }

  // Crear el workspace y asignar al creador como ADMIN de la organización
  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      members: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  })

  return NextResponse.json({ workspace, role: "ADMIN" }, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  // Validar si el usuario tiene permiso de workspace activo
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, workspaceEnabled: true, workspaceExpiresAt: true, plan: true, planExpiresAt: true },
  })

  if (!hasActiveWorkspace(user)) {
    return NextResponse.json(
      { error: "No tienes activada la función de Equipo. Contáctate con el administrador para habilitarla." },
      { status: 403 }
    )
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })

  if (!member || member.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado. Debes ser ADMIN del espacio de trabajo." }, { status: 403 })
  }

  const body = await request.json()
  const { name } = body

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Nombre del espacio de trabajo es requerido (mínimo 2 caracteres)" }, { status: 400 })
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { id: member.workspaceId },
    data: { name: name.trim() }
  })

  return NextResponse.json(updatedWorkspace)
}
