import {
  aplicarDesperdicio,
  redondear,
  techo as ceil,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils"

export interface InputCielo {
  ancho: number // m
  largo: number // m
  viguetas: {
    separacion: number // m
    largo: number // m
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
  const area = redondear(input.ancho * input.largo)
  const areaTotal = redondear(area * input.cantidad)

  // Paneles de yeso (1.20 x 2.40 = 2.88 m²)
  const areaPanel = 1.2 * 2.4
  const paneles = ceil(aplicarDesperdicio(areaTotal / areaPanel, input.desperdicioPaneles))

  // Viguetas: cada 0.60m
  const numViguetas = ceil(input.largo / input.viguetas.separacion)
  const viguetas = numViguetas * input.cantidad

  // Omegas: cada 0.60m
  const numOmegas = ceil(input.largo / input.omegas.separacion)
  const omegas = numOmegas * input.cantidad

  // Ángulo perimetral
  const perimetro = 2 * (input.ancho + input.largo)
  const angulos = ceil(perimetro / input.anguloPerimetral.largo) * input.cantidad

  // Masilla: ~0.5 kg/m²
  const masillaKg = redondear(areaTotal * 0.5)

  // Tornillos: ~4 por panel
  const tornillos = paneles * 4

  const materiales = [
    crearMaterial("PN-01", "Panel de yeso 1.20x2.40", "pza", paneles, input.precios.panel),
    crearMaterial("VG-01", "Vigueta metalica", "pza", viguetas, input.precios.vigueta),
    crearMaterial("OM-01", "Omega metalica", "pza", omegas, input.precios.omega),
    crearMaterial("AN-01", "Angulo perimetral", "pza", angulos, input.precios.angulo),
    crearMaterial("MS-01", "Masilla", "kg", masillaKg, input.precios.masilla),
    crearMaterial("TN-01", "Tornillos", "pza", tornillos, input.precios.tornillos),
  ]

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0)

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Area total": `${areaTotal} m²`,
      "Paneles": `${paneles} pzas`,
      "Viguetas": `${viguetas} pzas`,
      "Omegas": `${omegas} pzas`,
      "Ángulo perimetral": `${angulos} pzas`,
      "Masilla": `${masillaKg} kg`,
      "Tornillos": `${tornillos} pzas`,
    },
  }
}

function techo(value: number): number {
  return Math.ceil(value)
}
