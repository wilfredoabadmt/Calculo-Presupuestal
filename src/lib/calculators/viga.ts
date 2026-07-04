import {
  calcularBolsasCemento,
  aplicarDesperdicio,
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
  // Concreto
  const volumen = redondear(input.largo * input.a * input.b)
  const volTotal = redondear(volumen * input.cantidad)
  const volConDesp = aplicarDesperdicio(volTotal, input.desperdicioConcreto)

  const cementoKg = redondear(volConDesp * input.dosificacion.cementoKg)
  const cementoBolsas = calcularBolsasCemento(cementoKg)
  const arenaM3 = redondear(volConDesp * input.dosificacion.arenaM3)
  const gravaM3 = redondear(volConDesp * input.dosificacion.gravaM3)

  // Acero positivo (+)
  const longPos = input.aceroPositivo.traslapes
    ? input.aceroPositivo.longitudTotal + input.aceroPositivo.cantidadVarillas * input.aceroPositivo.largoTraslape
    : input.aceroPositivo.longitudTotal
  const pesoPos = redondear(longPos * input.aceroPositivo.kgM * input.cantidad)
  const pesoPosConDesp = redondear(aplicarDesperdicio(pesoPos, input.desperdicioAcero))

  // Acero negativo (-)
  const longNeg = input.aceroNegativo.traslapes
    ? input.aceroNegativo.longitudTotal + input.aceroNegativo.cantidadVarillas * input.aceroNegativo.largoTraslape
    : input.aceroNegativo.longitudTotal
  const pesoNeg = redondear(longNeg * input.aceroNegativo.kgM * input.cantidad)
  const pesoNegConDesp = redondear(aplicarDesperdicio(pesoNeg, input.desperdicioAcero))

  // Estribos
  const perimetroEstribo = 2 * (input.a + input.b) - 8 * 0.04 + 2 * 0.12
  const numEstribosConfinada = Math.ceil((input.largo * 0.15) / (input.estribos.separacionConfinada / 100))
  const numEstribosCentral = Math.ceil((input.largo * 0.7) / (input.estribos.separacionCentral / 100))
  const totalEstribos = numEstribosConfinada + numEstribosCentral + 4
  const longTotalEstribos = redondear(totalEstribos * input.estribos.longitud * input.cantidad)
  const pesoEstribos = redondear(longTotalEstribos * input.estribos.kgM)
  const pesoEstribosConDesp = redondear(aplicarDesperdicio(pesoEstribos, input.desperdicioAcero))

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
    crearMaterial(`AC-P-${input.aceroPositivo.diametro}`, `Acero (+) Ø${input.aceroPositivo.diametro}`, "kg", pesoPosConDesp, input.precios.acero),
    crearMaterial(`AC-N-${input.aceroNegativo.diametro}`, `Acero (-) Ø${input.aceroNegativo.diametro}`, "kg", pesoNegConDesp, input.precios.acero),
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
      "Acero positivo (+)": `${pesoPosConDesp} kg`,
      "Acero negativo (-)": `${pesoNegConDesp} kg`,
      "Estribos": `${totalEstribos} pzas (${pesoEstribosConDesp} kg)`,
      "Peso total acero": `${pesoPosConDesp + pesoNegConDesp + pesoEstribosConDesp} kg`,
    },
  }
}
