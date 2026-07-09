import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Iniciando migración de datos para Espacios de Trabajo...')

  // Guard de idempotencia: si no hay usuarios sin espacio de trabajo, no hay nada que migrar.
  const usersWithoutWorkspace = await prisma.user.count({
    where: { memberships: { none: {} } },
  })
  if (usersWithoutWorkspace === 0) {
    console.log('✅ Todos los usuarios ya tienen espacio de trabajo. Migración omitida.')
    return
  }

  // 1. Obtener todos los usuarios con sus proyectos y memberships
  const users = await prisma.user.findMany({
    include: {
      proyectos: true,
      memberships: true,
    },
  })

  console.log(`👤 Se encontraron ${users.length} usuarios en el sistema.`)

  let workspacesCreated = 0
  let projectsUpdated = 0

  for (const user of users) {
    // Si el usuario ya tiene memberships (un espacio de trabajo), saltar
    if (user.memberships.length > 0) {
      console.log(`ℹ️ El usuario ${user.email} ya tiene espacios de trabajo asignados. Saltando...`)
      continue
    }

    console.log(`⏳ Creando espacio de trabajo por defecto para ${user.email}...`)

    // 2. Crear un espacio de trabajo personal para el usuario
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Mi Espacio de Trabajo',
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN',
          },
        },
      },
    })

    workspacesCreated++

    // 3. Vincular todos los proyectos de este usuario a este nuevo espacio de trabajo
    if (user.proyectos.length > 0) {
      console.log(`   🔗 Vinculando ${user.proyectos.length} proyectos al nuevo espacio de trabajo...`)
      
      const updateResult = await prisma.proyecto.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          workspaceId: workspace.id,
        },
      })
      
      projectsUpdated += updateResult.count
    }
  }

  console.log('✅ Migración completada con éxito!')
  console.log(`   - Espacios de trabajo creados: ${workspacesCreated}`)
  console.log(`   - Proyectos actualizados: ${projectsUpdated}`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante la migración:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
