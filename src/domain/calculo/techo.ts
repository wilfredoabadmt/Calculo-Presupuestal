// Domain Entity for Roof (Techo) Calculation
// Based on geometric formulas for inclined areas

export interface RoofCalculationInput {
  ancho: number;
  largo: number;
  alto: number; // pendiente
  unidadesM2: number;
  desperdicio: number;
  cantidad: number;
}

export interface RoofCalculationResult {
  areaReal: number;
  areaTotal: number;
  tejas: number;
}

export class RoofEngine {
  static calculate(input: RoofCalculationInput): RoofCalculationResult {
    // Area of an inclined plane: area = width * sqrt(length^2 + height^2)
    const areaReal = Math.sqrt(Math.pow(input.largo, 2) + Math.pow(input.alto, 2)) * input.ancho;
    const areaTotal = areaReal * input.cantidad;

    const tejasRaw = areaTotal * input.unidadesM2 * (1 + input.desperdicio / 100);
    const tejas = Math.ceil(tejasRaw);

    return {
      areaReal,
      areaTotal,
      tejas,
    };
  }
}
