import { calcularCimiento, type InputCimiento } from "../cimiento"

describe("calcularCimiento", () => {
  const inputBase: InputCimiento = {
    base: 0.50,
    altura: 0.40,
    largo: 10.0,
    dosificacion: { cementoKg: 260, arenaM3: 1.10, aguaLt: 235 },
    porcentajePiedra: 60,
    porcentajeMortero: 40,
    cantidad: 1,
    precios: { piedra: 120, cemento: 8.60, arena: 28.33 },
  }

  it("debe calcular volumen total", () => {
    const result = calcularCimiento(inputBase)
    // 0.50 * 0.40 * 10.0 = 2.0
    expect(result.resumen["Volumen total"]).toContain("2")
  })

  it("debe dividir piedra y mortero por porcentajes", () => {
    const result = calcularCimiento(inputBase)
    expect(result.resumen["Piedra"]).toContain("60%")
    expect(result.resumen["Mortero"]).toContain("40%")
  })

  it("debe calcular 3 materiales (piedra, cemento, arena)", () => {
    const result = calcularCimiento(inputBase)
    expect(result.materiales.length).toBe(3)
  })

  it("debe calcular costo total", () => {
    const result = calcularCimiento(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })

  it("debe calcular multiples cimientos", () => {
    const input = { ...inputBase, cantidad: 3 }
    const result = calcularCimiento(input)
    expect(result.resumen["Volumen total"]).toContain("6")
  })
})
