import {
  calcularBolsasCemento,
  aplicarDesperdicio,
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputPared {
  area: number // m²
  tipoBloque: {
    unidadesM2: number
    morteroM3M2: number
  }
  dosificacionPega: {
    cementoKg: number
    arenaM3: number
  }
  dosificacionRepello: {
    cementoKg: number
    arenaM3: number
  }
  espesorRep_mm: number
  espesorAfin_mm: number
  incluirAcabados: boolean
  afinado: {
    rendimiento: number // m²/bolsa
    aguaPorBolsa: number
  }
  desperdicioBloque: number
  desperdicioAcabados: number
  cantidad: number
  precios: {
    bloque: number
    cemento: number
    arena: number
  }
}

export function calcularPared(input: InputPared): ResultadoCalculo {
  const areaTotal = redondear(input.area * input.cantidad)

  // Bloques
  const bloques = techo(redondear(aplicarDesperdicio(areaTotal * input.tipoBloque.unidadesM2, input.desperdicioBloque)))
  const morteroM3 = redondear(areaTotal * input.tipoBloque.morteroM3M2)

  // Pega
  const cementoPegaKg = redondear(morteroM3 * input.dosificacionPega.cementoKg)
  const arenaPegaM3 = redondear(morteroM3 * input.dosificacionPega.arenaM3)

  // Repello
  const espesorRep_m = input.espesorRep_mm / 1000
  const volumenRep = redondear(areaTotal * espesorRep_m)
  const cementoRepKg = redondear(volumenRep * input.dosificacionRepello.cementoKg)
  const arenaRepM3 = redondear(volumenRep * input.dosificacionRepello.arenaM3)

  const materiales = [
    crearMaterial("B-01", "Bloque", "pza", bloques, input.precios.bloque),
    crearMaterial("C-01", "Cemento CP-40 (pega)", "kg", cementoPegaKg, input.precios.cemento),
    crearMaterial("A-01", "Arena media (pega)", "m³", arenaPegaM3, input.precios.arena),
    crearMaterial("C-02", "Cemento CP-40 (repello)", "kg", cementoRepKg, input.precios.cemento),
    crearMaterial("A-02", "Arena media (repello)", "m³", arenaRepM3, input.precios.arena),
  ]

  // Afinado (acabados)
  if (input.incluirAcabados) {
    const espesorAfin_m = input.espesorAfin_mm / 1000
    const volumenAfin = redondear(areaTotal * espesorAfin_m)
    const cementoAfinKg = redondear(areaTotal / input.afinado.rendimiento * 42.5)
    const arenaAfinM3 = redondear(volumenAfin)
    const aguaAfinLt = redondear(areaTotal / input.afinado.rendimiento * input.afinado.aguaPorBolsa)

    materiales.push(
      crearMaterial("C-03", "Cemento CP-40 (afinado)", "kg", cementoAfinKg, input.precios.cemento),
      crearMaterial("A-03", "Arena fina (afinado)", "m³", arenaAfinM3, input.precios.arena),
    )
  }

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area total": `${areaTotal} m²`,
      "Bloques": `${bloques} pzas`,
      "Mortero pega": `${morteroM3} m³`,
      "Cemento pega": `${cementoPegaKg} kg (${calcularBolsasCemento(cementoPegaKg)} bolsas)`,
      "Arena pega": `${arenaPegaM3} m³`,
      "Volumen repello": `${volumenRep} m³`,
      "Cemento repello": `${cementoRepKg} kg (${calcularBolsasCemento(cementoRepKg)} bolsas)`,
      "Arena repello": `${arenaRepM3} m³`,
    },
  }
}

function techo(value: number): number {
  return Math.ceil(value)
}
