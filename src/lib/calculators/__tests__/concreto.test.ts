import { calcularConcreto, type InputConcreto } from "../concreto"

describe("calcularConcreto", () => {
  const inputBase: InputConcreto = {
    a: 0.30,
    b: 0.40,
    h: 3.00,
    dosificacion: {
      cementoKg: 260,
      arenaM3: 0.63,
      gravaM3: 0.83,
      aguaLt: 163,
    },
    desperdicioPorcentaje: 5,
    cantidad: 1,
    precios: {
      cemento: 8.60,
      arena: 28.33,
      grava: 36.66,
    },
  }

  it("debe calcular volumen correctamente", () => {
    const result = calcularConcreto(inputBase)
    expect(result.resumen["Volumen unitario"]).toContain("0.36")
  })

  it("debe calcular materiales para 1 columna", () => {
    const result = calcularConcreto(inputBase)
    expect(result.materiales.length).toBe(3)
    expect(result.materiales[0].nombre).toContain("Cemento")
    expect(result.materiales[1].nombre).toContain("Arena")
    expect(result.materiales[2].nombre).toContain("Grava")
  })

  it("debe aplicar desperdicio", () => {
    const result = calcularConcreto(inputBase)
    // volumen = 0.30 * 0.40 * 3.00 = 0.36
    // con desperdicio = 0.36 * 1.05 = 0.378
    expect(result.resumen["Volumen c/desperdicio"]).toContain("0.378")
  })

  it("debe calcular multiples columnas", () => {
    const input = { ...inputBase, cantidad: 5 }
    const result = calcularConcreto(input)
    // volumen total = 0.36 * 5 = 1.8
    expect(result.resumen["Volumen total"]).toContain("1.8")
  })

  it("debe calcular costo total", () => {
    const result = calcularConcreto(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })

  it("debe calcular bolsas de cemento", () => {
    const result = calcularConcreto(inputBase)
    const cemento = result.materiales.find(m => m.nombre.includes("Cemento"))
    expect(cemento).toBeDefined()
    expect(cemento!.cantidad).toBeGreaterThan(0)
  })
})
