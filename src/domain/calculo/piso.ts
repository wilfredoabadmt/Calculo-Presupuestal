// Domain Entity for Floor (Piso) Calculation
// Based on tiling formulas with waste factors

export interface TileDosage {
  anchoCm: number; // tile width (cm)
  largoCm: number; // tile length (cm)
  areaM2: number; // area covered by one tile (m²)
  unidadesCaja: number; // tiles per box
  precioCaja: number;
}

export interface FloorCalculationInput {
  ancho: number;
  largo: number;
  tipoCeramica: TileDosage;
  desperdicioCeramica: number; // percentage
  desperdicioAdhesivo: number; // percentage
  desperdicioBoquilla: number; // percentage
  unidadAgua: string; // "lt" or "gal"
  cantidad: number;
}

export interface FloorCalculationResult {
  areaTotal: number;
  piezas: number;
  cajas: number;
  adhesivoKg: number;
  boquillaKg: number;
  aguaLt: number;
  aguaGal: number;
}

export class FloorEngine {
  static calculate(input: FloorCalculationInput): FloorCalculationResult {
    const area = input.ancho * input.largo;
    const areaTotal = area * input.cantidad;

    // Calculate number of tiles with waste factor
    const rawPieces = areaTotal / input.tipoCeramica.areaM2;
    const piecesWithWaste = rawPieces * (1 + input.desperdicioCeramica / 100);
    const piezas = Math.ceil(piecesWithWaste);

    // Calculate boxes needed
    const cajas = Math.ceil(piezas / input.tipoCeramica.unidadesCaja);

    // Adhesive: ~5 kg per m² with waste
    const rawAdhesive = areaTotal * 5;
    const adhesiveWithWaste = rawAdhesive * (1 + input.desperdicioAdhesivo / 100);
    const adhesivoKg = Math.ceil(adhesiveWithWaste);

    // Grout (boquilla): ~0.5 kg per linear meter of joint
    // Assuming grid pattern: perimeter ~ 2 * (area / tile_width)
    const tileWidthM = input.tipoCeramica.areaM2 / (input.tipoCeramica.largoCm / 100);
    const perimeterM = (areaTotal / tileWidthM) * 2; // Approximate total joint length
    const rawGrout = perimeterM * 0.5;
    const groutWithWaste = rawGrout * (1 + input.desperdicioBoquilla / 100);
    const boquillaKg = Math.ceil(groutWithWaste);

    // Water: ~3 lt per m²
    const aguaLt = Math.round(areaTotal * 3);

    // Convert to gallons if needed
    const aguaGal = aguaLt / 3.785;

    return {
      areaTotal,
      piezas,
      cajas,
      adhesivoKg,
      boquillaKg,
      aguaLt,
      aguaGal,
    };
  }
}