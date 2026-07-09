import { prisma } from "@/lib/prisma"

/**
 * Configuración por defecto del precio mensual del módulo de Equipo/Workspace.
 * Se usa como respaldo cuando el administrador aún no ha configurado un valor
 * en AppSetting.
 */
export const WORKSPACE_SETTING_KEYS = {
  priceMonthly: "workspace_price_monthly",
  currency: "workspace_currency",
} as const

export const WORKSPACE_PRICE_DEFAULTS = {
  priceMonthly: 29,
  currency: "USD",
}

/**
 * Forma mínima de usuario necesaria para evaluar el acceso al módulo de Equipo.
 * Compatible tanto con el registro de la BD como con el objeto de sesión.
 */
export interface WorkspaceAccessUser {
  workspaceEnabled?: boolean | null
  workspaceExpiresAt?: Date | string | null
  role?: string | null
  plan?: string | null
  planExpiresAt?: Date | string | null
}

/**
 * Límite de proyectos del plan FREE.
 */
export const FREE_PROJECT_LIMIT = 1

/**
 * Forma mínima de usuario para evaluar el plan efectivo.
 */
export interface PlanUser {
  plan?: string | null
  planExpiresAt?: Date | string | null
  role?: string | null
}

/**
 * Determina si el usuario tiene plan PRO activo.
 *
 * Reglas:
 * - El administrador del sistema (role ADMIN) siempre es PRO.
 * - Requiere plan "PRO". Si hay fecha de expiración, no debe estar vencida.
 * - Un PRO vencido se considera FREE.
 */
export function isProActive(user: PlanUser | null | undefined): boolean {
  if (!user) return false
  if (user.role === "ADMIN") return true
  if (user.plan !== "PRO") return false
  if (user.planExpiresAt) {
    const expiry = new Date(user.planExpiresAt)
    if (expiry.getTime() < Date.now()) return false
  }
  return true
}

/**
 * Determina si un usuario tiene acceso activo al módulo de Equipo/Workspace.
 *
 * Reglas:
 * - El administrador del sistema (role ADMIN) siempre tiene acceso.
 * - El plan FREE nunca tiene acceso: se requiere plan PRO activo.
 * - Además se requiere el permiso habilitado (workspaceEnabled) sin vencer.
 *   Sin fecha de expiración = permanente.
 */
export function hasActiveWorkspace(user: WorkspaceAccessUser | null | undefined): boolean {
  if (!user) return false

  if (user.role === "ADMIN") return true

  // El módulo de Equipo incluye todo lo del plan Pro: requiere Pro activo.
  if (!isProActive(user)) return false

  if (!user.workspaceEnabled) return false

  if (user.workspaceExpiresAt) {
    const expiry = new Date(user.workspaceExpiresAt)
    if (expiry.getTime() < Date.now()) return false
  }

  return true
}

/**
 * Lee el precio mensual y la moneda del módulo de Equipo desde AppSetting,
 * aplicando los valores por defecto cuando no están configurados.
 */
export async function getWorkspacePricing(): Promise<{ priceMonthly: number; currency: string }> {
  const settings = await prisma.appSetting.findMany({
    where: {
      key: { in: [WORKSPACE_SETTING_KEYS.priceMonthly, WORKSPACE_SETTING_KEYS.currency] },
    },
  })

  const map = new Map(settings.map((s) => [s.key, s.value]))

  const rawPrice = map.get(WORKSPACE_SETTING_KEYS.priceMonthly)
  const parsedPrice = rawPrice != null ? Number(rawPrice) : NaN

  return {
    priceMonthly: Number.isFinite(parsedPrice) ? parsedPrice : WORKSPACE_PRICE_DEFAULTS.priceMonthly,
    currency: map.get(WORKSPACE_SETTING_KEYS.currency) || WORKSPACE_PRICE_DEFAULTS.currency,
  }
}
