import {
  calcularBolsasCemento,
  aplicarDesperdicio,
  redondear,
  techo,
  convertirLitrosABarriles,
  convertirLitrosAGalones,
  crearMaterial,
} from "../utils"

describe("utils", () => {
  describe("calcularBolsasCemento", () => {
    it("debe calcular bolsas exactas para kg divisible por 42.5", () => {
      expect(calcularBolsasCemento(42.5)).toBe(1)
      expect(calcularBolsasCemento(85)).toBe(2)
    })

    it("debe redondear hacia arriba", () => {
      expect(calcularBolsasCemento(43)).toBe(2)
      expect(calcularBolsasCemento(1)).toBe(1)
    })

    it("debe manejar 0", () => {
      expect(calcularBolsasCemento(0)).toBe(0)
    })
  })

  describe("aplicarDesperdicio", () => {
    it("debe calcular desperdicio correctamente", () => {
      expect(aplicarDesperdicio(100, 10)).toBeCloseTo(110)
      expect(aplicarDesperdicio(100, 5)).toBeCloseTo(105)
      expect(aplicarDesperdicio(100, 0)).toBeCloseTo(100)
    })

    it("debe manejar valores decimales", () => {
      expect(aplicarDesperdicio(1.5, 10)).toBeCloseTo(1.65)
    })
  })

  describe("redondear", () => {
    it("debe redondear a 2 decimales por defecto", () => {
      expect(redondear(1.234)).toBe(1.23)
      expect(redondear(1.235)).toBe(1.24)
      expect(redondear(1.1)).toBe(1.1)
    })

    it("debe redondear a N decimales", () => {
      expect(redondear(1.2345, 3)).toBe(1.235)
      expect(redondear(1.2345, 1)).toBe(1.2)
    })
  })

  describe("techo", () => {
    it("debe redondear hacia arriba", () => {
      expect(techo(1.1)).toBe(2)
      expect(techo(1.0)).toBe(1)
      expect(techo(0.1)).toBe(1)
      expect(techo(0)).toBe(0)
    })
  })

  describe("convertirLitrosABarriles", () => {
    it("debe convertir correctamente", () => {
      expect(convertirLitrosABarriles(158.98)).toBeCloseTo(1.0, 1)
      expect(convertirLitrosABarriles(317.96)).toBeCloseTo(2.0, 1)
    })
  })

  describe("convertirLitrosAGalones", () => {
    it("debe convertir correctamente", () => {
      expect(convertirLitrosAGalones(3.785)).toBeCloseTo(1.0, 1)
      expect(convertirLitrosAGalones(7.57)).toBeCloseTo(2.0, 1)
    })
  })

  describe("crearMaterial", () => {
    it("debe crear material con costo correcto", () => {
      const mat = crearMaterial("C-01", "Cemento", "bolsa", 10, 8.60)
      expect(mat).toEqual({
        codigo: "C-01",
        nombre: "Cemento",
        unidad: "bolsa",
        cantidad: 10,
        precioUnitario: 8.60,
        costoTotal: 86,
      })
    })

    it("debe redondear cantidad", () => {
      const mat = crearMaterial("A-01", "Arena", "m³", 1.234, 28.33)
      expect(mat.cantidad).toBe(1.23)
    })
  })
})
