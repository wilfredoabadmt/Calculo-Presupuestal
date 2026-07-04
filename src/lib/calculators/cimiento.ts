import {
  calcularBolsasCemento,
  aplicarDesperdicio,
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputCimiento {
  base: number // m
  altura: number // m
  largo: number // m
  dosificacion: {
    cementoKg: number
    arenaM3: number
    aguaLt: number
  }
  porcentajePiedra: number
  porcentajeMortero: number
  cantidad: number
  precios: {
    piedra: number
    cemento: number
    arena: number
  }
}

export function calcularCimiento(input: InputCimiento): ResultadoCalculo {
  const volumen = redondear(input.base * input.altura * input.largo)
  const volTotal = redondear(volumen * input.cantidad)

  const volPiedra = redondear(volTotal * (input.porcentajePiedra / 100))
  const volMortero = redondear(volTotal * (input.porcentajeMortero / 100))

  const cementoKg = redondear(volMortero * input.dosificacion.cementoKg)
  const cementoBolsas = calcularBolsasCemento(cementoKg)
  const arenaM3 = redondear(volMortero * input.dosificacion.arenaM3)
  const aguaLt = redondear(volMortero * input.dosificacion.aguaLt)

  const materiales = [
    crearMaterial("P-01", "Piedra", "m³", volPiedra, input.precios.piedra),
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Volumen total": `${volTotal} m³`,
      "Piedra": `${volPiedra} m³ (${input.porcentajePiedra}%)`,
      "Mortero": `${volMortero} m³ (${input.porcentajeMortero}%)`,
      "Cemento": `${cementoKg} kg (${cementoBolsas} bolsas)`,
      "Arena": `${arenaM3} m³`,
      "Agua": `${aguaLt} lt`,
    },
  }
}
