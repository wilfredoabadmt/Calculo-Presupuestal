import { RoofEngine } from "@/domain/calculo/techo"
import {
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputTecho {
  ancho: number // m
  largo: number // m
  alto: number // m (altura de la pendiente)
  tipoTeja: {
    unidadesM2: number
  }
  desperdicio: number
  cantidad: number
  precios: {
    teja: number
  }
}

export function calcularTecho(input: InputTecho): ResultadoCalculo {
  const result = RoofEngine.calculate({
    ancho: input.ancho,
    largo: input.largo,
    alto: input.alto,
    unidadesM2: input.tipoTeja.unidadesM2,
    desperdicio: input.desperdicio,
    cantidad: input.cantidad || 1,
  })

  const tejas = Math.ceil(result.tejas)
  const materiales = [
    crearMaterial("T-01", "Teja", "pza", tejas, input.precios.teja),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area real": `${redondear(result.areaReal)} m²`,
      "Area total": `${redondear(result.areaTotal)} m²`,
      "Tejas": `${tejas} pzas`,
    },
  }
}