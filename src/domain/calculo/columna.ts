// Domain Entity for Column Reinforcement Calculation
// Based on CM-V3.0-PLUGCAD official formulas

export interface ColumnZone {
  length: number; // meters
  spacing: number; // meters
}

export interface ColumnReinforcement {
  // Longitudinal steel
  longitudinalLength: number; // total length in meters
  barDiameter: string;
  kgPerMeter: number;
  numBars: number;
  hasLap: boolean;
  lapLength: number; // meters per bar

  // Stirrups
  stirrupPerimeter: number; // meters per stirrup
  stirrupDiameter: string;
  stirrupKgPerMeter: number;
  zones: {
    confined: ColumnZone;
    central: ColumnZone;
    topNud: ColumnZone;
    bottomNud: ColumnZone;
  };
}

export interface ColumnConcrete {
  height: number; // meters
  widthA: number; // meters
  widthB: number; // meters
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

export interface ColumnCalculationResult {
  concrete: {
    volume: number;
    volumeWithWaste: number;
    cementoKg: number;
    arenaM3: number;
    gravaM3: number;
    aguaLt: number;
  };
  longitudinalSteel: {
    totalLength: number;
    weightKg: number;
    weightWithWaste: number;
  };
  stirrups: {
    totalCount: number;
    totalLength: number;
    weightKg: number;
    weightWithWaste: number;
  };
  totalSteelWeight: number;
}

export class ColumnEngine {
  static calculate(
    concrete: ColumnConcrete,
    reinforcement: ColumnReinforcement
  ): ColumnCalculationResult {
    // 1. Concrete volume
    const volume = concrete.height * concrete.widthA * concrete.widthB;
    const volumeWithWaste = volume * (1 + concrete.concreteWaste / 100);

    const aguaLtVal = concrete.dosage.aguaLt ?? 0;
    const aguaLt = volumeWithWaste * aguaLtVal;
    const cementoKg = volumeWithWaste * concrete.dosage.cementoKg;
    const arenaM3 = volumeWithWaste * concrete.dosage.arenaM3;
    const gravaM3 = volumeWithWaste * concrete.dosage.gravaM3;

    // 2. Longitudinal steel
    const longitudinalLength = reinforcement.hasLap
      ? reinforcement.longitudinalLength +
        reinforcement.numBars * reinforcement.lapLength
      : reinforcement.longitudinalLength;

    const longitudinalWeight =
      longitudinalLength * reinforcement.kgPerMeter * concrete.quantity;
    const longitudinalWeightWithWaste =
      longitudinalWeight * (1 + concrete.steelWaste / 100);

    // 3. Stirrups by zone (using actual zone lengths from PlugCAD)
    const confinedCount = Math.ceil(
      reinforcement.zones.confined.length / reinforcement.zones.confined.spacing
    );
    const centralCount = Math.ceil(
      reinforcement.zones.central.length / reinforcement.zones.central.spacing
    );
    const topNudCount = Math.ceil(
      reinforcement.zones.topNud.length / reinforcement.zones.topNud.spacing
    );
    const bottomNudCount = Math.ceil(
      reinforcement.zones.bottomNud.length / reinforcement.zones.bottomNud.spacing
    );

    const totalStirrups =
      confinedCount + centralCount + topNudCount + bottomNudCount;

    const stirrupTotalLength =
      totalStirrups * reinforcement.stirrupPerimeter * concrete.quantity;
    const stirrupWeight =
      stirrupTotalLength * reinforcement.stirrupKgPerMeter;
    const stirrupWeightWithWaste =
      stirrupWeight * (1 + concrete.steelWaste / 100);

    return {
      concrete: {
        volume,
        volumeWithWaste,
        cementoKg,
        arenaM3,
        gravaM3,
        aguaLt,
      },
      longitudinalSteel: {
        totalLength: longitudinalLength * concrete.quantity,
        weightKg: longitudinalWeight,
        weightWithWaste: longitudinalWeightWithWaste,
      },
      stirrups: {
        totalCount: totalStirrups,
        totalLength: stirrupTotalLength,
        weightKg: stirrupWeight,
        weightWithWaste: stirrupWeightWithWaste,
      },
      totalSteelWeight:
        longitudinalWeightWithWaste + stirrupWeightWithWaste,
    };
  }
}