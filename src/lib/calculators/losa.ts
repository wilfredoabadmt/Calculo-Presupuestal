import {
  calcularBolsasCemento,
  aplicarDesperdicio,
  redondear,
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
  // Concreto
  const volumen = redondear(input.largo * input.ancho * input.espesor)
  const volTotal = redondear(volumen * input.cantidad)
  const volConDesp = aplicarDesperdicio(volTotal, input.desperdicioConcreto)

  const cementoKg = redondear(volConDesp * input.dosificacion.cementoKg)
  const cementoBolsas = calcularBolsasCemento(cementoKg)
  const arenaM3 = redondear(volConDesp * input.dosificacion.arenaM3)
  const gravaM3 = redondear(volConDesp * input.dosificacion.gravaM3)

  // Acero - 4 direcciones
  const areaM2 = input.largo * input.ancho * input.cantidad
  const numVarillasXa = Math.ceil(input.largo / (input.separacionAcero / 100))
  const numVarillasXb = Math.ceil(input.largo / (input.separacionAcero / 100))
  const numVarillasYa = Math.ceil(input.ancho / (input.separacionAcero / 100))
  const numVarillasYb = Math.ceil(input.ancho / (input.separacionAcero / 100))

  const pesoXa = redondear(numVarillasXa * input.ancho * input.aceroXa.kgM * input.cantidad)
  const pesoXb = redondear(numVarillasXb * input.ancho * input.aceroXb.kgM * input.cantidad)
  const pesoYa = redondear(numVarillasYa * input.largo * input.aceroYa.kgM * input.cantidad)
  const pesoYb = redondear(numVarillasYb * input.largo * input.aceroYb.kgM * input.cantidad)
  const pesoTotalAcero = redondear(pesoXa + pesoXb + pesoYa + pesoYb)
  const pesoAceroConDesp = redondear(aplicarDesperdicio(pesoTotalAcero, input.desperdicioAcero))

  // Bovedillas
  const bovedillas = techo(areaM2 * input.bovedillas.unidadesM2)

  // Electromalla
  const electromalla = techo(areaM2 * input.electromalla.unidadesM2)

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
    crearMaterial("AC-01", "Acero refuerzo", "kg", pesoAceroConDesp, input.precios.acero),
    crearMaterial("BV-01", "Bovedilla", "pza", bovedillas, input.precios.bovedilla),
    crearMaterial("EM-01", "Electromalla", "m²", electromalla, input.precios.electromalla),
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
      "Acero total": `${pesoAceroConDesp} kg`,
      "Bovedillas": `${bovedillas} pzas`,
      "Electromalla": `${electromalla} m²`,
    },
  }
}

function techo(value: number): number {
  return Math.ceil(value)
}
