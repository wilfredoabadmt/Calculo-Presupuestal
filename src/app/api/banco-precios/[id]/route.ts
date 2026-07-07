import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      codigo,
      actividad,
      unidad,
      categoria,
      subcategoria,
      precioUnitario,
      materiales,
      manoObra,
      beneficiosSociales,
      iva,
      equipoMaquinaria,
      gastosGenerales,
      utilidad,
      it,
    } = body

    const updated = await prisma.bancoPrecio.update({
      where: { id },
      data: {
        codigo: codigo || null,
        actividad,
        unidad,
        categoria,
        subcategoria: subcategoria || null,
        precioUnitario: parseFloat(precioUnitario) || 0,
        materiales: materiales ? (typeof materiales === "string" ? materiales : JSON.stringify(materiales)) : "[]",
        manoObra: manoObra ? (typeof manoObra === "string" ? manoObra : JSON.stringify(manoObra)) : "[]",
        beneficiosSociales: parseFloat(beneficiosSociales) ?? 71.18,
        iva: parseFloat(iva) ?? 14.94,
        equipoMaquinaria: parseFloat(equipoMaquinaria) ?? 5,
        gastosGenerales: parseFloat(gastosGenerales) ?? 11,
        utilidad: parseFloat(utilidad) ?? 7,
        it: parseFloat(it) ?? 3.09,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al actualizar el ítem" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.bancoPrecio.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al eliminar el ítem" }, { status: 500 })
  }
}
