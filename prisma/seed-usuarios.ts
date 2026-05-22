import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando creación de usuarios para todos los roles...')

  const contrasenaSecretaria = await bcrypt.hash('Secretaria2024!', 12)
  const contrasenaDirector = await bcrypt.hash('Director2024!', 12)
  const contrasenaDocente = await bcrypt.hash('Docente2024!', 12)
  const contrasenaCoordinador = await bcrypt.hash('Coordinador2024!', 12)

  // 1. Crear usuario Secretaria
  const secretaria = await prisma.usuario.upsert({
    where: { correo: 'secretaria@unitru.edu.pe' },
    update: {
      rol: 'SECRETARIA',
      activo: true,
    },
    create: {
      correo: 'secretaria@unitru.edu.pe',
      contrasena: contrasenaSecretaria,
      nombre: 'María',
      apellidos: 'López (Secretaria)',
      rol: 'SECRETARIA',
      activo: true,
    },
  })
  console.log('Usuario SECRETARIA creado/actualizado:', secretaria.correo)

  // 2. Crear usuario Director
  const director = await prisma.usuario.upsert({
    where: { correo: 'director@unitru.edu.pe' },
    update: {
      rol: 'DIRECTOR',
      activo: true,
    },
    create: {
      correo: 'director@unitru.edu.pe',
      contrasena: contrasenaDirector,
      nombre: 'Humberto',
      apellidos: 'García (Director)',
      rol: 'DIRECTOR',
      activo: true,
    },
  })
  console.log('Usuario DIRECTOR creado/actualizado:', director.correo)

  // 2b. Crear usuario Coordinador
  const coordinador = await prisma.usuario.upsert({
    where: { correo: 'coordinador@unitru.edu.pe' },
    update: {
      rol: 'COORDINADOR',
      activo: true,
    },
    create: {
      correo: 'coordinador@unitru.edu.pe',
      contrasena: contrasenaCoordinador,
      nombre: 'Carlos',
      apellidos: 'Ramírez (Coordinador)',
      rol: 'COORDINADOR',
      activo: true,
    },
  })
  console.log('Usuario COORDINADOR creado/actualizado:', coordinador.correo)

  // 3. Buscar el docente con código DOC001
  const docente = await prisma.docente.findUnique({
    where: { codigo: 'DOC001' },
  })

  // 4. Crear usuario Docente vinculado
  const docenteUser = await prisma.usuario.upsert({
    where: { correo: 'docente@unitru.edu.pe' },
    update: {
      rol: 'DOCENTE',
      activo: true,
    },
    create: {
      correo: 'docente@unitru.edu.pe',
      contrasena: contrasenaDocente,
      nombre: docente ? docente.nombres : 'Everson David',
      apellidos: docente ? `${docente.apellidos} (Docente)` : 'Agreda (Docente)',
      rol: 'DOCENTE',
      activo: true,
    },
  })
  console.log('Usuario DOCENTE creado/actualizado:', docenteUser.correo)

  if (docente) {
    await prisma.docente.update({
      where: { id: docente.id },
      data: { usuario_id: docenteUser.id },
    })
    console.log(`Usuario DOCENTE vinculado con éxito al docente '${docente.apellidos}, ${docente.nombres}' (DOC001)`)
  } else {
    console.log('Advertencia: El docente semilla DOC001 no fue encontrado para vinculación.')
  }

  console.log('\n¡Usuarios creados con éxito!')
  console.log('----------------------------------------------------')
  console.log('Administrador:   admin@unitru.edu.pe      / Admin2024!')
  console.log('Secretaria:      secretaria@unitru.edu.pe / Secretaria2024!')
  console.log('Director:        director@unitru.edu.pe    / Director2024!')
  console.log('Coordinador:     coordinador@unitru.edu.pe / Coordinador2024!')
  console.log('Docente:         docente@unitru.edu.pe     / Docente2024!')
  console.log('----------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('Error al crear usuarios:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
