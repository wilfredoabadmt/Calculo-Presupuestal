import { calcularTecho, type InputTecho } from "../techo"

describe("calcularTecho", () => {
  const inputBase: InputTecho = {
    ancho: 8.0,
    largo: 12.0,
    alto: 3.0,
    tipoTeja: { unidadesM2: 10 },
    desperdicio: 5,
    cantidad: 1,
    precios: { teja: 15 },
  }

  it("debe calcular area real con pendiente", () => {
    const result = calcularTecho(inputBase)
    // areaReal = sqrt(12² + 3²) * 8 = sqrt(153)*8 ≈ 98.95
    expect(result.resumen["Area real"]).toContain("98.95")
  })

  it("debe calcular tejas con desperdicio", () => {
    const result = calcularTecho(inputBase)
    const tejas = result.materiales.find(m => m.nombre.includes("Teja"))
    expect(tejas).toBeDefined()
    expect(tejas!.cantidad).toBeGreaterThan(0)
  })

  it("debe calcular costo total", () => {
    const result = calcularTecho(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })

  it("debe calcular multiples techos", () => {
    const input = { ...inputBase, cantidad: 2 }
    const result = calcularTecho(input)
    expect(result.resumen["Area total"]).toContain("197")
  })
})
