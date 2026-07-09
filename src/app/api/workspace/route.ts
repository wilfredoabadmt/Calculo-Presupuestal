import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
    return NextResponse.json({ error: "No tienes ningún espacio de trabajo asignado" }, { status: 404 })
  }

  return NextResponse.json({
    workspace: member.workspace,
    role: member.role
  })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
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
