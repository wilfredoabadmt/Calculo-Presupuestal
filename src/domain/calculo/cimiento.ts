// Domain Entity for Foundation (Cimiento) Calculation
// Based on CM-V3.0-PLUGCAD official formulas

export interface FoundationDosage {
  cementoKg: number;
  arenaM3: number;
  aguaLt: number;
}

export interface FoundationCalculationInput {
  base: number;
  altura: number;
  largo: number;
  dosificacion: FoundationDosage;
  porcentajePiedra: number;
  porcentajeMortero: number;
  cantidad: number;
}

export interface FoundationCalculationResult {
  volumenTotal: number;
  volumenPiedra: number;
  volumenMortero: number;
  cementoKg: number;
  arenaM3: number;
  aguaLt: number;
}

export class FoundationEngine {
  static calculate(input: FoundationCalculationInput): FoundationCalculationResult {
    const volumen = input.base * input.altura * input.largo;
    const volumenTotal = volumen * input.cantidad;

    const volumenPiedra = volumenTotal * (input.porcentajePiedra / 100);
    const volumenMortero = volumenTotal * (input.porcentajeMortero / 100);

    const cementoKg = volumenMortero * input.dosificacion.cementoKg;
    const arenaM3 = volumenMortero * input.dosificacion.arenaM3;
    const aguaLt = volumenMortero * input.dosificacion.aguaLt;

    return {
      volumenTotal,
      volumenPiedra,
      volumenMortero,
      cementoKg,
      arenaM3,
      aguaLt,
    };
  }
}
