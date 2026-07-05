import { calcularCielo, type InputCielo } from "../cielo"

describe("calcularCielo", () => {
  const inputBase: InputCielo = {
    ancho: 4.0,
    largo: 5.0,
    viguetas: { separacion: 0.60, largo: 2.4 },
    omegas: { separacion: 0.60 },
    anguloPerimetral: { largo: 3.0 },
    desperdicioPaneles: 5,
    cantidad: 1,
    precios: { panel: 45, vigueta: 12, omega: 8, angulo: 6, masilla: 3.50, tornillos: 0.50 },
  }

  it("debe calcular area total", () => {
    const result = calcularCielo(inputBase)
    // 4.0 * 5.0 = 20
    expect(result.resumen["Area total"]).toContain("20")
  })

  it("debe calcular paneles de yeso", () => {
    const result = calcularCielo(inputBase)
    const paneles = result.materiales.find(m => m.nombre.includes("Panel"))
    expect(paneles).toBeDefined()
    expect(paneles!.cantidad).toBeGreaterThan(0)
  })

  it("debe calcular viguetas", () => {
    const result = calcularCielo(inputBase)
    const viguetas = result.materiales.find(m => m.nombre.includes("Vigueta"))
    expect(viguetas).toBeDefined()
  })

  it("debe calcular omegas", () => {
    const result = calcularCielo(inputBase)
    const omegas = result.materiales.find(m => m.nombre.includes("Omega"))
    expect(omegas).toBeDefined()
  })

  it("debe calcular angulo perimetral", () => {
    const result = calcularCielo(inputBase)
    const angulos = result.materiales.find(m => m.nombre.includes("Angulo"))
    expect(angulos).toBeDefined()
  })

  it("debe calcular masilla", () => {
    const result = calcularCielo(inputBase)
    const masilla = result.materiales.find(m => m.nombre.includes("Masilla"))
    expect(masilla).toBeDefined()
  })

  it("debe calcular tornillos", () => {
    const result = calcularCielo(inputBase)
    const tornillos = result.materiales.find(m => m.nombre.includes("Tornillo"))
    expect(tornillos).toBeDefined()
  })

  it("debe calcular costo total", () => {
    const result = calcularCielo(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })
})
