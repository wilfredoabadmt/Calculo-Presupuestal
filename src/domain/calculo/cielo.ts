// Domain Entity for Ceiling (Cielo Raso) Drywall Calculation
// Based on CM-V3.0-PLUGCAD official formulas

export interface CeilingCalculationInput {
  ancho: number;
  largo: number;
  viguetas: { separation: number };
  omegas: { separation: number };
  anguloPerimetral: { length: number };
  desperdicioPaneles: number;
  cantidad: number;
}

export interface CeilingCalculationResult {
  areaTotal: number;
  paneles: number;
  viguetas: number;
  omegas: number;
  angulos: number;
  masillaKg: number;
  tornillos: number;
}

export class CeilingEngine {
  static calculate(input: CeilingCalculationInput): CeilingCalculationResult {
    const area = input.ancho * input.largo;
    const areaTotal = area * input.cantidad;

    // Paneles de yeso (1.20 x 2.40 = 2.88 m²)
    const areaPanel = 1.2 * 2.4; // 2.88 m²
    const rawPanels = areaTotal / areaPanel * (1 + input.desperdicioPaneles / 100);
    const paneles = Math.ceil(rawPanels);

    // Viguetas: cada 0.60m (or configured separation)
    const numViguetas = Math.ceil(input.largo / input.viguetas.separation);
    const viguetas = numViguetas * input.cantidad;

    // Omegas: cada 0.60m (or configured separation)
    const numOmegas = Math.ceil(input.largo / input.omegas.separation);
    const omegas = numOmegas * input.cantidad;

    // Ángulo perimetral
    const perimetro = 2 * (input.ancho + input.largo);
    const numAngulos = Math.ceil(perimetro / input.anguloPerimetral.length);
    const angulos = numAngulos * input.cantidad;

    // Masilla: ~0.5 kg/m²
    const masillaKg = Math.round(areaTotal * 0.5);

    // Tornillos: ~4 por panel
    const tornillos = paneles * 4;

    return {
      areaTotal,
      paneles,
      viguetas,
      omegas,
      angulos,
      masillaKg,
      tornillos,
    };
  }
}