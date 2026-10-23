import { ConcreteEngine } from "@/domain/calculo/concreto";
import {
  calcularBolsasCemento,
  redondear,
  convertirLitrosABarriles,
  convertirLitrosAGalones,
  crearMaterial,
  type ResultadoCalculo,
} from "./utils";

export interface InputConcreto {
  a: number;
  b: number;
  h: number;
  dosificacion: {
    cementoKg: number;
    arenaM3: number;
    gravaM3: number;
    aguaLt: number;
  };
  desperdicioPorcentaje: number;
  cantidad: number;
  precios: {
    cemento: number;
    arena: number;
    grava: number;
  };
}

export function calcularConcreto(input: InputConcreto): ResultadoCalculo {
  const volumen = redondear(input.a * input.b * input.h);
  const volumenTotal = redondear(volumen * input.cantidad);

  // Using the new Domain Engine
  const result = ConcreteEngine.calculate(
    volumenTotal,
    input.dosificacion,
    input.desperdicioPorcentaje
  );

  const cementoBolsas = calcularBolsasCemento(redondear(result.cementoKg));
  const arenaM3 = redondear(result.arenaM3);
  const gravaM3 = redondear(result.gravaM3);
  const aguaLt = redondear(result.aguaLt);

  const materiales = [
    crearMaterial("C-01", "Cemento CP-40", "bolsa", cementoBolsas, input.precios.cemento),
    crearMaterial("A-01", "Arena media", "m³", arenaM3, input.precios.arena),
    crearMaterial("G-01", "Grava 3/4\"", "m³", gravaM3, input.precios.grava),
  ];

  const costoTotalMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0);

  return {
    materiales,
    costoTotalMateriales,
    resumen: {
      "Volumen unitario": `${volumen} m³`,
      "Volumen total": `${volumenTotal} m³`,
      "Volumen c/desperdicio": `${redondear(volumenTotal * (1 + input.desperdicioPorcentaje / 100), 3)} m³`,
      "Cemento": `${redondear(result.cementoKg)} kg (${cementoBolsas} bolsas)`,
      "Arena": `${arenaM3} m³`,
      "Grava": `${gravaM3} m³`,
      "Agua": `${aguaLt} lt (${convertirLitrosABarriles(aguaLt)} barriles / ${convertirLitrosAGalones(aguaLt)} gal)`,
    },
  };
}
