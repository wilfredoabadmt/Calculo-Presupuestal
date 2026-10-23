import { ColumnEngine } from "@/domain/calculo/columna"
import {
  calcularBolsasCemento,
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputColumna {
  alto: number // m
  a: number // dimensión a (m)
  b: number // dimensión b (m)
  dosificacion: {
    cementoKg: number
    arenaM3: number
    gravaM3: number
  }
  resistencia: number
  desperdicioConcreto: number
  aceroLongitudinal: {
    longitudTotal: number // m total de varillas
    diametro: string
    kgM: number
    traslapes: boolean
    largoTraslape: number
    cantidadVarillas: number
  }
  estribos: {
    longitud: number // m por estribo
    diametro: string
    kgM: number
    separacionConfinada: number // cm
    separacionCentral: number // cm
    zonas: number
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

export function calcularColumna(input: InputColumna): ResultadoCalculo {
  // Map old input format to new domain engine format
  const concrete = {
    height: input.alto,
    widthA: input.a,
    widthB: input.b,
    dosage: input.dosificacion,
    concreteWaste: input.desperdicioConcreto,
    steelWaste: input.desperdicioAcero,
    quantity: input.cantidad,
  }

  const reinforcement = {
    longitudinalLength: input.aceroLongitudinal.longitudTotal,
    barDiameter: input.aceroLongitudinal.diametro,
    kgPerMeter: input.aceroLongitudinal.kgM,
    numBars: input.aceroLongitudinal.cantidadVarillas,
    hasLap: input.aceroLongitudinal.traslapes,
    lapLength: input.aceroLongitudinal.largoTraslape,
    stirrupPerimeter: 2 * (input.a + input.b) - 8 * 0.04 + 2 * 0.12,
    stirrupDiameter: input.estribos.diametro,
    stirrupKgPerMeter: input.estribos.kgM,
    zones: {
      confined: {
        length: input.alto * 0.15,
        spacing: input.estribos.separacionConfinada / 100,
      },
      central: {
        length: input.alto * 0.7,
        spacing: input.estribos.separacionCentral / 100,
      },
      topNud: {
        length: 0.5,
        spacing: input.estribos.separacionConfinada / 100,
      },
      bottomNud: {
        length: 0.5,
        spacing: input.estribos.separacionConfinada / 100,
      },
    },
  }

  const result = ColumnEngine.calculate(concrete, reinforcement)

  const cementoBolsas = calcularBolsasCemento(redondear(result.concrete.cementoKg))
  const arenaM3 = redondear(result.concrete.arenaM3)
  const gravaM3 = redondear(result.concrete.gravaM3)

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
    crearMaterial(
      `AC-L-${input.aceroLongitudinal.diametro}`,
      `Acero long. Ø${input.aceroLongitudinal.diametro}`,
      "kg",
      redondear(result.longitudinalSteel.weightWithWaste),
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
      "Acero longitudinal": `${redondear(result.longitudinalSteel.weightWithWaste)} kg`,
      "Estribos": `${result.stirrups.totalCount} pzas (${redondear(result.stirrups.weightWithWaste)} kg)`,
      "Peso total acero": `${redondear(result.totalSteelWeight)} kg`,
    },
  }
}