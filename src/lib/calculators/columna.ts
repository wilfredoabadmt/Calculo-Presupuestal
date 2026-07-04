import {
  calcularBolsasCemento,
  aplicarDesperdicio,
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
  // Concreto
  const volumen = redondear(input.alto * input.a * input.b)
  const volTotal = redondear(volumen * input.cantidad)
  const volConDesp = aplicarDesperdicio(volTotal, input.desperdicioConcreto)

  const cementoKg = redondear(volConDesp * input.dosificacion.cementoKg)
  const cementoBolsas = calcularBolsasCemento(cementoKg)
  const arenaM3 = redondear(volConDesp * input.dosificacion.arenaM3)
  const gravaM3 = redondear(volConDesp * input.dosificacion.gravaM3)

  // Acero longitudinal
  const longTotalAcero = input.aceroLongitudinal.traslapes
    ? input.aceroLongitudinal.longitudTotal + input.aceroLongitudinal.cantidadVarillas * input.aceroLongitudinal.largoTraslape
    : input.aceroLongitudinal.longitudTotal
  const pesoAceroLong = redondear(longTotalAcero * input.aceroLongitudinal.kgM * input.cantidad)
  const pesoAceroLongConDesp = redondear(aplicarDesperdicio(pesoAceroLong, input.desperdicioAcero))

  // Estribos
  const perimetroEstribo = 2 * (input.a + input.b) - 8 * 0.04 + 2 * 0.12 // perímetro efectivo
  const numEstribosConfinada = Math.ceil((input.alto * 0.15) / (input.estribos.separacionConfinada / 100))
  const numEstribosCentral = Math.ceil((input.alto * 0.7) / (input.estribos.separacionCentral / 100))
  const numEstribosNudos = 4
  const totalEstribos = (numEstribosConfinada + numEstribosCentral + numEstribosNudos) * input.estribos.zonas
  const longTotalEstribos = redondear(totalEstribos * input.estribos.longitud * input.cantidad)
  const pesoEstribos = redondear(longTotalEstribos * input.estribos.kgM)
  const pesoEstribosConDesp = redondear(aplicarDesperdicio(pesoEstribos, input.desperdicioAcero))

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
    crearMaterial(`AC-L-${input.aceroLongitudinal.diametro}`, `Acero long. Ø${input.aceroLongitudinal.diametro}`, "kg", pesoAceroLongConDesp, input.precios.acero),
    crearMaterial(`AC-E-${input.estribos.diametro}`, `Estribos Ø${input.estribos.diametro}`, "kg", pesoEstribosConDesp, input.precios.acero),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Volumen concreto": `${volTotal} m³`,
      "Cemento": `${cementoKg} kg (${cementoBolsas} bolsas)`,
      "Arena": `${arenaM3} m³`,
      "Grava": `${gravaM3} m³`,
      "Acero longitudinal": `${pesoAceroLongConDesp} kg`,
      "Estribos": `${totalEstribos} pzas (${pesoEstribosConDesp} kg)`,
      "Peso total acero": `${pesoAceroLongConDesp + pesoEstribosConDesp} kg`,
    },
  }
}
