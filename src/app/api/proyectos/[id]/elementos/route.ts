import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function verifyProjectOwnership(userId: string, projectId: string) {
  const proyecto = await prisma.proyecto.findUnique({
    where: { id: projectId },
    select: { userId: true },
  })
  if (!proyecto) return { error: "Proyecto no encontrado", status: 404 }
  if (proyecto.userId !== userId) return { error: "No autorizado", status: 403 }
  return null
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyProjectOwnership(session.user.id, params.id)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  const elementos = await prisma.elementoPresupuesto.findMany({
    where: { proyectoId: params.id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(elementos)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyProjectOwnership(session.user.id, params.id)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  const body = await request.json()
  const {
    tipoElemento, descripcion, cantidad,
    dimA, dimB, dimH, dimLargo, dimAncho, dimEspesor,
    dosificacionConcretoId, resistencia, desperdicio,
    tipoBloqueId, tipoCeramicaId, tipoTejaId,
    aceroLongitudinal, estribos, materiales, costoTotal,
  } = body

  const elemento = await prisma.elementoPresupuesto.create({
    data: {
      proyectoId: params.id,
      tipoElemento,
      descripcion,
      cantidad: cantidad || 1,
      dimA, dimB, dimH, dimLargo, dimAncho, dimEspesor,
      dosificacionConcretoId, resistencia, desperdicio,
      tipoBloqueId, tipoCeramicaId, tipoTejaId,
      aceroLongitudinal: aceroLongitudinal ? JSON.stringify(aceroLongitudinal) : null,
      estribos: estribos ? JSON.stringify(estribos) : null,
      materiales: materiales ? JSON.stringify(materiales) : null,
      costoTotal: costoTotal || 0,
    },
  })

  return NextResponse.json(elemento, { status: 201 })
}
