import { PrismaClient } from "@prisma/client";
import { Decimal } from "decimal.js";

const prisma = new PrismaClient();

// Helper financial calculation function matching the backend logic
function calcularCascadaFinanciera(
  costoDirecto: number,
  porcentajeBI: number,
  porcentajeIVA: number
) {
  const cd = new Decimal(costoDirecto);
  const biMonto = cd.times(new Decimal(porcentajeBI)).dividedBy(100);
  const baseImponible = cd.plus(biMonto);
  const ivaMonto = baseImponible.times(new Decimal(porcentajeIVA)).dividedBy(100);
  const totalGeneral = baseImponible.plus(ivaMonto);

  return {
    costoDirecto: cd.toDecimalPlaces(2).toNumber(),
    beneficioIndustrial: biMonto.toDecimalPlaces(2).toNumber(),
    baseImponible: baseImponible.toDecimalPlaces(2).toNumber(),
    iva: ivaMonto.toDecimalPlaces(2).toNumber(),
    totalGeneral: totalGeneral.toDecimalPlaces(2).toNumber(),
  };
}

async function main() {
  console.log("=== INICIANDO ANÁLISIS Y LIMPIEZA DE FILAS SIN DATOS ===");

  // 1. Obtener todos los proyectos
  const proyectos = await prisma.proyecto.findMany({
    include: {
      presupuestoDetallado: true,
    }
  });

  for (const p of proyectos) {
    console.log(`\nProyecto: ${p.nombre} (ID: ${p.id})`);
    
    const presupuesto = p.presupuestoDetallado;
    if (!presupuesto) {
      console.log("  No tiene presupuesto detallado inicializado. Saltando...");
      continue;
    }

    // 2. Buscar mediciones guardadas en la BD que tengan dimensiones o parciales de 0
    const mediciones = await prisma.medicionPartida.findMany({
      where: { presupuestoId: presupuesto.id },
      include: {
        partida: true
      }
    });

    console.log(`  Mediciones encontradas en la base de datos: ${mediciones.length}`);

    const medicionesAEliminar: string[] = [];
    for (const m of mediciones) {
      const unit = (m.partida?.unidad || "").toLowerCase();
      const isDimensioned = ["m³", "m²", "ml", "m3", "m2"].includes(unit);
      
      // Si la unidad es dimensionada y todas sus dimensiones son 0, o si su costo/parcial es 0
      const isEmptyMedicion = 
        (isDimensioned && m.largo === 0 && m.ancho === 0 && m.alto === 0) || 
        m.parcial === 0 || 
        m.costoTotal === 0;

      if (isEmptyMedicion) {
        console.log(`  -> [ELIMINAR MEDICIÓN] ID: ${m.id} | Partida: ${m.partida?.codigo} - ${m.partida?.descripcion.slice(0, 30)}... | Parcial: ${m.parcial} | Total: ${m.costoTotal}`);
        medicionesAEliminar.push(m.id);
      }
    }

    if (medicionesAEliminar.length > 0) {
      const delMedsResult = await prisma.medicionPartida.deleteMany({
        where: { id: { in: medicionesAEliminar } }
      });
      console.log(`  ¡Se eliminaron ${delMedsResult.count} mediciones vacías de la base de datos!`);
    } else {
      console.log("  No se encontraron mediciones vacías en la base de datos.");
    }

    // 3. Buscar partidas que no tengan ninguna medición asociada y eliminarlas
    // Esto limpia las filas virtuales que no se usaron de las calculadoras o del banco de precios
    const capitulos = await prisma.capituloPresupuesto.findMany({
      where: { proyectoId: p.id },
      include: {
        partidas: {
          include: {
            mediciones: true
          }
        }
      }
    });

    const partidasAEliminar: string[] = [];
    for (const cap of capitulos) {
      for (const part of cap.partidas) {
        // Después de borrar las mediciones vacías, si no queda ninguna medición
        const medicionesRestantes = part.mediciones.filter(m => !medicionesAEliminar.includes(m.id));
        if (medicionesRestantes.length === 0) {
          console.log(`  -> [ELIMINAR PARTIDA SIN USAR] Capítulo ${cap.codigo} | Partida ${part.codigo} - ${part.descripcion.slice(0, 30)}... (Sin mediciones en la BD)`);
          partidasAEliminar.push(part.id);
        }
      }
    }

    if (partidasAEliminar.length > 0) {
      const delPartsResult = await prisma.partidaPresupuesto.deleteMany({
        where: { id: { in: partidasAEliminar } }
      });
      console.log(`  ¡Se eliminaron ${delPartsResult.count} partidas sin usar de la base de datos!`);
    } else {
      console.log("  No se encontraron partidas sin usar.");
    }

    // 4. Recalcular el presupuesto detallado
    const result = await prisma.medicionPartida.aggregate({
      where: { presupuestoId: presupuesto.id },
      _sum: { costoTotal: true },
    });

    const subtotalMaterial = result._sum.costoTotal || 0;

    const totales = calcularCascadaFinanciera(
      subtotalMaterial,
      presupuesto.porcentajeBI,
      presupuesto.porcentajeIVA
    );

    await prisma.presupuestoDetallado.update({
      where: { id: presupuesto.id },
      data: {
        subtotalMaterial: totales.costoDirecto,
        beneficioIndustrial: totales.beneficioIndustrial,
        baseImponible: totales.baseImponible,
        montoIVA: totales.iva,
        totalPresupuesto: totales.totalGeneral,
      },
    });

    console.log(`  Presupuesto recalculado con éxito para ${p.nombre}:`);
    console.log(`    Costo Directo (Subtotal): Bs. ${totales.costoDirecto}`);
    console.log(`    Beneficio Industrial:     Bs. ${totales.beneficioIndustrial}`);
    console.log(`    Base Imponible:           Bs. ${totales.baseImponible}`);
    console.log(`    IVA:                      Bs. ${totales.iva}`);
    console.log(`    Total General:            Bs. ${totales.totalGeneral}`);
    console.log("--------------------------------------------------");
  }

  console.log("=== PROCESO DE LIMPIEZA FINALIZADO CON ÉXITO ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
