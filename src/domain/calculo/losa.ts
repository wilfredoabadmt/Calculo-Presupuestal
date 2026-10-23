// Domain Entity for Slab Reinforcement Calculation
// Based on CM-V3.0-PLUGCAD official formulas

export interface SlabSteelDirection {
  lengthA: number; // meters
  spacingA: number; // meters
  diameterA: string;
  kgPerMeterA: number;
  lengthB: number; // meters
  spacingB: number; // meters
  diameterB: string;
  kgPerMeterB: number;
  barsA: number; // multiplier for direction A
  barsB: number; // multiplier for direction B
  hasLap: boolean;
  lapLength: number; // meters
  cover: number; // meters (recubrimiento)
  commercialBarLength: number; // meters (default 6m)
  steelWaste: number; // percentage
}

export interface SlabConcrete {
  length: number; // meters
  width: number; // meters
  thickness: number; // meters
  dosage: {
    cementoKg: number;
    arenaM3: number;
    gravaM3: number;
    aguaLt?: number;
  };
  concreteWaste: number; // percentage
  steelWaste: number; // percentage
  quantity: number;
}

export interface SlabCalculationResult {
  concrete: {
    volume: number;
    volumeWithWaste: number;
    cementoKg: number;
    arenaM3: number;
    gravaM3: number;
    aguaLt: number;
  };
  steelX: {
    totalLength: number;
    weightKg: number;
    weightWithWaste: number;
  };
  steelY: {
    totalLength: number;
    weightKg: number;
    weightWithWaste: number;
  };
  totalSteelWeight: number;
}

export class SlabEngine {
  static calculate(
    concrete: SlabConcrete,
    steelX: SlabSteelDirection,
    steelY: SlabSteelDirection
  ): SlabCalculationResult {
    // 1. Concrete volume
    const volume = concrete.length * concrete.width * concrete.thickness;
    const volumeWithWaste = volume * (1 + concrete.concreteWaste / 100);

    const aguaLtVal = concrete.dosage.aguaLt ?? 0;
    const aguaLt = volumeWithWaste * aguaLtVal;
    const cementoKg = volumeWithWaste * concrete.dosage.cementoKg;
    const arenaM3 = volumeWithWaste * concrete.dosage.arenaM3;
    const gravaM3 = volumeWithWaste * concrete.dosage.gravaM3;

    // 2. Steel in X direction
    const xResult = this.calculateSteelDirection(steelX, concrete.quantity);
    // 3. Steel in Y direction
    const yResult = this.calculateSteelDirection(steelY, concrete.quantity);

    return {
      concrete: {
        volume,
        volumeWithWaste,
        cementoKg,
        arenaM3,
        gravaM3,
        aguaLt,
      },
      steelX: xResult,
      steelY: yResult,
      totalSteelWeight: xResult.weightWithWaste + yResult.weightWithWaste,
    };
  }

  private static calculateSteelDirection(
    direction: SlabSteelDirection,
    quantity: number
  ): { totalLength: number; weightKg: number; weightWithWaste: number } {
    // Calculate bars in direction A (along length)
    const barsA = Math.ceil(direction.lengthA / direction.spacingA) * direction.barsA;
    // Calculate bars in direction B (along width)
    const barsB = Math.ceil(direction.lengthB / direction.spacingB) * direction.barsB;

    // Total length of steel
    const totalLengthA = barsA * direction.lengthA;
    const totalLengthB = barsB * direction.lengthB;

    // Apply laps if needed
    let lapAdjustment = 0;
    if (direction.hasLap) {
      const lapsA = Math.max(0, Math.ceil(direction.lengthA / direction.commercialBarLength) - 1);
      const lapsB = Math.max(0, Math.ceil(direction.lengthB / direction.commercialBarLength) - 1);
      lapAdjustment = (lapsA * barsA + lapsB * barsB) * direction.lapLength;
    }

    const totalLength = (totalLengthA + totalLengthB + lapAdjustment) * quantity;
    // Average weight using both diameters
    const avgKgPerMeter = (direction.kgPerMeterA + direction.kgPerMeterB) / 2;
    const weightKg = totalLength * avgKgPerMeter;
    const weightWithWaste = weightKg * (1 + direction.steelWaste / 100);

    return {
      totalLength,
      weightKg,
      weightWithWaste,
    };
  }
}