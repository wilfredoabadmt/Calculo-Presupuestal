import { calcularPared, type InputPared } from "../pared"

describe("calcularPared", () => {
  const inputBase: InputPared = {
    area: 10,
    tipoBloque: {
      unidadesM2: 12.5,
      morteroM3M2: 0.0115,
    },
    dosificacionPega: {
      cementoKg: 364,
      arenaM3: 1.16,
    },
    dosificacionRepello: {
      cementoKg: 364,
      arenaM3: 1.16,
    },
    espesorRep_mm: 15,
    espesorAfin_mm: 5,
    incluirAcabados: true,
    afinado: {
      rendimiento: 3.5,
      aguaPorBolsa: 15,
    },
    desperdicioBloque: 5,
    desperdicioAcabados: 10,
    cantidad: 1,
    precios: {
      bloque: 3.80,
      cemento: 8.60,
      arena: 28.33,
    },
  }

  it("debe calcular bloques correctamente", () => {
    const result = calcularPared(inputBase)
    // area * unidadesM2 * (1 + desperdicio) = 10 * 12.5 * 1.05 = 131.25 -> ceil = 132
    const bloques = result.materiales.find(m => m.nombre.includes("Bloque"))
    expect(bloques).toBeDefined()
    expect(bloques!.cantidad).toBe(132)
  })

  it("debe calcular mortero de pega", () => {
    const result = calcularPared(inputBase)
    const cementoPega = result.materiales.find(m => m.nombre.includes("pega") && m.nombre.includes("Cemento"))
    expect(cementoPega).toBeDefined()
    expect(cementoPega!.cantidad).toBeGreaterThan(0)
  })

  it("debe calcular repello", () => {
    const result = calcularPared(inputBase)
    const cementoRep = result.materiales.find(m => m.nombre.includes("repello") && m.nombre.includes("Cemento"))
    expect(cementoRep).toBeDefined()
  })

  it("debe incluir acabados cuando esta habilitado", () => {
    const result = calcularPared(inputBase)
    const afinado = result.materiales.find(m => m.nombre.includes("afinado"))
    expect(afinado).toBeDefined()
  })

  it("debe excluir acabados cuando esta deshabilitado", () => {
    const input = { ...inputBase, incluirAcabados: false }
    const result = calcularPared(input)
    const afinado = result.materiales.find(m => m.nombre.includes("afinado"))
    expect(afinado).toBeUndefined()
  })

  it("debe calcular area total para multiples muros", () => {
    const input = { ...inputBase, cantidad: 3 }
    const result = calcularPared(input)
    expect(result.resumen["Area total"]).toContain("30")
  })

  it("debe calcular costo total", () => {
    const result = calcularPared(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })
})
