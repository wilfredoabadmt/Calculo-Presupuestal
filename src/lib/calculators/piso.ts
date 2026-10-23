import { FloorEngine } from "@/domain/calculo/piso"
import {
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputPiso {
  ancho: number // m
  largo: number // m
  tipoCeramica: {
    anchoCm: number
    largoCm: number
    areaM2: number
    unidadesCaja: number
    precioCaja: number
  }
  desperdicioCeramica: number
  desperdicioAdhesivo: number
  desperdicioBoquilla: number
  unidadAgua: string
  cantidad: number
  precios: {
    ceramica: number // precio por caja
    adhesivo: number // precio por kg
    boquilla: number // precio por kg
  }
}

export function calcularPiso(input: InputPiso): ResultadoCalculo {
  const result = FloorEngine.calculate({
    ancho: input.ancho,
    largo: input.largo,
    tipoCeramica: {
      anchoCm: input.tipoCeramica.anchoCm,
      largoCm: input.tipoCeramica.largoCm,
      areaM2: input.tipoCeramica.areaM2,
      unidadesCaja: input.tipoCeramica.unidadesCaja,
      precioCaja: input.precios.ceramica,
    },
    desperdicioCeramica: input.desperdicioCeramica,
    desperdicioAdhesivo: input.desperdicioAdhesivo,
    desperdicioBoquilla: input.desperdicioBoquilla,
    unidadAgua: input.unidadAgua,
    cantidad: input.cantidad || 1,
  })

  const cajas = Math.ceil(result.piezas / input.tipoCeramica.unidadesCaja)
  const materiales = [
    crearMaterial("CR-01", "Cerámica", "caja", cajas, input.precios.ceramica),
    crearMaterial("AD-01", "Adhesivo", "kg", result.adhesivoKg, input.precios.adhesivo),
    crearMaterial("BQ-01", "Boquilla", "kg", result.boquillaKg, input.precios.boquilla),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area total": `${result.areaTotal} m²`,
      "Piezas": `${result.piezas} pzas`,
      "Cajas": `${cajas} cajas`,
      "Adhesivo": `${result.adhesivoKg} kg`,
      "Boquilla": `${result.boquillaKg} kg`,
      "Agua": `${result.aguaLt} lt`,
    },
  }
}