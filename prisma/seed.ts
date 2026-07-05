import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // ============================================
  // USUARIOS DEMO
  // ============================================
  console.log('👤 Creando usuarios demo...')
  const demoPassword = await bcrypt.hash('demo123', 12)
  const adminPassword = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'demo@calculo.com' },
    update: {
      password: demoPassword,
    },
    create: {
      name: 'Usuario Demo',
      email: 'demo@calculo.com',
      password: demoPassword,
      role: 'USER',
      plan: 'FREE',
    },
  })

  await prisma.user.upsert({
    where: { email: 'soyadmin@calculo.com' },
    update: {
      password: adminPassword,
    },
    create: {
      name: 'Administrador',
      email: 'soyadmin@calculo.com',
      password: adminPassword,
      role: 'ADMIN',
      plan: 'PRO',
    },
  })

  console.log('   → demo@calculo.com / demo123 (FREE)')
  console.log('   → soyadmin@calculo.com / admin123 (PRO)')

  // ============================================
  // DOSIFICACIONES DE CONCRETO (mat1 - 12 tipos)
  // ============================================
  console.log('📦 Insertando dosificaciones de concreto...')
  const dosificacionesConcreto = [
    { ratio: '1:2:2', resistencia: 280, cementoKg: 420, arenaM3: 0.67, gravaM3: 0.67, aguaLt: 190 },
    { ratio: '1:2:2.5', resistencia: 240, cementoKg: 380, arenaM3: 0.60, gravaM3: 0.76, aguaLt: 180 },
    { ratio: '1:2:3', resistencia: 226, cementoKg: 350, arenaM3: 0.55, gravaM3: 0.84, aguaLt: 170 },
    { ratio: '1:2:3.5', resistencia: 210, cementoKg: 320, arenaM3: 0.52, gravaM3: 0.90, aguaLt: 170 },
    { ratio: '1:2:4', resistencia: 200, cementoKg: 300, arenaM3: 0.48, gravaM3: 0.95, aguaLt: 158 },
    { ratio: '1:2.5:4', resistencia: 189, cementoKg: 280, arenaM3: 0.55, gravaM3: 0.89, aguaLt: 158 },
    { ratio: '1:3:3', resistencia: 168, cementoKg: 300, arenaM3: 0.72, gravaM3: 0.72, aguaLt: 158 },
    { ratio: '1:3:4', resistencia: 159, cementoKg: 260, arenaM3: 0.63, gravaM3: 0.83, aguaLt: 163 },
    { ratio: '1:3:5', resistencia: 140, cementoKg: 230, arenaM3: 0.55, gravaM3: 0.92, aguaLt: 148 },
    { ratio: '1:3:6', resistencia: 119, cementoKg: 210, arenaM3: 0.50, gravaM3: 1.00, aguaLt: 143 },
    { ratio: '1:4:7', resistencia: 109, cementoKg: 175, arenaM3: 0.55, gravaM3: 0.98, aguaLt: 133 },
    { ratio: '1:4:8', resistencia: 99, cementoKg: 160, arenaM3: 0.55, gravaM3: 1.03, aguaLt: 125 },
  ]

  for (const d of dosificacionesConcreto) {
    await prisma.dosificacionConcreto.upsert({
      where: { ratio: d.ratio },
      update: d,
      create: d,
    })
  }

  // ============================================
  // DOSIFICACIONES DE MORTERO (mat2 - 5 tipos)
  // ============================================
  console.log('📦 Insertando dosificaciones de mortero...')
  const dosificacionesMortero = [
    { ratio: '1:2', cementoKg: 610, arenaM3: 0.97, aguaLt: 250 },
    { ratio: '1:3', cementoKg: 600, arenaM3: 1.10, aguaLt: 250 },
    { ratio: '1:4', cementoKg: 364, arenaM3: 1.16, aguaLt: 240 },
    { ratio: '1:5', cementoKg: 302, arenaM3: 1.20, aguaLt: 240 },
    { ratio: '1:6', cementoKg: 261, arenaM3: 1.20, aguaLt: 235 },
  ]

  for (const d of dosificacionesMortero) {
    await prisma.dosificacionMortero.upsert({
      where: { ratio: d.ratio },
      update: d,
      create: d,
    })
  }

  // ============================================
  // TIPOS DE BLOQUE (mat7 - 10+ tipos)
  // ============================================
  console.log('📦 Insertando tipos de bloque...')
  const tiposBloque = [
    { nombre: 'B-10x20x40', unidadesM2: 12.5, morteroM3M2: 0.00775, descripcion: 'Bloque 10x20x40 cm' },
    { nombre: 'B-12x20x40', unidadesM2: 12.5, morteroM3M2: 0.009025, descripcion: 'Bloque 12x20x40 cm' },
    { nombre: 'B-15x20x40', unidadesM2: 12.5, morteroM3M2: 0.0115, descripcion: 'Bloque 15x20x40 cm' },
    { nombre: 'B-20x20x40', unidadesM2: 12.5, morteroM3M2: 0.01525, descripcion: 'Bloque 20x20x40 cm' },
    { nombre: 'B-10x20x40 (hueco)', unidadesM2: 12.5, morteroM3M2: 0.00775, descripcion: 'Bloque 10x20x40 cm hueco' },
    { nombre: 'Ladrillo 6 huecos', unidadesM2: 55, morteroM3M2: 0.025, descripcion: 'Ladrillo de 6 huecos' },
    { nombre: 'Ladrillo 8 huecos', unidadesM2: 50, morteroM3M2: 0.028, descripcion: 'Ladrillo de 8 huecos' },
    { nombre: 'Ladrillo 10 huecos', unidadesM2: 45, morteroM3M2: 0.030, descripcion: 'Ladrillo de 10 huecos' },
    { nombre: 'Bloque seco 10x20x40', unidadesM2: 12.5, morteroM3M2: 0.008, descripcion: 'Bloque seco 10x20x40 cm' },
    { nombre: 'Bloque seco 15x20x40', unidadesM2: 12.5, morteroM3M2: 0.012, descripcion: 'Bloque seco 15x20x40 cm' },
  ]

  for (const b of tiposBloque) {
    await prisma.tipoBloque.upsert({
      where: { nombre: b.nombre },
      update: b,
      create: b,
    })
  }

  // ============================================
  // DIÁMETROS DE ACERO (mat8 - 20+ diámetros)
  // ============================================
  console.log('📦 Insertando diámetros de acero...')
  const diametrosAcero = [
    { diametro: '1/8', metrosVarilla: 6, kgM: 0.33, descripcion: 'Varilla 1/8"' },
    { diametro: '1/4', metrosVarilla: 6, kgM: 0.35, descripcion: 'Varilla 1/4"' },
    { diametro: '3/8', metrosVarilla: 6, kgM: 0.557, descripcion: 'Varilla 3/8"' },
    { diametro: '1/2', metrosVarilla: 6, kgM: 0.996, descripcion: 'Varilla 1/2"' },
    { diametro: '5/8', metrosVarilla: 6, kgM: 1.56, descripcion: 'Varilla 5/8"' },
    { diametro: '3/4', metrosVarilla: 6, kgM: 2.25, descripcion: 'Varilla 3/4"' },
    { diametro: '1', metrosVarilla: 6, kgM: 3.975, descripcion: 'Varilla 1"' },
    { diametro: '1 1/8', metrosVarilla: 6, kgM: 5.0, descripcion: 'Varilla 1 1/8"' },
    { diametro: '1 1/4', metrosVarilla: 6, kgM: 6.17, descripcion: 'Varilla 1 1/4"' },
    { diametro: '1 3/8', metrosVarilla: 6, kgM: 7.45, descripcion: 'Varilla 1 3/8"' },
    { diametro: '1 1/2', metrosVarilla: 6, kgM: 8.938, descripcion: 'Varilla 1 1/2"' },
    { diametro: '1 3/4', metrosVarilla: 6, kgM: 12.0, descripcion: 'Varilla 1 3/4"' },
    { diametro: '2', metrosVarilla: 6, kgM: 10.658, descripcion: 'Varilla 2"' },
    { diametro: 'N3', metrosVarilla: 6, kgM: 0.560, descripcion: 'N3 (3/8")' },
    { diametro: 'N4', metrosVarilla: 6, kgM: 0.996, descripcion: 'N4 (1/2")' },
    { diametro: 'N5', metrosVarilla: 6, kgM: 1.56, descripcion: 'N5 (5/8")' },
    { diametro: 'N6', metrosVarilla: 6, kgM: 2.25, descripcion: 'N6 (3/4")' },
    { diametro: 'N8', metrosVarilla: 6, kgM: 3.98, descripcion: 'N8 (1")' },
    { diametro: 'N10', metrosVarilla: 6, kgM: 6.17, descripcion: 'N10 (1 1/4")' },
    { diametro: 'N12', metrosVarilla: 6, kgM: 8.94, descripcion: 'N12 (1 1/2")' },
  ]

  for (const a of diametrosAcero) {
    await prisma.diametroAcero.upsert({
      where: { diametro: a.diametro },
      update: a,
      create: a,
    })
  }

  // ============================================
  // TIPOS DE CERÁMICA Y PORCELANATO (mat13 - 6+ tipos)
  // ============================================
  console.log('📦 Insertando tipos de cerámica...')
  const tiposCeramica = [
    { nombre: 'Cerámica 25x25', anchoCm: 25, largoCm: 25, areaM2: 0.0625, unidadesCaja: 16, tipo: 'CERAMICA', precioCaja: 45.00 },
    { nombre: 'Cerámica 40x40', anchoCm: 40, largoCm: 40, areaM2: 0.16, unidadesCaja: 10, tipo: 'CERAMICA', precioCaja: 65.00 },
    { nombre: 'Cerámica 50x50', anchoCm: 50, largoCm: 50, areaM2: 0.25, unidadesCaja: 6, tipo: 'CERAMICA', precioCaja: 85.00 },
    { nombre: 'Porcelanato 40x40', anchoCm: 40, largoCm: 40, areaM2: 0.16, unidadesCaja: 10, tipo: 'PORCELANATO', precioCaja: 95.00 },
    { nombre: 'Porcelanato 60x60', anchoCm: 60, largoCm: 60, areaM2: 0.36, unidadesCaja: 4, tipo: 'PORCELANATO', precioCaja: 120.00 },
    { nombre: 'Porcelanato 80x80', anchoCm: 80, largoCm: 80, areaM2: 0.64, unidadesCaja: 2, tipo: 'PORCELANATO', precioCaja: 180.00 },
  ]

  for (const c of tiposCeramica) {
    await prisma.tipoCeramica.upsert({
      where: { nombre: c.nombre },
      update: c,
      create: c,
    })
  }

  // ============================================
  // TIPOS DE TEJA (mat12 - 5+ tipos)
  // ============================================
  console.log('📦 Insertando tipos de teja...')
  const tiposTeja = [
    { nombre: 'Teja 1', unidadesM2: 9, precio: 3.00, descripcion: 'Teja tipo 1 tradicional' },
    { nombre: 'Teja 2', unidadesM2: 8, precio: 3.50, descripcion: 'Teja tipo 2' },
    { nombre: 'Teja 3', unidadesM2: 7, precio: 4.00, descripcion: 'Teja tipo 3' },
    { nombre: 'Teja Colonial', unidadesM2: 10, precio: 2.80, descripcion: 'Teja colonial' },
    { nombre: 'Teja Española', unidadesM2: 8, precio: 4.50, descripcion: 'Teja española' },
    { nombre: 'Teja Francesa', unidadesM2: 7, precio: 5.00, descripcion: 'Teja francesa' },
  ]

  for (const t of tiposTeja) {
    await prisma.tipoTeja.upsert({
      where: { nombre: t.nombre },
      update: t,
      create: t,
    })
  }

  // ============================================
  // DESPERDICIOS (tabla de factores)
  // ============================================
  console.log('📦 Insertando tabla de desperdicios...')
  const desperdicios = [
    { porcentaje: 1, factor: 1.01 },
    { porcentaje: 2, factor: 1.02 },
    { porcentaje: 3, factor: 1.03 },
    { porcentaje: 4, factor: 1.04 },
    { porcentaje: 5, factor: 1.05 },
    { porcentaje: 6, factor: 1.06 },
    { porcentaje: 7, factor: 1.07 },
    { porcentaje: 8, factor: 1.08 },
    { porcentaje: 9, factor: 1.09 },
    { porcentaje: 10, factor: 1.10 },
    { porcentaje: 11, factor: 1.11 },
    { porcentaje: 12, factor: 1.12 },
    { porcentaje: 13, factor: 1.13 },
    { porcentaje: 14, factor: 1.14 },
    { porcentaje: 15, factor: 1.15 },
  ]

  for (const d of desperdicios) {
    await prisma.desperdicio.upsert({
      where: { porcentaje: d.porcentaje },
      update: d,
      create: d,
    })
  }

  // ============================================
  // AFINADOS (mat3 - 4 tipos)
  // ============================================
  console.log('📦 Insertando tipos de afinado...')
  const afinados = [
    { tipo: 'GROSOR', espesorMm: 19, rendimiento: 1.5, aguaPorBolsa: 18 },
    { tipo: 'SEMIGROSOR', espesorMm: 7, rendimiento: 2.5, aguaPorBolsa: 16 },
    { tipo: 'FINO', espesorMm: 5, rendimiento: 3.5, aguaPorBolsa: 15 },
    { tipo: 'EXTRAFINO', espesorMm: 2, rendimiento: 7.0, aguaPorBolsa: 12 },
  ]

  for (const a of afinados) {
    await prisma.afinado.upsert({
      where: { tipo: a.tipo },
      update: a,
      create: a,
    })
  }

  // ============================================
  // PERFILES DRYWALL (mat10)
  // ============================================
  console.log('📦 Insertando perfiles drywall...')
  await prisma.perfilDrywall.deleteMany()
  await prisma.perfilDrywall.createMany({
    data: [
      { tipo: 'PARANTE', nombre: 'Parante 2.44m', largoM: 2.44, precio: 12.50 },
      { tipo: 'PARANTE', nombre: 'Parante 2.60m', largoM: 2.60, precio: 13.50 },
      { tipo: 'PARANTE', nombre: 'Parante 3.00m', largoM: 3.00, precio: 15.50 },
      { tipo: 'CANAL', nombre: 'Canal 2.44m', largoM: 2.44, precio: 8.50 },
      { tipo: 'CANAL', nombre: 'Canal 3.00m', largoM: 3.00, precio: 10.50 },
      { tipo: 'OMEGA', nombre: 'Omega 3.00m', largoM: 3.00, precio: 11.00 },
      { tipo: 'VIGUETA', nombre: 'Vigueta 3.00m', largoM: 3.00, precio: 14.00 },
      { tipo: 'VIGUETA', nombre: 'Vigueta 4.00m', largoM: 4.00, precio: 18.50 },
      { tipo: 'ANGULO', nombre: 'Ángulo perimetral 3.00m', largoM: 3.00, precio: 9.50 },
      { tipo: 'TORNILLO', nombre: 'Tornillo PH 1" (caja 1000u)', largoM: 0, precio: 25.00 },
    ],
  })

  // ============================================
  // PANELES YESO (mat11)
  // ============================================
  console.log('📦 Insertando paneles de yeso...')
  await prisma.panelYeso.deleteMany()
  await prisma.panelYeso.createMany({
    data: [
      { anchoM: 1.22, largoM: 2.44, areaM2: 2.9768, precio: 45.00 },
      { anchoM: 1.23, largoM: 2.45, areaM2: 3.0135, precio: 46.00 },
    ],
  })

  // ============================================
  // LÁMINAS DE TECHO (mat12)
  // ============================================
  console.log('📦 Insertando láminas de techo...')
  await prisma.laminasTecho.deleteMany()
  await prisma.laminasTecho.createMany({
    data: [
      { tipo: 'ZINCALUM', anchoM: 1.00, largoM: 2.44, traslape: 0.15, precio: 45.00 },
      { tipo: 'ZINCALUM', anchoM: 1.00, largoM: 3.05, traslape: 0.15, precio: 56.00 },
      { tipo: 'GALVANIZADO', anchoM: 1.00, largoM: 2.44, traslape: 0.15, precio: 38.00 },
      { tipo: 'GALVANIZADO', anchoM: 1.00, largoM: 3.05, traslape: 0.15, precio: 47.00 },
    ],
  })

  // ============================================
  // MANO DE OBRA (16 oficios)
  // ============================================
  console.log('📦 Insertando mano de obra...')
  const manoObra = [
    { oficio: 'Albañil', precioHora: 18.75, jornalLP: 150, jornalOR: 150 },
    { oficio: 'Armador', precioHora: 22.50, jornalLP: 180, jornalOR: 140 },
    { oficio: 'Carpintero', precioHora: 22.50, jornalLP: 180, jornalOR: 180 },
    { oficio: 'Electricista', precioHora: 22.50, jornalLP: 180, jornalOR: null },
    { oficio: 'Encofrador', precioHora: 22.50, jornalLP: 180, jornalOR: null },
    { oficio: 'Maestro Albañil', precioHora: 22.50, jornalLP: 180, jornalOR: null },
    { oficio: 'Peón', precioHora: 13.75, jornalLP: 110, jornalOR: null },
    { oficio: 'Pintor', precioHora: 18.75, jornalLP: 150, jornalOR: null },
    { oficio: 'Plomero', precioHora: 18.75, jornalLP: 150, jornalOR: null },
    { oficio: 'Soldador', precioHora: 25.00, jornalLP: 200, jornalOR: null },
    { oficio: 'Cerrajero', precioHora: 22.50, jornalLP: 180, jornalOR: null },
    { oficio: 'Tecnólogo', precioHora: 30.00, jornalLP: 240, jornalOR: null },
    { oficio: 'Topógrafo', precioHora: 25.00, jornalLP: 200, jornalOR: null },
    { oficio: 'Operario Mezcladora', precioHora: 15.00, jornalLP: 120, jornalOR: null },
    { oficio: 'Operario Vibradora', precioHora: 16.00, jornalLP: 128, jornalOR: null },
    { oficio: 'Ayudante General', precioHora: 12.50, jornalLP: 100, jornalOR: null },
  ]

  for (const m of manoObra) {
    await prisma.manoObra.upsert({
      where: { oficio: m.oficio },
      update: m,
      create: m,
    })
  }

  // ============================================
  // EQUIPO Y MAQUINARIA (4 tipos)
  // ============================================
  console.log('📦 Insertando equipo y maquinaria...')
  const equipoMaquinaria = [
    { nombre: 'Equipo Topográfico', precioHora: 200.00 },
    { nombre: 'Retroexcavadora', precioHora: 150.00 },
    { nombre: 'Mezcladora', precioHora: 20.00 },
    { nombre: 'Vibradora', precioHora: 18.00 },
  ]

  for (const e of equipoMaquinaria) {
    await prisma.equipoMaquinaria.upsert({
      where: { nombre: e.nombre },
      update: e,
      create: e,
    })
  }

  // ============================================
  // MATERIALES BASE (mat6 - 50+ materiales con precios)
  // ============================================
  console.log('📦 Insertando materiales base...')
  const materiales = [
    // Cementos
    { codigo: 'CEM-001', nombre: 'Cemento Portland IP-40 (bolsa 42.5 kg)', unidad: 'bolsa', precio: 8.60, grupo: 'CEMENTO', proveedor: 'Fancesa/Soboce' },
    { codigo: 'CEM-002', nombre: 'Cemento Portland IP-30 (bolsa 42.5 kg)', unidad: 'bolsa', precio: 8.20, grupo: 'CEMENTO', proveedor: 'Fancesa/Soboce' },
    { codigo: 'CEM-003', nombre: 'Cemento Blanca (bolsa 42.5 kg)', unidad: 'bolsa', precio: 15.00, grupo: 'CEMENTO', proveedor: 'Importado' },

    // Agregados
    { codigo: 'AGR-001', nombre: 'Arena Media (m3)', unidad: 'm3', precio: 28.33, grupo: 'AGREGADOS', proveedor: 'Cantera Local' },
    { codigo: 'AGR-002', nombre: 'Arena Fina (m3)', unidad: 'm3', precio: 30.00, grupo: 'AGREGADOS', proveedor: 'Cantera Local' },
    { codigo: 'AGR-003', nombre: 'Grava 3/4" (m3)', unidad: 'm3', precio: 36.66, grupo: 'AGREGADOS', proveedor: 'Cantera Local' },
    { codigo: 'AGR-004', nombre: 'Grava 1/2" (m3)', unidad: 'm3', precio: 35.00, grupo: 'AGREGADOS', proveedor: 'Cantera Local' },
    { codigo: 'AGR-005', nombre: 'Piedra Bola/Rio (m3)', unidad: 'm3', precio: 25.00, grupo: 'AGREGADOS', proveedor: 'Cantera Local' },
    { codigo: 'AGR-006', nombre: 'Piedra Chancada (m3)', unidad: 'm3', precio: 30.00, grupo: 'AGREGADOS', proveedor: 'Cantera Local' },

    // Agua
    { codigo: 'AGU-001', nombre: 'Agua (litro)', unidad: 'lt', precio: 0.003, grupo: 'AGUA', proveedor: 'EPSAS' },

    // Acero
    { codigo: 'ACE-001', nombre: 'Fierro corrugado 1/8" (kg)', unidad: 'kg', precio: 2.51, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-002', nombre: 'Fierro corrugado 1/4" (kg)', unidad: 'kg', precio: 3.20, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-003', nombre: 'Fierro corrugado 3/8" (kg)', unidad: 'kg', precio: 3.85, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-004', nombre: 'Fierro corrugado 1/2" (kg)', unidad: 'kg', precio: 4.10, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-005', nombre: 'Fierro corrugado 5/8" (kg)', unidad: 'kg', precio: 4.05, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-006', nombre: 'Fierro corrugado 3/4" (kg)', unidad: 'kg', precio: 4.00, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-007', nombre: 'Fierro corrugado 1" (kg)', unidad: 'kg', precio: 3.95, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-008', nombre: 'Alambre de amarre #16 (kg)', unidad: 'kg', precio: 5.50, grupo: 'ACERO', proveedor: 'Coboce' },
    { codigo: 'ACE-009', nombre: 'Malla electrosoldada 6x6 (pza)', unidad: 'pza', precio: 35.00, grupo: 'ACERO', proveedor: 'Coboce' },

    // Bloques y Ladrillos
    { codigo: 'BLO-001', nombre: 'Bloque 10x20x40 (unidad)', unidad: 'pza', precio: 2.80, grupo: 'BLOQUE', proveedor: 'Bloquera Local' },
    { codigo: 'BLO-002', nombre: 'Bloque 12x20x40 (unidad)', unidad: 'pza', precio: 3.20, grupo: 'BLOQUE', proveedor: 'Bloquera Local' },
    { codigo: 'BLO-003', nombre: 'Bloque 15x20x40 (unidad)', unidad: 'pza', precio: 3.80, grupo: 'BLOQUE', proveedor: 'Bloquera Local' },
    { codigo: 'BLO-004', nombre: 'Bloque 20x20x40 (unidad)', unidad: 'pza', precio: 4.50, grupo: 'BLOQUE', proveedor: 'Bloquera Local' },
    { codigo: 'LAD-001', nombre: 'Ladrillo 6 huecos (unidad)', unidad: 'pza', precio: 0.60, grupo: 'LADRILLO', proveedor: 'Ladrillera Local' },
    { codigo: 'LAD-002', nombre: 'Ladrillo 8 huecos (unidad)', unidad: 'pza', precio: 0.70, grupo: 'LADRILLO', proveedor: 'Ladrillera Local' },

    // Tejas
    { codigo: 'TEJ-001', nombre: 'Teja 1 (unidad)', unidad: 'pza', precio: 3.00, grupo: 'TEJA', proveedor: 'Tejera Local' },
    { codigo: 'TEJ-002', nombre: 'Teja 2 (unidad)', unidad: 'pza', precio: 3.50, grupo: 'TEJA', proveedor: 'Tejera Local' },
    { codigo: 'TEJ-003', nombre: 'Teja Colonial (unidad)', unidad: 'pza', precio: 2.80, grupo: 'TEJA', proveedor: 'Tejera Local' },

    // Láminas
    { codigo: 'LAM-001', nombre: 'ZincAlum 0.35mm 1.00x2.44m', unidad: 'pza', precio: 45.00, grupo: 'LAMINA', proveedor: 'Ternium' },
    { codigo: 'LAM-002', nombre: 'ZincAlum 0.35mm 1.00x3.05m', unidad: 'pza', precio: 56.00, grupo: 'LAMINA', proveedor: 'Ternium' },
    { codigo: 'LAM-003', nombre: 'Galvanizado 0.30mm 1.00x2.44m', unidad: 'pza', precio: 38.00, grupo: 'LAMINA', proveedor: 'Ternium' },

    // Drywall
    { codigo: 'DRY-001', nombre: 'Parante 2.44m', unidad: 'pza', precio: 12.50, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-002', nombre: 'Canal 2.44m', unidad: 'pza', precio: 8.50, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-003', nombre: 'Omega 3.00m', unidad: 'pza', precio: 11.00, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-004', nombre: 'Vigueta 3.00m', unidad: 'pza', precio: 14.00, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-005', nombre: 'Ángulo perimetral 3.00m', unidad: 'pza', precio: 9.50, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-006', nombre: 'Panel Yeso 1.22x2.44m', unidad: 'pza', precio: 45.00, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-007', nombre: 'Tornillo PH 1" (caja)', unidad: 'caja', precio: 25.00, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-008', nombre: 'Cinta papel (rollo)', unidad: 'rollo', precio: 12.00, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },
    { codigo: 'DRY-009', nombre: 'Masilla (balde 20kg)', unidad: 'balde', precio: 45.00, grupo: 'DRYWALL', proveedor: 'Eternit/Volcán' },

    // Cerámicas y Porcelanatos
    { codigo: 'CER-001', nombre: 'Cerámica 25x25 (caja 16 pzas)', unidad: 'caja', precio: 45.00, grupo: 'CERAMICA', proveedor: 'Cerámica Bolivia' },
    { codigo: 'CER-002', nombre: 'Cerámica 40x40 (caja 10 pzas)', unidad: 'caja', precio: 65.00, grupo: 'CERAMICA', proveedor: 'Cerámica Bolivia' },
    { codigo: 'CER-003', nombre: 'Cerámica 50x50 (caja 6 pzas)', unidad: 'caja', precio: 85.00, grupo: 'CERAMICA', proveedor: 'Cerámica Bolivia' },
    { codigo: 'POR-001', nombre: 'Porcelanato 40x40 (caja 10 pzas)', unidad: 'caja', precio: 95.00, grupo: 'PORCELANATO', proveedor: 'Cerámica Bolivia' },
    { codigo: 'POR-002', nombre: 'Porcelanato 60x60 (caja 4 pzas)', unidad: 'caja', precio: 120.00, grupo: 'PORCELANATO', proveedor: 'Cerámica Bolivia' },

    // Adhesivos y Boquillas
    { codigo: 'ADH-001', nombre: 'Adhesivo cerámico (bolsa 20kg)', unidad: 'bolsa', precio: 22.00, grupo: 'ADHESIVO', proveedor: 'Weber/Sika' },
    { codigo: 'ADH-002', nombre: 'Adhesivo porcelanato (bolsa 20kg)', unidad: 'bolsa', precio: 35.00, grupo: 'ADHESIVO', proveedor: 'Weber/Sika' },
    { codigo: 'BOQ-001', nombre: 'Boquilla blanca (bolsa 5kg)', unidad: 'bolsa', precio: 15.00, grupo: 'BOQUILLA', proveedor: 'Weber/Sika' },
    { codigo: 'BOQ-002', nombre: 'Boquilla color (bolsa 5kg)', unidad: 'bolsa', precio: 18.00, grupo: 'BOQUILLA', proveedor: 'Weber/Sika' },

    // Bovedillas
    { codigo: 'BOV-001', nombre: 'Bovedilla cerámica 30cm', unidad: 'pza', precio: 2.50, grupo: 'BOVEDILLA', proveedor: 'Local' },
    { codigo: 'BOV-002', nombre: 'Bovedilla cerámica 40cm', unidad: 'pza', precio: 3.20, grupo: 'BOVEDILLA', proveedor: 'Local' },

    // Madera
    { codigo: 'MAD-001', nombre: 'Madera pino 1x4 (ml)', unidad: 'ml', precio: 8.00, grupo: 'MADERA', proveedor: 'Maderera' },
    { codigo: 'MAD-002', nombre: 'Madera pino 2x4 (ml)', unidad: 'ml', precio: 15.00, grupo: 'MADERA', proveedor: 'Maderera' },
    { codigo: 'MAD-003', nombre: 'Tablero triplay 12mm (m2)', unidad: 'm2', precio: 45.00, grupo: 'MADERA', proveedor: 'Maderera' },

    // Pintura
    { codigo: 'PIN-001', nombre: 'Pintura látex blanca (galón)', unidad: 'gal', precio: 45.00, grupo: 'PINTURA', proveedor: 'Pinturas Andina' },
    { codigo: 'PIN-002', nombre: 'Pintura esmalte (galón)', unidad: 'gal', precio: 65.00, grupo: 'PINTURA', proveedor: 'Pinturas Andina' },
  ]

  for (const m of materiales) {
    await prisma.material.upsert({
      where: { codigo: m.codigo },
      update: m,
      create: m,
    })
  }

  // ============================================
  // BANCO DE PRECIOS GMLP
  // Nota: Ejecutar `npx tsx prisma/seed-gmlp.ts` para importar los 946 ítems completos
  // ============================================
  console.log('📦 Banco de precios GMLP: ejecutar seed-gmlp.ts por separado')

  console.log('✅ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })