import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularCascadaFinanciera } from "@/lib/financial-calc"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let presupuesto = await prisma.presupuestoDetallado.findUnique({
    where: { proyectoId: id },
  })

  if (!presupuesto) {
    presupuesto = await prisma.presupuestoDetallado.create({
      data: { proyectoId: id },
    })
  }

  return NextResponse.json(presupuesto)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const {
    empresaNombre,
    empresaDireccion,
    empresaCif,
    empresaTelefono,
    empresaLogo,
    clienteNombre,
    clienteDireccion,
    clientePoblacion,
    clienteCif,
    proyectoNombre,
    fechaEmision,
    codigoPresupuesto,
    porcentajeBI,
    porcentajeIVA,
  } = body

  let presupuesto = await prisma.presupuestoDetallado.findUnique({
    where: { proyectoId: id },
  })

  if (!presupuesto) {
    presupuesto = await prisma.presupuestoDetallado.create({
      data: { proyectoId: id },
    })
  }

  const updateData: any = {}
  if (empresaNombre !== undefined) updateData.empresaNombre = empresaNombre
  if (empresaDireccion !== undefined) updateData.empresaDireccion = empresaDireccion
  if (empresaCif !== undefined) updateData.empresaCif = empresaCif
  if (empresaTelefono !== undefined) updateData.empresaTelefono = empresaTelefono
  if (empresaLogo !== undefined) updateData.empresaLogo = empresaLogo
  if (clienteNombre !== undefined) updateData.clienteNombre = clienteNombre
  if (clienteDireccion !== undefined) updateData.clienteDireccion = clienteDireccion
  if (clientePoblacion !== undefined) updateData.clientePoblacion = clientePoblacion
  if (clienteCif !== undefined) updateData.clienteCif = clienteCif
  if (proyectoNombre !== undefined) updateData.proyectoNombre = proyectoNombre
  if (fechaEmision !== undefined) updateData.fechaEmision = new Date(fechaEmision)
  if (codigoPresupuesto !== undefined) updateData.codigoPresupuesto = codigoPresupuesto
  if (porcentajeBI !== undefined) updateData.porcentajeBI = parseFloat(porcentajeBI)
  if (porcentajeIVA !== undefined) updateData.porcentajeIVA = parseFloat(porcentajeIVA)

  presupuesto = await prisma.presupuestoDetallado.update({
    where: { id: presupuesto.id },
    data: updateData,
  })

  if (porcentajeBI !== undefined || porcentajeIVA !== undefined) {
    await recalcularTotales(presupuesto.id)
  }

  return NextResponse.json(presupuesto)
}

async function recalcularTotales(presupuestoId: string) {
  const presupuesto = await prisma.presupuestoDetallado.findUnique({
    where: { id: presupuestoId },
  })
  if (!presupuesto) return

  const result = await prisma.medicionPartida.aggregate({
    where: { presupuestoId },
    _sum: { costoTotal: true },
  })

  const subtotalMaterial = result._sum.costoTotal || 0

  // Usar precisión decimal para la cascada financiera
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
}
