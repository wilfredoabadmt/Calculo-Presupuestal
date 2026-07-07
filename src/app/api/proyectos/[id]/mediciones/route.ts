import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const presupuestoId = searchParams.get("presupuestoId")

  const where: any = {}
  if (presupuestoId) {
    where.presupuestoId = presupuestoId
  } else {
    const pd = await prisma.presupuestoDetallado.findUnique({ where: { proyectoId: id } })
    if (pd) where.presupuestoId = pd.id
    else return NextResponse.json([])
  }

  const mediciones = await prisma.medicionPartida.findMany({
    where,
    include: {
      partida: {
        include: { capitulo: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(mediciones)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const {
    partidaId,
    presupuestoId,
    veces,
    largo,
    ancho,
    alto,
    precioUnitario,
    calculadoraUsada,
    calculadoraDatos,
  } = body

  if (!partidaId || !presupuestoId) {
    return NextResponse.json(
      { error: "Campos requeridos: partidaId, presupuestoId" },
      { status: 400 }
    )
  }

  const v = parseFloat(veces) || 1
  const l = parseFloat(largo) || 0
  const a = parseFloat(ancho) || 0
  const h = parseFloat(alto) || 0
  const parcial = v * l * a * h
  const precio = parseFloat(precioUnitario) || 0
  const costoTotal = parcial * precio

  const medicion = await prisma.medicionPartida.create({
    data: {
      partidaId,
      presupuestoId,
      veces: v,
      largo: l,
      ancho: a,
      alto: h,
      parcial,
      precioUnitario: precio,
      costoTotal,
      calculadoraUsada,
      calculadoraDatos,
    },
    include: { partida: true },
  })

  await recalcularPresupuesto(presupuestoId)

  return NextResponse.json(medicion, { status: 201 })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { medicionId, veces, largo, ancho, alto, precioUnitario, calculadoraUsada, calculadoraDatos } = body

  if (!medicionId) {
    return NextResponse.json({ error: "Se requiere medicionId" }, { status: 400 })
  }

  const existing = await prisma.medicionPartida.findUnique({ where: { id: medicionId } })
  if (!existing) {
    return NextResponse.json({ error: "Medición no encontrada" }, { status: 404 })
  }

  const v = veces !== undefined ? parseFloat(veces) : existing.veces
  const l = largo !== undefined ? parseFloat(largo) : existing.largo
  const a = ancho !== undefined ? parseFloat(ancho) : existing.ancho
  const h = alto !== undefined ? parseFloat(alto) : existing.alto
  const precio = precioUnitario !== undefined ? parseFloat(precioUnitario) : existing.precioUnitario
  const parcial = v * l * a * h
  const costoTotal = parcial * precio

  const medicion = await prisma.medicionPartida.update({
    where: { id: medicionId },
    data: {
      veces: v,
      largo: l,
      ancho: a,
      alto: h,
      parcial,
      precioUnitario: precio,
      costoTotal,
      calculadoraUsada: calculadoraUsada !== undefined ? calculadoraUsada : existing.calculadoraUsada,
      calculadoraDatos: calculadoraDatos !== undefined ? calculadoraDatos : existing.calculadoraDatos,
    },
    include: { partida: true },
  })

  await recalcularPresupuesto(existing.presupuestoId)

  return NextResponse.json(medicion)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const medicionId = searchParams.get("medicionId")

  if (!medicionId) {
    return NextResponse.json({ error: "Se requiere medicionId" }, { status: 400 })
  }

  const existing = await prisma.medicionPartida.findUnique({ where: { id: medicionId } })
  if (!existing) {
    return NextResponse.json({ error: "Medición no encontrada" }, { status: 404 })
  }

  await prisma.medicionPartida.delete({ where: { id: medicionId } })

  await recalcularPresupuesto(existing.presupuestoId)

  return NextResponse.json({ ok: true })
}

async function recalcularPresupuesto(presupuestoId: string) {
  const presupuesto = await prisma.presupuestoDetallado.findUnique({
    where: { id: presupuestoId },
  })
  if (!presupuesto) return

  const result = await prisma.medicionPartida.aggregate({
    where: { presupuestoId },
    _sum: { costoTotal: true },
  })

  const subtotalMaterial = result._sum.costoTotal || 0
  const beneficioIndustrial = subtotalMaterial * (presupuesto.porcentajeBI / 100)
  const baseImponible = subtotalMaterial + beneficioIndustrial
  const montoIVA = baseImponible * (presupuesto.porcentajeIVA / 100)
  const totalPresupuesto = baseImponible + montoIVA

  await prisma.presupuestoDetallado.update({
    where: { id: presupuestoId },
    data: {
      subtotalMaterial,
      beneficioIndustrial,
      baseImponible,
      montoIVA,
      totalPresupuesto,
    },
  })
}
