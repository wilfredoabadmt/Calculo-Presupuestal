import { BeamEngine } from "@/domain/calculo/viga"
import {
  calcularBolsasCemento,
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputViga {
  largo: number // m
  a: number // alto (m)
  b: number // ancho (m)
  dosificacion: {
    cementoKg: number
    arenaM3: number
    gravaM3: number
  }
  resistencia: number
  desperdicioConcreto: number
  aceroPositivo: {
    longitudTotal: number
    diametro: string
    kgM: number
    traslapes: boolean
    largoTraslape: number
    cantidadVarillas: number
  }
  aceroNegativo: {
    longitudTotal: number
    diametro: string
    kgM: number
    traslapes: boolean
    largoTraslape: number
    cantidadVarillas: number
  }
  estribos: {
    longitud: number
    diametro: string
    kgM: number
    separacionConfinada: number
    separacionCentral: number
  }
  desperdicioAcero: number
  cantidad: number
  precios: {
    cemento: number
    arena: number
    grava: number
    acero: number
  }
}

export function calcularViga(input: InputViga): ResultadoCalculo {
  // Map old input format to new domain engine format
  const concrete = {
    length: input.largo,
    height: input.a,
    width: input.b,
    dosage: input.dosificacion,
    concreteWaste: input.desperdicioConcreto,
    steelWaste: input.desperdicioAcero,
    quantity: input.cantidad,
  }

  const reinforcement = {
    positiveLength: input.aceroPositivo.longitudTotal,
    positiveDiameter: input.aceroPositivo.diametro,
    positiveKgPerMeter: input.aceroPositivo.kgM,
    positiveNumBars: input.aceroPositivo.cantidadVarillas,
    positiveHasLap: input.aceroPositivo.traslapes,
    positiveLapLength: input.aceroPositivo.largoTraslape,
    negativeLength: input.aceroNegativo.longitudTotal,
    negativeDiameter: input.aceroNegativo.diametro,
    negativeKgPerMeter: input.aceroNegativo.kgM,
    negativeNumBars: input.aceroNegativo.cantidadVarillas,
    negativeHasLap: input.aceroNegativo.traslapes,
    negativeLapLength: input.aceroNegativo.largoTraslape,
    stirrupPerimeter: 2 * (input.a + input.b) - 8 * 0.04 + 2 * 0.12,
    stirrupDiameter: input.estribos.diametro,
    stirrupKgPerMeter: input.estribos.kgM,
    zones: {
      confined: {
        length: input.largo * 0.30,
        spacing: input.estribos.separacionConfinada / 100,
      },
      central: {
        length: input.largo * 0.70,
        spacing: input.estribos.separacionCentral / 100,
      },
    },
  }

  const result = BeamEngine.calculate(concrete, reinforcement)

  const cementoBolsas = calcularBolsasCemento(redondear(result.concrete.cementoKg))
  const arenaM3 = redondear(result.concrete.arenaM3)
  const gravaM3 = redondear(result.concrete.gravaM3)

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
    crearMaterial(
      `AC-P-${input.aceroPositivo.diametro}`,
      `Acero (+) Ø${input.aceroPositivo.diametro}`,
      "kg",
      redondear(result.positiveSteel.weightWithWaste),
      input.precios.acero
    ),
    crearMaterial(
      `AC-N-${input.aceroNegativo.diametro}`,
      `Acero (-) Ø${input.aceroNegativo.diametro}`,
      "kg",
      redondear(result.negativeSteel.weightWithWaste),
      input.precios.acero
    ),
    crearMaterial(
      `AC-E-${input.estribos.diametro}`,
      `Estribos Ø${input.estribos.diametro}`,
      "kg",
      redondear(result.stirrups.weightWithWaste),
      input.precios.acero
    ),
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
      "Acero positivo (+)": `${redondear(result.positiveSteel.weightWithWaste)} kg`,
      "Acero negativo (-)": `${redondear(result.negativeSteel.weightWithWaste)} kg`,
      "Estribos": `${result.stirrups.totalCount} pzas (${redondear(result.stirrups.weightWithWaste)} kg)`,
      "Peso total acero": `${redondear(result.totalSteelWeight)} kg`,
    },
  }
}