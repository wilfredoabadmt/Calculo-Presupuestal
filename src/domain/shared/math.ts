// Shared Kernel - Math utilities
// Domain rules for rounding and basic math operations

export function redondear(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function techo(value: number): number {
  return Math.ceil(value);
}

export function aplicarDesperdicio(cantidad: number, porcentaje: number): number {
  return cantidad * (1 + porcentaje / 100);
}