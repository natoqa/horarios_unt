import { PrismaClient, TipoAmbiente, CategoriaDocente, TipoDocente } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // 1. Crear usuario administrador
  const adminPassword = await bcrypt.hash('Admin2024!', 12)
  
  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin@unitru.edu.pe' },
    update: {},
    create: {
      id: 'usr_admin001',
      correo: 'admin@unitru.edu.pe',
      contrasena: adminPassword,
      nombre: 'Administrador',
      apellidos: 'Sistema',
      rol: 'ADMINISTRADOR',
    },
  })
  console.log('✅ Usuario administrador creado:', admin.correo)

  // 2. Crear ambientes
  const ambientes = [
    {
      codigo: 'A101',
      nombre: 'Aula 101 - Teoría',
      tipo: TipoAmbiente.AULA,
      capacidad: 45,
      ubicacion: 'Pabellón A - Primer Piso',
      piso: 1,
      tiene_proyector: true,
    },
    {
      codigo: 'A102',
      nombre: 'Aula 102 - Teoría',
      tipo: TipoAmbiente.AULA,
      capacidad: 45,
      ubicacion: 'Pabellón A - Primer Piso',
      piso: 1,
      tiene_proyector: true,
    },
    {
      codigo: 'A201',
      nombre: 'Aula 201 - Seminarios',
      tipo: TipoAmbiente.AULA,
      capacidad: 30,
      ubicacion: 'Pabellón A - Segundo Piso',
      piso: 2,
      tiene_proyector: true,
    },
    {
      codigo: 'A301',
      nombre: 'Aula 301 - Auditorio',
      tipo: TipoAmbiente.AULA,
      capacidad: 60,
      ubicacion: 'Pabellón A - Tercer Piso',
      piso: 3,
      tiene_proyector: true,
    },
    {
      codigo: 'LAB-SIS1',
      nombre: 'Laboratorio de Sistemas 1',
      tipo: TipoAmbiente.LABORATORIO,
      capacidad: 25,
      ubicacion: 'Pabellón de Sistemas - Primer Piso',
      piso: 1,
      tiene_computadoras: true,
      tiene_proyector: true,
    },
    {
      codigo: 'LAB-SIS2',
      nombre: 'Laboratorio de Sistemas 2',
      tipo: TipoAmbiente.LABORATORIO,
      capacidad: 25,
      ubicacion: 'Pabellón de Sistemas - Primer Piso',
      piso: 1,
      tiene_computadoras: true,
      tiene_proyector: true,
    },
    {
      codigo: 'LAB-REDES',
      nombre: 'Laboratorio de Redes',
      tipo: TipoAmbiente.LABORATORIO,
      capacidad: 20,
      ubicacion: 'Pabellón de Sistemas - Segundo Piso',
      piso: 2,
      tiene_computadoras: true,
      tiene_proyector: true,
    },
    {
      codigo: 'LAB-BD',
      nombre: 'Laboratorio de Base de Datos',
      tipo: TipoAmbiente.LABORATORIO,
      capacidad: 20,
      ubicacion: 'Pabellón de Sistemas - Segundo Piso',
      piso: 2,
      tiene_computadoras: true,
      tiene_proyector: true,
    },
  ]

  for (const ambiente of ambientes) {
    await prisma.ambiente.upsert({
      where: { codigo: ambiente.codigo },
      update: {},
      create: ambiente,
    })
  }
  console.log('✅ Ambientes creados:', ambientes.length)

  // 3. Crear cursos
  const cursos = [
    { codigo: 'IS101', nombre: 'Introducción a la Ingeniería de Sistemas', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 1 },
    { codigo: 'IS102', nombre: 'Matemática Básica', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 1 },
    { codigo: 'IS103', nombre: 'Programación I', creditos: 5, horas_teoria: 3, horas_laboratorio: 4, ciclo: 1 },
    { codigo: 'IS104', nombre: 'Redacción Técnica', creditos: 2, horas_teoria: 2, horas_laboratorio: 0, ciclo: 1 },
    { codigo: 'IS105', nombre: 'Física General', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 1 },
    { codigo: 'IS201', nombre: 'Programación II', creditos: 5, horas_teoria: 3, horas_laboratorio: 4, ciclo: 2 },
    { codigo: 'IS202', nombre: 'Base de Datos I', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 2 },
    { codigo: 'IS203', nombre: 'Estructuras Discretas', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 2 },
    { codigo: 'IS301', nombre: 'Ingeniería de Software I', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 3 },
    { codigo: 'IS302', nombre: 'Sistemas Operativos', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 3 },
    { codigo: 'IS303', nombre: 'Redes de Computadoras', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 3 },
  ]

  for (const curso of cursos) {
    await prisma.curso.upsert({
      where: { codigo: curso.codigo },
      update: {},
      create: curso,
    })
  }
  console.log('✅ Cursos creados:', cursos.length)

  // 4. Crear docentes de ejemplo
  const docentes = [
    {
      codigo: 'DOC001',
      nombres: 'Juan Carlos',
      apellidos: 'Rodríguez López',
      correo: 'jrodriguez@unitru.edu.pe',
      categoria: CategoriaDocente.PRINCIPAL,
      tipo: TipoDocente.NOMBRADO,
      antiguedad: 20,
    },
    {
      codigo: 'DOC002',
      nombres: 'María Elena',
      apellidos: 'García Mendoza',
      correo: 'mgarcia@unitru.edu.pe',
      categoria: CategoriaDocente.ASOCIADO,
      tipo: TipoDocente.NOMBRADO,
      antiguedad: 15,
    },
    {
      codigo: 'DOC003',
      nombres: 'Pedro Antonio',
      apellidos: 'Sánchez Vera',
      correo: 'psanchez@unitru.edu.pe',
      categoria: CategoriaDocente.AUXILIAR,
      tipo: TipoDocente.CONTRATADO,
      antiguedad: 5,
    },
    {
      codigo: 'DOC004',
      nombres: 'Ana Lucía',
      apellidos: 'Torres Castillo',
      correo: 'atorres@unitru.edu.pe',
      categoria: CategoriaDocente.JEFE_PRACTICA,
      tipo: TipoDocente.CONTRATADO,
      antiguedad: 3,
    },
  ]

  for (const docente of docentes) {
    const created = await prisma.docente.upsert({
      where: { codigo: docente.codigo },
      update: {},
      create: docente,
    })

    await prisma.disponibilidadDocente.deleteMany({ where: { docente_id: created.id } })
    const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
    for (const dia of dias) {
      await prisma.disponibilidadDocente.create({
        data: {
          docente_id: created.id,
          dia: dia as 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES',
          hora_inicio: '07:00',
          hora_fin: '19:00',
        },
      })
    }
  }
  console.log('✅ Docentes creados:', docentes.length)

  // 5. Asignar cursos a docentes
  const todosCursos = await prisma.curso.findMany()
  const todosDocentes = await prisma.docente.findMany()

  await prisma.cursoDocente.deleteMany({})
  for (let i = 0; i < todosCursos.length; i++) {
    const docenteIndex = i % todosDocentes.length
    await prisma.cursoDocente.create({
      data: {
        curso_id: todosCursos[i].id,
        docente_id: todosDocentes[docenteIndex].id,
        es_titular: true,
      },
    })
  }
  console.log('✅ Asignaciones curso-docente creadas')

  // 6. Configuraciones del sistema
  const configuraciones = [
    { clave: 'ciclo_actual', valor: '2024-I', descripcion: 'Ciclo académico actual' },
    { clave: 'hora_inicio_jornada', valor: '07:00', descripcion: 'Hora de inicio de la jornada académica' },
    { clave: 'hora_fin_jornada', valor: '20:00', descripcion: 'Hora de fin de la jornada académica' },
    { clave: 'duracion_bloque', valor: '60', descripcion: 'Duración de cada bloque horario en minutos' },
    { clave: 'max_horas_diarias_docente', valor: '8', descripcion: 'Máximo de horas diarias por docente' },
  ]

  for (const config of configuraciones) {
    await prisma.configuracionSistema.upsert({
      where: { clave: config.clave },
      update: {},
      create: config,
    })
  }
  console.log('✅ Configuraciones del sistema creadas')

  console.log('🎉 Seed completado exitosamente!')
  console.log('📧 Usuario admin: admin@unitru.edu.pe')
  console.log('🔑 Contraseña: Admin2024!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
  