import { WallEngine } from "@/domain/calculo/pared"
import {
  calcularBolsasCemento,
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
  const cantidad = input.cantidad || 1
  const wallInput = {
    area: input.area,
    tipoBloque: input.tipoBloque,
    dosificacionPega: { ...input.dosificacionPega, aguaLt: 250 },
    dosificacionRepello: { ...input.dosificacionRepello, aguaLt: 240 },
    espesorRep_mm: input.espesorRep_mm,
    espesorAfin_mm: input.espesorAfin_mm,
    incluirAcabados: input.incluirAcabados,
    afinado: input.afinado,
    desperdicioBloque: input.desperdicioBloque,
    desperdicioAcabados: input.desperdicioAcabados,
    cantidad,
  }

  const result = WallEngine.calculate(wallInput)

  const cementoPegaKg = redondear(result.cementoPegaKg)
  const cementoPegaBolsas = calcularBolsasCemento(cementoPegaKg)
  const arenaPegaM3 = redondear(result.arenaPegaM3)

  const cementoRepKg = redondear(result.cementoRepelloKg)
  const cementoRepBolsas = calcularBolsasCemento(cementoRepKg)
  const arenaRepM3 = redondear(result.arenaRepelloM3)

  const materiales = [
    crearMaterial("B-01", "Bloque", "pza", result.bloques, input.precios.bloque),
    crearMaterial("C-01", "Cemento CP-40 (pega)", "kg", cementoPegaKg, input.precios.cemento),
    crearMaterial("A-01", "Arena media (pega)", "m³", arenaPegaM3, input.precios.arena),
    crearMaterial("C-02", "Cemento CP-40 (repello)", "kg", cementoRepKg, input.precios.cemento),
    crearMaterial("A-02", "Arena media (repello)", "m³", arenaRepM3, input.precios.arena),
  ]

  if (input.incluirAcabados && result.cementoAfinadoKg) {
    const cementoAfinKg = redondear(result.cementoAfinadoKg)
    const arenaAfinM3 = redondear(result.arenaAfinadoM3 || 0)
    materiales.push(
      crearMaterial("C-03", "Cemento CP-40 (afinado)", "kg", cementoAfinKg, input.precios.cemento),
      crearMaterial("A-03", "Arena fina (afinado)", "m³", arenaAfinM3, input.precios.arena)
    )
  }

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area total": `${result.areaTotal} m²`,
      "Bloques": `${result.bloques} pzas`,
      "Mortero pega": `${redondear(result.morteroPegaM3)} m³`,
      "Cemento pega": `${cementoPegaKg} kg (${cementoPegaBolsas} bolsas)`,
      "Arena pega": `${arenaPegaM3} m³`,
      "Volumen repello": `${redondear(result.volumenRepelloM3)} m³`,
      "Cemento repello": `${cementoRepKg} kg (${cementoRepBolsas} bolsas)`,
      "Arena repello": `${arenaRepM3} m³`,
    },
  }
}
