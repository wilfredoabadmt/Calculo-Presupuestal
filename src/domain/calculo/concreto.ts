// Domain Entity for Concrete Calculation
export interface ConcreteDosage {
  cementoKg: number;
  arenaM3: number;
  gravaM3: number;
  aguaLt: number;
}

export interface ConcreteResult {
  volumen: number;
  cementoKg: number;
  arenaM3: number;
  gravaM3: number;
  aguaLt: number;
}

export class ConcreteEngine {
  static calculate(
    volume: number,
    dosage: ConcreteDosage,
    wastePercentage: number
  ): ConcreteResult {
    const wasteFactor = 1 + wastePercentage / 100;
    const effectiveVolume = volume * wasteFactor;

    return {
      volumen: volume,
      cementoKg: effectiveVolume * dosage.cementoKg,
      arenaM3: effectiveVolume * dosage.arenaM3,
      gravaM3: effectiveVolume * dosage.gravaM3,
      aguaLt: effectiveVolume * dosage.aguaLt,
    };
  }
}
