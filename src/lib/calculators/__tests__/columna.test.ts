import { calcularColumna, type InputColumna } from "../columna"

describe("calcularColumna", () => {
  const inputBase: InputColumna = {
    alto: 3.0,
    a: 0.30,
    b: 0.40,
    dosificacion: { cementoKg: 260, arenaM3: 0.63, gravaM3: 0.83 },
    resistencia: 210,
    desperdicioConcreto: 5,
    aceroLongitudinal: {
      longitudTotal: 12,
      diametro: "1/2",
      kgM: 1.58,
      traslapes: false,
      largoTraslape: 0,
      cantidadVarillas: 4,
    },
    estribos: {
      longitud: 1.2,
      diametro: "3/8",
      kgM: 0.888,
      separacionConfinada: 10,
      separacionCentral: 20,
      zonas: 2,
    },
    desperdicioAcero: 5,
    cantidad: 1,
    precios: { cemento: 8.60, arena: 28.33, grava: 36.66, acero: 10.50 },
  }

  it("debe calcular volumen de concreto", () => {
    const result = calcularColumna(inputBase)
    // 3.0 * 0.30 * 0.40 = 0.36
    expect(result.resumen["Volumen concreto"]).toContain("0.36")
  })

  it("debe calcular 5 materiales (concreto + acero long + estribos)", () => {
    const result = calcularColumna(inputBase)
    expect(result.materiales.length).toBe(5)
  })

  it("debe incluir acero longitudinal", () => {
    const result = calcularColumna(inputBase)
    const acero = result.materiales.find(m => m.nombre.includes("long"))
    expect(acero).toBeDefined()
    expect(acero!.cantidad).toBeGreaterThan(0)
  })

  it("debe incluir estribos", () => {
    const result = calcularColumna(inputBase)
    const estribos = result.materiales.find(m => m.nombre.includes("Estribo"))
    expect(estribos).toBeDefined()
  })

  it("debe calcular multiples columnas", () => {
    const input = { ...inputBase, cantidad: 4 }
    const result = calcularColumna(input)
    expect(result.resumen["Volumen concreto"]).toContain("1.44")
  })

  it("debe calcular costo total", () => {
    const result = calcularColumna(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })

  it("debe calcular con traslapes", () => {
    const input = {
      ...inputBase,
      aceroLongitudinal: {
        ...inputBase.aceroLongitudinal,
        traslapes: true,
        largoTraslape: 0.40,
      },
    }
    const result = calcularColumna(input)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })
})
