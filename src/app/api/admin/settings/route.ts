import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import {
  WORKSPACE_SETTING_KEYS,
  getWorkspacePricing,
} from "@/lib/workspace-access"

// Leer la configuración global del sistema (solo ADMIN)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const pricing = await getWorkspacePricing()
  return NextResponse.json(pricing)
}

// Actualizar la configuración global del sistema (solo ADMIN)
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await request.json()
  const { priceMonthly, currency } = body

  if (priceMonthly !== undefined) {
    const parsed = Number(priceMonthly)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return NextResponse.json({ error: "Precio mensual inválido" }, { status: 400 })
    }
    await prisma.appSetting.upsert({
      where: { key: WORKSPACE_SETTING_KEYS.priceMonthly },
      create: { key: WORKSPACE_SETTING_KEYS.priceMonthly, value: String(parsed) },
      update: { value: String(parsed) },
    })
  }

  if (currency !== undefined) {
    if (typeof currency !== "string" || currency.trim().length < 1 || currency.trim().length > 8) {
      return NextResponse.json({ error: "Moneda inválida" }, { status: 400 })
    }
    await prisma.appSetting.upsert({
      where: { key: WORKSPACE_SETTING_KEYS.currency },
      create: { key: WORKSPACE_SETTING_KEYS.currency, value: currency.trim() },
      update: { value: currency.trim() },
    })
  }

  const pricing = await getWorkspacePricing()
  return NextResponse.json(pricing)
}
