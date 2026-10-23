import { CeilingEngine } from "@/domain/calculo/cielo"
import {
  redondear,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputCielo {
  ancho: number // m
  largo: number // m
  viguetas: {
    separacion: number // m
  }
  omegas: {
    separacion: number // m
  }
  anguloPerimetral: {
    largo: number // m
  }
  desperdicioPaneles: number
  cantidad: number
  precios: {
    panel: number // por m²
    vigueta: number // por pza
    omega: number // por pza
    angulo: number // por pza
    masilla: number // por kg
    tornillos: number // por pza
  }
}

export function calcularCielo(input: InputCielo): ResultadoCalculo {
  const result = CeilingEngine.calculate({
    ancho: input.ancho,
    largo: input.largo,
    viguetas: { separation: input.viguetas.separacion },
    omegas: { separation: input.omegas.separacion },
    anguloPerimetral: { length: input.anguloPerimetral.largo },
    desperdicioPaneles: input.desperdicioPaneles,
    cantidad: input.cantidad || 1,
  })

  const materiales = [
    crearMaterial("PN-01", "Panel de yeso 1.20x2.40", "pza", result.paneles, input.precios.panel),
    crearMaterial("VG-01", "Vigueta metalica", "pza", result.viguetas, input.precios.vigueta),
    crearMaterial("OM-01", "Omega metalica", "pza", result.omegas, input.precios.omega),
    crearMaterial("AN-01", "Angulo perimetral", "pza", result.angulos, input.precios.angulo),
    crearMaterial("MS-01", "Masilla", "kg", result.masillaKg, input.precios.masilla),
    crearMaterial("TN-01", "Tornillos", "pza", result.tornillos, input.precios.tornillos),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area total": `${result.areaTotal} m²`,
      "Paneles": `${result.paneles} pzas`,
      "Viguetas": `${result.viguetas} pzas`,
      "Omegas": `${result.omegas} pzas`,
      "Ángulo perimetral": `${result.angulos} pzas`,
      "Masilla": `${result.masillaKg} kg`,
      "Tornillos": `${result.tornillos} pzas`,
    },
  }
}