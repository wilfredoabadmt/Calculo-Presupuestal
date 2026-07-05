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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyProjectOwnership(session.user.id, id)
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError.error }, { status: ownershipError.status })
  }

  const elementos = await prisma.elementoPresupuesto.findMany({
    where: { proyectoId: id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(elementos)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const ownershipError = await verifyProjectOwnership(session.user.id, id)
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

  if (!tipoElemento || typeof tipoElemento !== "string") {
    return NextResponse.json({ error: "tipoElemento es requerido" }, { status: 400 })
  }
  if (!descripcion || typeof descripcion !== "string") {
    return NextResponse.json({ error: "descripcion es requerida" }, { status: 400 })
  }
  if (cantidad !== undefined && (typeof cantidad !== "number" || cantidad <= 0)) {
    return NextResponse.json({ error: "cantidad debe ser un numero positivo" }, { status: 400 })
  }
  if (costoTotal !== undefined && (typeof costoTotal !== "number" || costoTotal <= 0)) {
    return NextResponse.json({ error: "costoTotal debe ser un numero positivo" }, { status: 400 })
  }

  const stringifyIfObject = (value: unknown): string | null => {
    if (value == null) return null
    if (typeof value === "string") return value
    return JSON.stringify(value)
  }

  const elemento = await prisma.elementoPresupuesto.create({
    data: {
      proyectoId: id,
      tipoElemento,
      descripcion,
      cantidad: cantidad || 1,
      dimA, dimB, dimH, dimLargo, dimAncho, dimEspesor,
      dosificacionConcretoId, resistencia, desperdicio,
      tipoBloqueId, tipoCeramicaId, tipoTejaId,
      aceroLongitudinal: stringifyIfObject(aceroLongitudinal),
      estribos: stringifyIfObject(estribos),
      materiales: stringifyIfObject(materiales),
      costoTotal: costoTotal || 0,
    },
  })

  return NextResponse.json(elemento, { status: 201 })
}
