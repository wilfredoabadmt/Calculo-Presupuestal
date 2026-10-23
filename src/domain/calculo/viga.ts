// Domain Entity for Beam Reinforcement Calculation
// Based on CM-V3.0-PLUGCAD official formulas

export interface BeamZone {
  length: number; // meters
  spacing: number; // meters
}

export interface BeamReinforcement {
  // Positive steel (bottom)
  positiveLength: number;
  positiveDiameter: string;
  positiveKgPerMeter: number;
  positiveNumBars: number;
  positiveHasLap: boolean;
  positiveLapLength: number;

  // Negative steel (top)
  negativeLength: number;
  negativeDiameter: string;
  negativeKgPerMeter: number;
  negativeNumBars: number;
  negativeHasLap: boolean;
  negativeLapLength: number;

  // Stirrups
  stirrupPerimeter: number;
  stirrupDiameter: string;
  stirrupKgPerMeter: number;
  zones: {
    confined: BeamZone;
    central: BeamZone;
  };
}

export interface BeamConcrete {
  length: number; // meters
  height: number; // meters
  width: number; // meters
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

export interface BeamCalculationResult {
  concrete: {
    volume: number;
    volumeWithWaste: number;
    cementoKg: number;
    arenaM3: number;
    gravaM3: number;
    aguaLt: number;
  };
  positiveSteel: {
    totalLength: number;
    weightKg: number;
    weightWithWaste: number;
  };
  negativeSteel: {
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

export class BeamEngine {
  static calculate(
    concrete: BeamConcrete,
    reinforcement: BeamReinforcement
  ): BeamCalculationResult {
    // 1. Concrete volume
    const volume = concrete.length * concrete.height * concrete.width;
    const volumeWithWaste = volume * (1 + concrete.concreteWaste / 100);

    const aguaLtVal = concrete.dosage.aguaLt ?? 0;
    const aguaLt = volumeWithWaste * aguaLtVal;
    const cementoKg = volumeWithWaste * concrete.dosage.cementoKg;
    const arenaM3 = volumeWithWaste * concrete.dosage.arenaM3;
    const gravaM3 = volumeWithWaste * concrete.dosage.gravaM3;

    // 2. Positive steel (bottom)
    const positiveLength = reinforcement.positiveHasLap
      ? reinforcement.positiveLength +
        reinforcement.positiveNumBars * reinforcement.positiveLapLength
      : reinforcement.positiveLength;

    const positiveWeight =
      positiveLength * reinforcement.positiveKgPerMeter * concrete.quantity;
    const positiveWeightWithWaste =
      positiveWeight * (1 + concrete.steelWaste / 100);

    // 3. Negative steel (top)
    const negativeLength = reinforcement.negativeHasLap
      ? reinforcement.negativeLength +
        reinforcement.negativeNumBars * reinforcement.negativeLapLength
      : reinforcement.negativeLength;

    const negativeWeight =
      negativeLength * reinforcement.negativeKgPerMeter * concrete.quantity;
    const negativeWeightWithWaste =
      negativeWeight * (1 + concrete.steelWaste / 100);

    // 4. Stirrups by zone (using actual zone lengths from PlugCAD)
    const confinedCount = Math.ceil(
      reinforcement.zones.confined.length / reinforcement.zones.confined.spacing
    );
    const centralCount = Math.ceil(
      reinforcement.zones.central.length / reinforcement.zones.central.spacing
    );
    const totalStirrups = confinedCount + centralCount;

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
      positiveSteel: {
        totalLength: positiveLength * concrete.quantity,
        weightKg: positiveWeight,
        weightWithWaste: positiveWeightWithWaste,
      },
      negativeSteel: {
        totalLength: negativeLength * concrete.quantity,
        weightKg: negativeWeight,
        weightWithWaste: negativeWeightWithWaste,
      },
      stirrups: {
        totalCount: totalStirrups,
        totalLength: stirrupTotalLength,
        weightKg: stirrupWeight,
        weightWithWaste: stirrupWeightWithWaste,
      },
      totalSteelWeight:
        positiveWeightWithWaste + negativeWeightWithWaste + stirrupWeightWithWaste,
    };
  }
}