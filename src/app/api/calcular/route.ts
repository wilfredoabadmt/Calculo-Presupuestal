import { NextResponse } from "next/server"
import { calcularConcreto, type InputConcreto } from "@/lib/calculators/concreto"
import { calcularPared, type InputPared } from "@/lib/calculators/pared"
import { calcularColumna, type InputColumna } from "@/lib/calculators/columna"
import { calcularViga, type InputViga } from "@/lib/calculators/viga"
import { calcularLosa, type InputLosa } from "@/lib/calculators/losa"
import { calcularCimiento, type InputCimiento } from "@/lib/calculators/cimiento"
import { calcularMuro, type InputMuro } from "@/lib/calculators/muro"
import { calcularTecho, type InputTecho } from "@/lib/calculators/techo"
import { calcularPiso, type InputPiso } from "@/lib/calculators/piso"
import { calcularCielo, type InputCielo } from "@/lib/calculators/cielo"

const calculadoras: Record<string, (input: any) => any> = {
  concreto: calcularConcreto,
  pared: calcularPared,
  columna: calcularColumna,
  viga: calcularViga,
  losa: calcularLosa,
  cimiento: calcularCimiento,
  muro: calcularMuro,
  techo: calcularTecho,
  piso: calcularPiso,
  cielo: calcularCielo,
}

export async function POST(request: Request) {
  const body = await request.json()
  const { tipo, input } = body

  if (!tipo || !calculadoras[tipo]) {
    return NextResponse.json({ error: `Tipo de calculadora inválido: ${tipo}` }, { status: 400 })
  }

  try {
    const resultado = calculadoras[tipo](input)
    return NextResponse.json(resultado)
  } catch (error) {
    return NextResponse.json({ error: "Error en el cálculo", details: String(error) }, { status: 400 })
  }
}
