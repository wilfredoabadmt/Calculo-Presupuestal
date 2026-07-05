import { calcularPiso, type InputPiso } from "../piso"

describe("calcularPiso", () => {
  const inputBase: InputPiso = {
    ancho: 4.0,
    largo: 5.0,
    tipoCeramica: {
      anchoCm: 33,
      largoCm: 33,
      areaM2: 0.1089,
      unidadesCaja: 11,
      precioCaja: 35,
    },
    desperdicioCeramica: 5,
    desperdicioAdhesivo: 5,
    desperdicioBoquilla: 5,
    unidadAgua: "lt",
    cantidad: 1,
    precios: { ceramica: 35, adhesivo: 4.50, boquilla: 3.80 },
  }

  it("debe calcular area total", () => {
    const result = calcularPiso(inputBase)
    // 4.0 * 5.0 = 20
    expect(result.resumen["Area total"]).toContain("20")
  })

  it("debe calcular cajas de ceramica", () => {
    const result = calcularPiso(inputBase)
    expect(result.resumen["Cajas"]).toBeDefined()
    const cajas = result.materiales.find(m => m.nombre.includes("Cerámica"))
    expect(cajas).toBeDefined()
  })

  it("debe calcular adhesivo", () => {
    const result = calcularPiso(inputBase)
    const adhesivo = result.materiales.find(m => m.nombre.includes("Adhesivo"))
    expect(adhesivo).toBeDefined()
    expect(adhesivo!.cantidad).toBeGreaterThan(0)
  })

  it("debe calcular boquilla", () => {
    const result = calcularPiso(inputBase)
    const boquilla = result.materiales.find(m => m.nombre.includes("Boquilla"))
    expect(boquilla).toBeDefined()
  })

  it("debe calcular costo total", () => {
    const result = calcularPiso(inputBase)
    expect(result.costoTotalMateriales).toBeGreaterThan(0)
  })
})
