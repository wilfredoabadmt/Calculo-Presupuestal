import { calcularMuro, type InputMuro } from "../muro"

describe("calcularMuro", () => {
  const inputBase: InputMuro = {
    corona: 0.30,
    base: 0.50,
    altura: 2.80,
    largo: 10.0,
    dosificacion: { cementoKg: 260, arenaM3: 1.10, aguaLt: 235 },
    porcentajePiedra: 60,
    porcentajeMortero: 40,
    cantidad: 1,
    precios: { piedra: 120, cemento: 8.60, arena: 28.33 },
  }

  it("debe calcular espesor promedio", () => {
    const result = calcularMuro(inputBase)
    // (0.30 + 0.50) / 2 = 0.40
    expect(result.resumen["Espesor promedio"]).toContain("0.4")
  })

  it("debe calcular volumen total", () => {
    const result = calcularMuro(inputBase)
    // 0.40 * 2.80 * 10.0 = 11.2
    expect(result.resumen["Volumen total"]).toContain("11.2")
  })

  it("debe dividir piedra y mortero", () => {
    const result = calcularMuro(inputBase)
    expect(result.resumen["Piedra"]).toContain("60%")
    expect(result.resumen["Mortero"]).toContain("40%")
  })

  it("debe calcular 3 materiales", () => {
    const result = calcularMuro(inputBase)
    expect(result.materiales.length).toBe(3)
  })

  it("debe calcular costo total", () => {
    const result = calcularMuro(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })

  it("debe calcular multiples muros", () => {
    const input = { ...inputBase, cantidad: 2 }
    const result = calcularMuro(input)
    expect(result.resumen["Volumen total"]).toContain("22.4")
  })
})
