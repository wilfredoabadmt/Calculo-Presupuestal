import {
  aplicarDesperdicio,
  redondear,
  techo as ceil,
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
  // area_real = √(L² + H²) × A
  const areaReal = redondear(Math.sqrt(Math.pow(input.largo, 2) + Math.pow(input.alto, 2)) * input.ancho)
  const areaTotal = redondear(areaReal * input.cantidad)

  const tejas = ceil(aplicarDesperdicio(areaTotal * input.tipoTeja.unidadesM2, input.desperdicio))

  const materiales = [
    crearMaterial("T-01", "Teja", "pza", tejas, input.precios.teja),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area real": `${areaReal} m²`,
      "Area total": `${areaTotal} m²`,
      "Tejas": `${tejas} pzas`,
    },
  }
}
