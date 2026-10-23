// Domain Entity for Retaining Wall (Muro de Contención) Calculation
// Based on CM-V3.0-PLUGCAD official formulas

export interface WallDosage {
  cementoKg: number;
  arenaM3: number;
  aguaLt: number;
}

export interface RetainingWallCalculationInput {
  corona: number;
  base: number;
  altura: number;
  largo: number;
  dosificacion: WallDosage;
  porcentajePiedra: number;
  porcentajeMortero: number;
  cantidad: number;
}

export interface RetainingWallCalculationResult {
  espesorPromedio: number;
  volumenTotal: number;
  volumenPiedra: number;
  volumenMortero: number;
  cementoKg: number;
  arenaM3: number;
  aguaLt: number;
}

export class RetainingWallEngine {
  static calculate(input: RetainingWallCalculationInput): RetainingWallCalculationResult {
    const espesorPromedio = (input.corona + input.base) / 2;
    const volumen = espesorPromedio * input.altura * input.largo;
    const volumenTotal = volumen * input.cantidad;

    const volumenPiedra = volumenTotal * (input.porcentajePiedra / 100);
    const volumenMortero = volumenTotal * (input.porcentajeMortero / 100);

    const cementoKg = volumenMortero * input.dosificacion.cementoKg;
    const arenaM3 = volumenMortero * input.dosificacion.arenaM3;
    const aguaLt = volumenMortero * input.dosificacion.aguaLt;

    return {
      espesorPromedio,
      volumenTotal,
      volumenPiedra,
      volumenMortero,
      cementoKg,
      arenaM3,
      aguaLt,
    };
  }
}
