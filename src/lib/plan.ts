/**
 * Lógica pura de planes (FREE/PRO). Sin dependencias de servidor (Prisma),
 * para poder usarse tanto en el backend como en componentes cliente.
 */

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
