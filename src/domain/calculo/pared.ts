// Domain Entity for Wall Calculation
// Based on CM-V3.0-PLUGCAD official formulas

export interface WallDosage {
  cementoKg: number;
  arenaM3: number;
  aguaLt: number;
}

export interface WallBlockType {
  unidadesM2: number;
  morteroM3M2: number;
}

export interface WallFinishing {
  rendimiento: number; // m2 per bag
  aguaPorBolsa: number;
}

export interface WallCalculationInput {
  area: number;
  tipoBloque: WallBlockType;
  dosificacionPega: WallDosage;
  dosificacionRepello: WallDosage;
  espesorRep_mm: number;
  espesorAfin_mm: number;
  incluirAcabados: boolean;
  afinado: WallFinishing;
  desperdicioBloque: number;
  desperdicioAcabados: number;
  cantidad: number;
}

export interface WallCalculationResult {
  areaTotal: number;
  bloques: number;
  morteroPegaM3: number;
  cementoPegaKg: number;
  arenaPegaM3: number;
  volumenRepelloM3: number;
  cementoRepelloKg: number;
  arenaRepelloM3: number;
  cementoAfinadoKg?: number;
  arenaAfinadoM3?: number;
  aguaAfinadoLt?: number;
}

export class WallEngine {
  static calculate(input: WallCalculationInput): WallCalculationResult {
    const areaTotal = input.area * input.cantidad;

    // Blocks & Mortar for joint (pega)
    const rawBloques = areaTotal * input.tipoBloque.unidadesM2 * (1 + input.desperdicioBloque / 100);
    const bloques = Math.ceil(rawBloques);
    const morteroPegaM3 = areaTotal * input.tipoBloque.morteroM3M2;

    const cementoPegaKg = morteroPegaM3 * input.dosificacionPega.cementoKg;
    const arenaPegaM3 = morteroPegaM3 * input.dosificacionPega.arenaM3;

    // Repello
    const espesorRep_m = input.espesorRep_mm / 1000;
    const volumenRepelloM3 = areaTotal * espesorRep_m;
    const cementoRepelloKg = volumenRepelloM3 * input.dosificacionRepello.cementoKg;
    const arenaRepelloM3 = volumenRepelloM3 * input.dosificacionRepello.arenaM3;

    let cementoAfinadoKg: number | undefined;
    let arenaAfinadoM3: number | undefined;
    let aguaAfinadoLt: number | undefined;

    if (input.incluirAcabados) {
      const espesorAfin_m = input.espesorAfin_mm / 1000;
      const volumenAfinM3 = areaTotal * espesorAfin_m;
      cementoAfinadoKg = (areaTotal / input.afinado.rendimiento) * 42.5;
      arenaAfinadoM3 = volumenAfinM3;
      aguaAfinadoLt = (areaTotal / input.afinado.rendimiento) * input.afinado.aguaPorBolsa;
    }

    return {
      areaTotal,
      bloques,
      morteroPegaM3,
      cementoPegaKg,
      arenaPegaM3,
      volumenRepelloM3,
      cementoRepelloKg,
      arenaRepelloM3,
      cementoAfinadoKg,
      arenaAfinadoM3,
      aguaAfinadoLt,
    };
  }
}
