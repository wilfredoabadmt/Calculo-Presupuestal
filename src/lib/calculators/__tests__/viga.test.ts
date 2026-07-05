import { calcularViga, type InputViga } from "../viga"

describe("calcularViga", () => {
  const inputBase: InputViga = {
    largo: 4.0,
    a: 0.40,
    b: 0.30,
    dosificacion: { cementoKg: 260, arenaM3: 0.63, gravaM3: 0.83 },
    resistencia: 210,
    desperdicioConcreto: 5,
    aceroPositivo: {
      longitudTotal: 16, diametro: "3/4", kgM: 3.556,
      traslapes: false, largoTraslape: 0, cantidadVarillas: 4,
    },
    aceroNegativo: {
      longitudTotal: 8, diametro: "1/2", kgM: 1.58,
      traslapes: false, largoTraslape: 0, cantidadVarillas: 2,
    },
    estribos: {
      longitud: 1.2, diametro: "3/8", kgM: 0.888,
      separacionConfinada: 10, separacionCentral: 20,
    },
    desperdicioAcero: 5,
    cantidad: 1,
    precios: { cemento: 8.60, arena: 28.33, grava: 36.66, acero: 10.50 },
  }

  it("debe calcular volumen de concreto", () => {
    const result = calcularViga(inputBase)
    // 4.0 * 0.40 * 0.30 = 0.48
    expect(result.resumen["Volumen concreto"]).toContain("0.48")
  })

  it("debe calcular 6 materiales (concreto + acero +, -, estribos)", () => {
    const result = calcularViga(inputBase)
    expect(result.materiales.length).toBe(6)
  })

  it("debe incluir acero positivo", () => {
    const result = calcularViga(inputBase)
    const aceroPos = result.materiales.find(m => m.nombre.includes("(+)"))
    expect(aceroPos).toBeDefined()
  })

  it("debe incluir acero negativo", () => {
    const result = calcularViga(inputBase)
    const aceroNeg = result.materiales.find(m => m.nombre.includes("(-)"))
    expect(aceroNeg).toBeDefined()
  })

  it("debe calcular costo total", () => {
    const result = calcularViga(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })

  it("debe calcular multiples vigas", () => {
    const input = { ...inputBase, cantidad: 3 }
    const result = calcularViga(input)
    expect(result.resumen["Volumen concreto"]).toContain("1.44")
  })
})
