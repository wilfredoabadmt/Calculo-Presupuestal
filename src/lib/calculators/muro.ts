import { RetainingWallEngine } from "@/domain/calculo/muro"
import {
  calcularBolsasCemento,
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputMuro {
  corona: number // m (espesor superior)
  base: number // m (espesor inferior)
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

export function calcularMuro(input: InputMuro): ResultadoCalculo {
  const result = RetainingWallEngine.calculate({
    corona: input.corona,
    base: input.base,
    altura: input.altura,
    largo: input.largo,
    dosificacion: input.dosificacion,
    porcentajePiedra: input.porcentajePiedra,
    porcentajeMortero: input.porcentajeMortero,
    cantidad: input.cantidad || 1,
  })

  const cementoBolsas = calcularBolsasCemento(redondear(result.cementoKg))
  const arenaM3 = redondear(result.arenaM3)
  const volPiedra = redondear(result.volumenPiedra)
  const volMortero = redondear(result.volumenMortero)
  const aguaLt = redondear(result.aguaLt)

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
      "Espesor promedio": `${redondear(result.espesorPromedio)} m`,
      "Volumen total": `${redondear(result.volumenTotal)} m³`,
      "Piedra": `${volPiedra} m³ (${input.porcentajePiedra}%)`,
      "Mortero": `${volMortero} m³ (${input.porcentajeMortero}%)`,
      "Cemento": `${redondear(result.cementoKg)} kg (${cementoBolsas} bolsas)`,
      "Arena": `${arenaM3} m³`,
      "Agua": `${aguaLt} lt`,
    },
  }
}