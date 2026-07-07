import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== LISTING PROJECTS ===");
  const proyectos = await prisma.proyecto.findMany({
    include: {
      _count: {
        select: {
          elementos: true,
          capitulos: true,
        }
      },
      presupuestoDetallado: true,
    }
  });

  for (const p of proyectos) {
    console.log(`Proyecto ID: ${p.id}`);
    console.log(`Nombre: ${p.nombre}`);
    console.log(`Cliente: ${p.cliente}`);
    console.log(`Elementos Count: ${p._count.elementos}`);
    console.log(`Capitulos Count: ${p._count.capitulos}`);
    console.log(`Presupuesto Detallado:`, p.presupuestoDetallado);
    console.log("-----------------------------------------");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
