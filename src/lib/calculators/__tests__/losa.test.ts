import { calcularLosa, type InputLosa } from "../losa"

describe("calcularLosa", () => {
  const inputBase: InputLosa = {
    largo: 6.0,
    ancho: 4.0,
    espesor: 0.15,
    dosificacion: { cementoKg: 260, arenaM3: 0.63, gravaM3: 0.83 },
    desperdicioConcreto: 5,
    aceroXa: { separacion: 20, kgM: 1.58 },
    aceroXb: { separacion: 20, kgM: 1.58 },
    aceroYa: { separacion: 20, kgM: 1.58 },
    aceroYb: { separacion: 20, kgM: 1.58 },
    separacionAcero: 20,
    desperdicioAcero: 5,
    bovedillas: { largo: 1.2, ancho: 0.4, unidadesM2: 2.08 },
    electromalla: { ancho: 2.4, largo: 5.4, unidadesM2: 0.08 },
    cantidad: 1,
    precios: { cemento: 8.60, arena: 28.33, grava: 36.66, acero: 10.50, bovedilla: 12, electromalla: 45 },
  }

  it("debe calcular volumen de concreto", () => {
    const result = calcularLosa(inputBase)
    // 6.0 * 4.0 * 0.15 = 3.6
    expect(result.resumen["Volumen concreto"]).toContain("3.6")
  })

  it("debe calcular 6 materiales", () => {
    const result = calcularLosa(inputBase)
    expect(result.materiales.length).toBe(6)
  })

  it("debe incluir bovedillas", () => {
    const result = calcularLosa(inputBase)
    const bovedillas = result.materiales.find(m => m.nombre.includes("Bovedilla"))
    expect(bovedillas).toBeDefined()
    expect(bovedillas!.cantidad).toBeGreaterThan(0)
  })

  it("debe incluir electromalla", () => {
    const result = calcularLosa(inputBase)
    const electromalla = result.materiales.find(m => m.nombre.includes("Electromalla"))
    expect(electromalla).toBeDefined()
  })

  it("debe calcular costo total", () => {
    const result = calcularLosa(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })
})
