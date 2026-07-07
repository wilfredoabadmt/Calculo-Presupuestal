import { Decimal } from 'decimal.js'

// Configurar precisión monetaria global
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

export interface BudgetResult {
  costoDirecto: number
  beneficioIndustrial: number
  baseImponible: number
  iva: number
  totalGeneral: number
}

/**
 * Calcula la cascada financiera completa del presupuesto
 * con precisión decimal exacta (ROUND_HALF_UP)
 *
 * Fórmulas:
 * 1. CD = Suma de (Medición Total × Precio Unitario Base)
 * 2. BI_monto = redondear(CD × BI%)
 * 3. Base Imponible = CD + BI_monto
 * 4. IVA_monto = redondear(Base Imponible × IVA%)
 * 5. Total = Base Imponible + IVA_monto
 */
export function calcularCascadaFinanciera(
  subtotalMaterial: number,
  biPct: number,
  ivaPct: number
): BudgetResult {
  const CD = new Decimal(subtotalMaterial)
  const biPercent = new Decimal(biPct).div(100)
  const ivaPercent = new Decimal(ivaPct).div(100)

  // 2. Beneficio Industrial con redondeo a 2 decimales
  const BI_monto = CD.times(biPercent).toDecimalPlaces(2)

  // 3. Base Imponible
  const baseImponible = CD.plus(BI_monto)

  // 4. IVA con redondeo a 2 decimales
  const IVA_monto = baseImponible.times(ivaPercent).toDecimalPlaces(2)

  // 5. Total General del Presupuesto
  const totalGeneral = baseImponible.plus(IVA_monto)

  return {
    costoDirecto: CD.toDecimalPlaces(2).toNumber(),
    beneficioIndustrial: BI_monto.toNumber(),
    baseImponible: baseImponible.toDecimalPlaces(2).toNumber(),
    iva: IVA_monto.toNumber(),
    totalGeneral: totalGeneral.toDecimalPlaces(2).toNumber(),
  }
}

/**
 * Calcula el costo total de una medición individual
 * con precisión decimal exacta
 */
export function calcularCostoMedicion(
  veces: number,
  largo: number,
  ancho: number,
  alto: number,
  precioUnitario: number
): { parcial: number; costoTotal: number } {
  const v = new Decimal(veces)
  const l = new Decimal(largo)
  const a = new Decimal(ancho)
  const h = new Decimal(alto)
  const p = new Decimal(precioUnitario)

  const parcial = v.times(l).times(a).times(h)
  const costoTotal = parcial.times(p)

  return {
    parcial: parcial.toDecimalPlaces(4).toNumber(),
    costoTotal: costoTotal.toDecimalPlaces(2).toNumber(),
  }
}

/**
 * Suma un array de costos con precisión decimal
 */
export function sumarCostos(costos: number[]): number {
  let total = new Decimal(0)
  for (const costo of costos) {
    total = total.plus(new Decimal(costo))
  }
  return total.toDecimalPlaces(2).toNumber()
}
