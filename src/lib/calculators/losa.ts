import { SlabEngine } from "@/domain/calculo/losa"
import {
  calcularBolsasCemento,
  redondear,
  techo,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputLosa {
  largo: number // m
  ancho: number // m
  espesor: number // m
  dosificacion: {
    cementoKg: number
    arenaM3: number
    gravaM3: number
  }
  desperdicioConcreto: number
  aceroXa: { separacion: number; kgM: number } // dirección X lado a
  aceroXb: { separacion: number; kgM: number } // dirección X lado b
  aceroYa: { separacion: number; kgM: number } // dirección Y lado a
  aceroYb: { separacion: number; kgM: number } // dirección Y lado b
  separacionAcero: number // cm entre varillas
  desperdicioAcero: number
  bovedillas: {
    largo: number
    ancho: number
    unidadesM2: number
  }
  electromalla: {
    ancho: number
    largo: number
    unidadesM2: number
  }
  cantidad: number
  precios: {
    cemento: number
    arena: number
    grava: number
    acero: number
    bovedilla: number
    electromalla: number
  }
}

export function calcularLosa(input: InputLosa): ResultadoCalculo {
  // Map old input format to new domain engine format
  const concrete = {
    length: input.largo,
    width: input.ancho,
    thickness: input.espesor,
    dosage: input.dosificacion,
    concreteWaste: input.desperdicioConcreto,
    steelWaste: input.desperdicioAcero,
    quantity: input.cantidad,
  }

  const steelX: any = {
    lengthA: input.largo,
    spacingA: input.separacionAcero / 100,
    diameterA: "X",
    kgPerMeterA: input.aceroXa.kgM,
    lengthB: input.largo,
    spacingB: input.separacionAcero / 100,
    diameterB: "X",
    kgPerMeterB: input.aceroXb.kgM,
    barsA: 1,
    barsB: 1,
    hasLap: false,
    lapLength: 0,
    cover: 0.05,
    commercialBarLength: 6,
    steelWaste: input.desperdicioAcero,
  }

  const steelY: any = {
    lengthA: input.ancho,
    spacingA: input.separacionAcero / 100,
    diameterA: "Y",
    kgPerMeterA: input.aceroYa.kgM,
    lengthB: input.ancho,
    spacingB: input.separacionAcero / 100,
    diameterB: "Y",
    kgPerMeterB: input.aceroYb.kgM,
    barsA: 1,
    barsB: 1,
    hasLap: false,
    lapLength: 0,
    cover: 0.05,
    commercialBarLength: 6,
    steelWaste: input.desperdicioAcero,
  }

  const result = SlabEngine.calculate(concrete, steelX, steelY)

  const cementoBolsas = calcularBolsasCemento(redondear(result.concrete.cementoKg))
  const arenaM3 = redondear(result.concrete.arenaM3)
  const gravaM3 = redondear(result.concrete.gravaM3)

  // Bovedillas
  const areaM2 = input.largo * input.ancho * input.cantidad
  const bovedillas = techo(areaM2 * input.bovedillas.unidadesM2)

  // Electromalla
  const electromalla = techo(areaM2 * input.electromalla.unidadesM2)

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
    crearMaterial("AC-01", "Acero refuerzo", "kg", redondear(result.totalSteelWeight), input.precios.acero),
    crearMaterial("BV-01", "Bovedilla", "pza", bovedillas, input.precios.bovedilla),
    crearMaterial("EM-01", "Electromalla", "m²", electromalla, input.precios.electromalla),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Volumen concreto": `${redondear(result.concrete.volume * concrete.quantity)} m³`,
      "Cemento": `${redondear(result.concrete.cementoKg)} kg (${cementoBolsas} bolsas)`,
      "Arena": `${arenaM3} m³`,
      "Grava": `${gravaM3} m³`,
      "Acero total": `${redondear(result.totalSteelWeight)} kg`,
      "Bovedillas": `${bovedillas} pzas`,
      "Electromalla": `${electromalla} m²`,
    },
  }
}