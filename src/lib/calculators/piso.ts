import {
  aplicarDesperdicio,
  redondear,
  techo as ceil,
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
  const area = redondear(input.ancho * input.largo)
  const areaTotal = redondear(area * input.cantidad)

  // Cerámicas
  const piezas = ceil(aplicarDesperdicio(areaTotal / input.tipoCeramica.areaM2, input.desperdicioCeramica))
  const cajas = ceil(piezas / input.tipoCeramica.unidadesCaja)

  // Adhesivo: ~5 kg/m²
  const adhesivoKg = redondear(aplicarDesperdicio(areaTotal * 5, input.desperdicioAdhesivo))

  // Boquilla: ~0.5 kg/m de junta
  const perimeterJuntas = redondear(areaTotal * 2 / (input.tipoCeramica.largoCm / 100))
  const boquillaKg = redondear(aplicarDesperdicio(perimeterJuntas * 0.5, input.desperdicioBoquilla))

  // Agua: ~3 lt/m²
  const aguaLt = redondear(areaTotal * 3)

  const materiales = [
    crearMaterial("CR-01", "Cerámica", "caja", cajas, input.precios.ceramica),
    crearMaterial("AD-01", "Adhesivo", "kg", adhesivoKg, input.precios.adhesivo),
    crearMaterial("BQ-01", "Boquilla", "kg", boquillaKg, input.precios.boquilla),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area total": `${areaTotal} m²`,
      "Piezas": `${piezas} pzas`,
      "Cajas": `${cajas} cajas`,
      "Adhesivo": `${adhesivoKg} kg`,
      "Boquilla": `${boquillaKg} kg`,
      "Agua": `${aguaLt} lt`,
    },
  }
}

function techo(value: number): number {
  return Math.ceil(value)
}
