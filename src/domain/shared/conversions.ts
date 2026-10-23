// Shared Kernel - Unit conversions
// Domain rules for converting between measurement units

import { redondear } from "./math";

const BARRILES_PER_LITRO = 158.98;
const GALONES_PER_LITRO = 3.785;

export function convertirLitrosABarriles(litros: number): number {
  return redondear(litros / BARRILES_PER_LITRO, 2);
}

export function convertirLitrosAGalones(litros: number): number {
  return redondear(litros / GALONES_PER_LITRO, 2);
}