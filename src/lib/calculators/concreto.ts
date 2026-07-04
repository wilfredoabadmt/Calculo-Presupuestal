import {
  calcularBolsasCemento,
  aplicarDesperdicio,
  redondear,
  convertirLitrosABarriles,
  convertirLitrosAGalones,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputConcreto {
  a: number // largo (m)
  b: number // ancho (m)
  h: number // alto (m)
  dosificacion: {
    cementoKg: number
    arenaM3: number
    gravaM3: number
    aguaLt: number
  }
  desperdicioPorcentaje: number
  cantidad: number
  precios: {
    cemento: number
    arena: number
    grava: number
  }
}

export function calcularConcreto(input: InputConcreto): ResultadoCalculo {
  const volumen = redondear(input.a * input.b * input.h)
  const volumenTotal = redondear(volumen * input.cantidad)

  const volConDesperdicio = aplicarDesperdicio(volumenTotal, input.desperdicioPorcentaje)

  const cementoKg = redondear(volConDesperdicio * input.dosificacion.cementoKg)
  const cementoBolsas = calcularBolsasCemento(cementoKg)
  const arenaM3 = redondear(volConDesperdicio * input.dosificacion.arenaM3)
  const gravaM3 = redondear(volConDesperdicio * input.dosificacion.gravaM3)
  const aguaLt = redondear(volConDesperdicio * input.dosificacion.aguaLt)
  const aguaBarriles = convertirLitrosABarriles(aguaLt)
  const aguaGalones = convertirLitrosAGalones(aguaLt)

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Volumen unitario": `${volumen} m³`,
      "Volumen total": `${volumenTotal} m³`,
      "Volumen c/desperdicio": `${volConDesperdicio} m³`,
      "Cemento": `${cementoKg} kg (${cementoBolsas} bolsas)`,
      "Arena": `${arenaM3} m³`,
      "Grava": `${gravaM3} m³`,
      "Agua": `${aguaLt} lt (${aguaBarriles} barriles / ${aguaGalones} gal)`,
    },
  }
}
