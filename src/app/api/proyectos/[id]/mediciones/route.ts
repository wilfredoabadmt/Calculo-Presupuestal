import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularCostoMedicion, calcularCascadaFinanciera } from "@/lib/financial-calc"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (e) {
    console.error("Error GET mediciones:", e)
    return NextResponse.json([])
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    const { parcial, costoTotal } = calcularCostoMedicion(
      parseFloat(veces) || 1,
      parseFloat(largo) || 0,
      parseFloat(ancho) || 0,
      parseFloat(alto) || 0,
      parseFloat(precioUnitario) || 0
    )

    const medicion = await prisma.medicionPartida.create({
      data: {
        partidaId,
        presupuestoId,
        veces: parseFloat(veces) || 1,
        largo: parseFloat(largo) || 0,
        ancho: parseFloat(ancho) || 0,
        alto: parseFloat(alto) || 0,
        parcial,
        precioUnitario: parseFloat(precioUnitario) || 0,
        costoTotal,
        calculadoraUsada,
        calculadoraDatos: calculadoraDatos || undefined,
      },
      include: { partida: true },
    })

    await recalcularPresupuesto(presupuestoId)

    return NextResponse.json(medicion, { status: 201 })
  } catch (e) {
    console.error("Error POST medicion:", e)
    return NextResponse.json({ error: "Error al crear medición. Verifica que las tablas existan." }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    const { parcial, costoTotal } = calcularCostoMedicion(v, l, a, h, precio)

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
  } catch (e) {
    console.error("Error PUT medicion:", e)
    return NextResponse.json({ error: "Error al actualizar medición" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (e) {
    console.error("Error DELETE medicion:", e)
    return NextResponse.json({ error: "Error al eliminar medición" }, { status: 500 })
  }
}

async function recalcularPresupuesto(presupuestoId: string) {
  try {
    const presupuesto = await prisma.presupuestoDetallado.findUnique({
      where: { id: presupuestoId },
    })
    if (!presupuesto) return

    const result = await prisma.medicionPartida.aggregate({
      where: { presupuestoId },
      _sum: { costoTotal: true },
    })

    const subtotalMaterial = result._sum.costoTotal || 0

    const totales = calcularCascadaFinanciera(
      subtotalMaterial,
      presupuesto.porcentajeBI,
      presupuesto.porcentajeIVA
    )

    await prisma.presupuestoDetallado.update({
      where: { id: presupuestoId },
      data: {
        subtotalMaterial: totales.costoDirecto,
        beneficioIndustrial: totales.beneficioIndustrial,
        baseImponible: totales.baseImponible,
        montoIVA: totales.iva,
        totalPresupuesto: totales.totalGeneral,
      },
    })
  } catch (e) {
    console.error("Error recalculando presupuesto:", e)
  }
}
