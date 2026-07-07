import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const proyectoId = "cmr8g6wn0007bz69scr54qmz"

  console.log("=== Checking Project ===")
  const proyecto = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
  })
  console.log("Proyecto:", proyecto)

  console.log("\n=== Checking Capitulos ===")
  const capitulos = await prisma.capituloPresupuesto.findMany({
    where: { proyectoId },
    include: {
      partidas: true,
    },
  })
  console.log(`Found ${capitulos.length} capitulos:`)
  for (const c of capitulos) {
    console.log(`- Cap [${c.codigo}] ${c.nombre} (id: ${c.id}, activo: ${c.activo})`)
    for (const p of c.partidas) {
      console.log(`    → Partida [${p.codigo}] ${p.descripcion} (id: ${p.id}, activo: ${p.activo}, precioBase: ${p.precioBase})`)
    }
  }

  console.log("\n=== Checking Elementos de Presupuesto ===")
  const elementos = await prisma.elementoPresupuesto.findMany({
    where: { proyectoId },
  })
  console.log(`Found ${elementos.length} elementos:`)
  for (const e of elementos) {
    console.log(`- Elemento: ${e.descripcion} (tipo: ${e.tipoElemento}, costoTotal: ${e.costoTotal})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
