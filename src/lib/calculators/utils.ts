export const PESO_BOLSA_CEMENTERO = 42.5 // kg por bolsa

export function calcularBolsasCemento(kgCemento: number): number {
  return Math.ceil(kgCemento / PESO_BOLSA_CEMENTERO)
}

export function aplicarDesperdicio(cantidad: number, porcentaje: number): number {
  return cantidad * (1 + porcentaje / 100)
}

export function redondear(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function techo(value: number): number {
  return Math.ceil(value)
}

export function convertirLitrosABarriles(litros: number): number {
  return redondear(litros / 158.98, 2)
}

export function convertirLitrosAGalones(litros: number): number {
  return redondear(litros / 3.785, 2)
}

export interface MaterialCalculado {
  codigo: string
  nombre: string
  unidad: string
  cantidad: number
  precioUnitario: number
  costoTotal: number
}

export interface ResultadoCalculo {
  materiales: MaterialCalculado[]
  costoTotalMateriales: number
  resumen: Record<string, string>
}

export function crearMaterial(
  codigo: string,
  nombre: string,
  unidad: string,
  cantidad: number,
  precioUnitario: number
): MaterialCalculado {
  return {
    codigo,
    nombre,
    unidad,
    cantidad: redondear(cantidad),
    precioUnitario,
    costoTotal: redondear(cantidad * precioUnitario),
  }
}
