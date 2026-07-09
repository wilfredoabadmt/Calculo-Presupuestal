import { NextResponse } from "next/server"
import { getWorkspacePricing } from "@/lib/workspace-access"

// Configuración pública (precio del módulo de Equipo) para la página de precios
export async function GET() {
  const pricing = await getWorkspacePricing()
  return NextResponse.json(pricing)
}
