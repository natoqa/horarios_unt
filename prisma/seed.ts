import { PrismaClient, TipoAmbiente, CategoriaDocente, TipoDocente } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de la base de datos...')

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
  console.log('Usuario administrador creado:', admin.correo)

  // 2. Crear ambientes
  const ambientes = [
    // Aulas de teoria
    { codigo: 'A101', nombre: 'Aula 101', tipo: TipoAmbiente.AULA, capacidad: 45, ubicacion: 'Pabellon A - Piso 1', piso: 1, tiene_proyector: true },
    { codigo: 'A102', nombre: 'Aula 102', tipo: TipoAmbiente.AULA, capacidad: 45, ubicacion: 'Pabellon A - Piso 1', piso: 1, tiene_proyector: true },
    { codigo: 'A103', nombre: 'Aula 103', tipo: TipoAmbiente.AULA, capacidad: 40, ubicacion: 'Pabellon A - Piso 1', piso: 1, tiene_proyector: true },
    { codigo: 'A201', nombre: 'Aula 201', tipo: TipoAmbiente.AULA, capacidad: 40, ubicacion: 'Pabellon A - Piso 2', piso: 2, tiene_proyector: true },
    { codigo: 'A202', nombre: 'Aula 202', tipo: TipoAmbiente.AULA, capacidad: 40, ubicacion: 'Pabellon A - Piso 2', piso: 2, tiene_proyector: true },
    { codigo: 'A203', nombre: 'Aula 203', tipo: TipoAmbiente.AULA, capacidad: 35, ubicacion: 'Pabellon A - Piso 2', piso: 2, tiene_proyector: true },
    { codigo: 'A301', nombre: 'Aula 301 - Auditorio', tipo: TipoAmbiente.AULA, capacidad: 60, ubicacion: 'Pabellon A - Piso 3', piso: 3, tiene_proyector: true },
    { codigo: 'A302', nombre: 'Aula 302', tipo: TipoAmbiente.AULA, capacidad: 45, ubicacion: 'Pabellon A - Piso 3', piso: 3, tiene_proyector: true },
    { codigo: 'B101', nombre: 'Aula B101', tipo: TipoAmbiente.AULA, capacidad: 50, ubicacion: 'Pabellon B - Piso 1', piso: 1, tiene_proyector: true },
    { codigo: 'B102', nombre: 'Aula B102', tipo: TipoAmbiente.AULA, capacidad: 50, ubicacion: 'Pabellon B - Piso 1', piso: 1, tiene_proyector: true },
    // Laboratorios
    { codigo: 'LAB-SIS1', nombre: 'Lab. Sistemas 1', tipo: TipoAmbiente.LABORATORIO, capacidad: 25, ubicacion: 'Pabellon Sistemas - Piso 1', piso: 1, tiene_computadoras: true, tiene_proyector: true },
    { codigo: 'LAB-SIS2', nombre: 'Lab. Sistemas 2', tipo: TipoAmbiente.LABORATORIO, capacidad: 25, ubicacion: 'Pabellon Sistemas - Piso 1', piso: 1, tiene_computadoras: true, tiene_proyector: true },
    { codigo: 'LAB-REDES', nombre: 'Lab. Redes', tipo: TipoAmbiente.LABORATORIO, capacidad: 20, ubicacion: 'Pabellon Sistemas - Piso 2', piso: 2, tiene_computadoras: true, tiene_proyector: true },
    { codigo: 'LAB-BD', nombre: 'Lab. Base de Datos', tipo: TipoAmbiente.LABORATORIO, capacidad: 20, ubicacion: 'Pabellon Sistemas - Piso 2', piso: 2, tiene_computadoras: true, tiene_proyector: true },
    { codigo: 'LAB-FIS', nombre: 'Lab. Fisica', tipo: TipoAmbiente.LABORATORIO, capacidad: 25, ubicacion: 'Pabellon Ciencias - Piso 1', piso: 1, tiene_computadoras: false, tiene_proyector: true },
    { codigo: 'LAB-EST', nombre: 'Lab. Estadistica', tipo: TipoAmbiente.LABORATORIO, capacidad: 25, ubicacion: 'Pabellon Ciencias - Piso 1', piso: 1, tiene_computadoras: true, tiene_proyector: true },
    { codigo: 'LAB-COMP', nombre: 'Lab. Computo General', tipo: TipoAmbiente.LABORATORIO, capacidad: 30, ubicacion: 'Pabellon B - Piso 2', piso: 2, tiene_computadoras: true, tiene_proyector: true },
  ]

  for (const ambiente of ambientes) {
    await prisma.ambiente.upsert({
      where: { codigo: ambiente.codigo },
      update: {},
      create: ambiente,
    })
  }
  console.log('Ambientes creados:', ambientes.length)

  // 3. Cursos — Plan de Estudios 2018, Ingenieria de Sistemas UNT
  const cursos = [
    // CICLO 1
    { codigo: 'C1-01', nombre: 'Desarrollo del Pensamiento Logico Matematico', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 1, departamento: 'Matematicas' },
    { codigo: 'C1-02', nombre: 'Desarrollo Personal', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 1, departamento: 'Ciencias Sociales' },
    { codigo: 'C1-03', nombre: 'Estadistica General', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 1, departamento: 'Estadistica' },
    { codigo: 'C1-04', nombre: 'Introduccion a la Ingenieria de Sistemas', creditos: 2, horas_teoria: 2, horas_laboratorio: 0, ciclo: 1, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C1-05', nombre: 'Introduccion a la Programacion', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 1, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C1-06', nombre: 'Introduccion al Analisis Matematico', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 1, departamento: 'Matematicas' },
    { codigo: 'C1-07', nombre: 'Lectura Critica y Redaccion de Textos Academicos', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 1, departamento: 'Ciencias Sociales' },
    { codigo: 'C1-08', nombre: 'Taller de Liderazgo y Trabajo en Equipo', creditos: 1, horas_teoria: 0, horas_laboratorio: 2, ciclo: 1, departamento: 'Ciencias Sociales' },
    { codigo: 'C1-09', nombre: 'Taller de Musica', creditos: 1, horas_teoria: 0, horas_laboratorio: 2, ciclo: 1, departamento: 'Ciencias Sociales' },
    { codigo: 'C1-10', nombre: 'Taller de Tecnicas de Comunicacion Eficaz', creditos: 1, horas_teoria: 0, horas_laboratorio: 2, ciclo: 1, departamento: 'Ciencias Sociales' },

    // CICLO 2
    { codigo: 'C2-01', nombre: 'Analisis Matematico', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 2, departamento: 'Matematicas' },
    { codigo: 'C2-02', nombre: 'Cultura Investigativa y Pensamiento Critico', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 2, departamento: 'Ciencias Sociales' },
    { codigo: 'C2-03', nombre: 'Etica, Convivencia Humana y Ciudadania', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 2, departamento: 'Ciencias Sociales' },
    { codigo: 'C2-04', nombre: 'Fisica General', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 2, departamento: 'Fisica' },
    { codigo: 'C2-05', nombre: 'Programacion Orientada a Objetos I', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 2, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C2-06', nombre: 'Sociedad, Cultura y Ecologia', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 2, departamento: 'Ciencias Sociales' },
    { codigo: 'C2-07', nombre: 'Taller de Danzas Folkloricas', creditos: 1, horas_teoria: 0, horas_laboratorio: 2, ciclo: 2, departamento: 'Ciencias Sociales' },
    { codigo: 'C2-08', nombre: 'Taller de Deporte', creditos: 1, horas_teoria: 0, horas_laboratorio: 2, ciclo: 2, departamento: 'Ciencias Sociales' },
    { codigo: 'C2-09', nombre: 'Taller de Manejo de TIC', creditos: 1, horas_teoria: 0, horas_laboratorio: 2, ciclo: 2, departamento: 'Ingenieria de Sistemas' },

    // CICLO 3
    { codigo: 'C3-01', nombre: 'Administracion General', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 3, departamento: 'Ciencias Sociales' },
    { codigo: 'C3-02', nombre: 'Estadistica Aplicada', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 3, departamento: 'Estadistica' },
    { codigo: 'C3-03', nombre: 'Fisica Electronica', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 3, departamento: 'Fisica' },
    { codigo: 'C3-04', nombre: 'Ingenieria Grafica', creditos: 3, horas_teoria: 1, horas_laboratorio: 4, ciclo: 3, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C3-05', nombre: 'Matematica Aplicada', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 3, departamento: 'Matematicas' },
    { codigo: 'C3-06', nombre: 'Programacion Orientada a Objetos II', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 3, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C3-07', nombre: 'Sicologia Organizacional', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 3, departamento: 'Ciencias Sociales' },
    { codigo: 'C3-08', nombre: 'Sistemica', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 3, departamento: 'Ingenieria de Sistemas' },

    // CICLO 4
    { codigo: 'C4-01', nombre: 'Computacion Grafica y Visual', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 4, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C4-02', nombre: 'Diseno Web', creditos: 3, horas_teoria: 1, horas_laboratorio: 4, ciclo: 4, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C4-03', nombre: 'Economia General', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 4, departamento: 'Economia' },
    { codigo: 'C4-04', nombre: 'Estructura de Datos Orientado a Objetos', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 4, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C4-05', nombre: 'Gestion de Procesos', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 4, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C4-06', nombre: 'Pensamiento de Diseno', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 4, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C4-07', nombre: 'Plataformas Tecnologicas', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 4, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C4-08', nombre: 'Sistemas Digitales', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 4, departamento: 'Ingenieria de Sistemas' },

    // CICLO 5
    { codigo: 'C5-01', nombre: 'Arquitectura y Organizacion de Computadoras', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 5, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C5-02', nombre: 'Contabilidad Gerencial', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 5, departamento: 'Contabilidad y Finanzas' },
    { codigo: 'C5-03', nombre: 'Ingenieria de Datos I', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 5, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C5-04', nombre: 'Investigacion de Operaciones', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 5, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C5-05', nombre: 'Sistemas de Informacion', creditos: 4, horas_teoria: 3, horas_laboratorio: 2, ciclo: 5, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C5-06', nombre: 'Tecnologias Web', creditos: 3, horas_teoria: 1, horas_laboratorio: 4, ciclo: 5, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C5-07', nombre: 'Teleinformatica', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 5, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C5-08', nombre: 'Transformacion Digital', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 5, departamento: 'Ingenieria de Sistemas' },

    // CICLO 6
    { codigo: 'C6-01', nombre: 'Finanzas Corporativas', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 6, departamento: 'Contabilidad y Finanzas' },
    { codigo: 'C6-02', nombre: 'Gestion del Talento Humano', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 6, departamento: 'Ciencias Sociales' },
    { codigo: 'C6-03', nombre: 'Ingenieria Ambiental', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 6, departamento: 'Ciencias Ambientales' },
    { codigo: 'C6-04', nombre: 'Ingenieria de Datos II', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 6, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C6-05', nombre: 'Ingenieria de Requerimientos', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 6, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C6-06', nombre: 'Ingenieria Economica', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 6, departamento: 'Economia' },
    { codigo: 'C6-07', nombre: 'Sistemas Inteligentes', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 6, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C6-08', nombre: 'Sistemas Operativos', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 6, departamento: 'Ingenieria de Sistemas' },

    // CICLO 7
    { codigo: 'C7-01', nombre: 'Administracion de Base de Datos', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 7, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C7-02', nombre: 'Cadena de Suministro', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 7, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C7-03', nombre: 'Gestion de Servicios de TI', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 7, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C7-04', nombre: 'Ingenieria del Software I', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 7, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C7-05', nombre: 'Metodologia de la Investigacion Cientifica', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 7, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C7-06', nombre: 'Negocios Electronicos', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 7, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C7-07', nombre: 'Planeamiento Estrategico de la Informacion', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 7, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C7-08', nombre: 'Redes y Comunicaciones I', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 7, departamento: 'Ingenieria de Sistemas' },

    // CICLO 8
    { codigo: 'C8-01', nombre: 'Arquitectura Basada en Microservicios', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 8, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C8-02', nombre: 'Deontologia y Derecho Informatico', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 8, departamento: 'Ciencias Sociales' },
    { codigo: 'C8-03', nombre: 'Ingenieria del Software II', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 8, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C8-04', nombre: 'Inteligencia de Negocios', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 8, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C8-05', nombre: 'Internet de las Cosas', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 8, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C8-06', nombre: 'Marketing y Medios Sociales', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 8, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C8-07', nombre: 'Redes y Comunicaciones II', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 8, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C8-08', nombre: 'Seguridad de la Informacion', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 8, departamento: 'Ingenieria de Sistemas' },

    // CICLO 9
    { codigo: 'C9-01', nombre: 'Analitica de Negocios', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 9, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C9-02', nombre: 'Auditoria Informatica', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 9, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C9-03', nombre: 'Computacion en la Nube', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 9, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C9-04', nombre: 'Emprendimiento Tecnologico', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 9, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C9-05', nombre: 'Gestion de Proyectos de TIC', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 9, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C9-06', nombre: 'Hackeo Etico', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 9, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C9-07', nombre: 'Ingenieria Web', creditos: 3, horas_teoria: 1, horas_laboratorio: 4, ciclo: 9, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C9-08', nombre: 'Tesis I', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 9, departamento: 'Ingenieria de Sistemas' },

    // CICLO 10
    { codigo: 'C10-01', nombre: 'Aplicaciones Moviles', creditos: 3, horas_teoria: 1, horas_laboratorio: 4, ciclo: 10, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C10-02', nombre: 'Arquitectura Empresarial', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, ciclo: 10, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C10-03', nombre: 'Gobierno de TIC', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 10, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C10-04', nombre: 'Practicas Pre Profesionales', creditos: 4, horas_teoria: 0, horas_laboratorio: 8, ciclo: 10, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C10-05', nombre: 'Responsabilidad Social Corporativa', creditos: 3, horas_teoria: 3, horas_laboratorio: 0, ciclo: 10, departamento: 'Ciencias Sociales' },
    { codigo: 'C10-06', nombre: 'Sistemas de Informacion Empresarial', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 10, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C10-07', nombre: 'Tesis II', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 10, departamento: 'Ingenieria de Sistemas' },
    { codigo: 'C10-08', nombre: 'Trabajo de Investigacion', creditos: 4, horas_teoria: 2, horas_laboratorio: 4, ciclo: 10, departamento: 'Ingenieria de Sistemas' },
  ]

  for (const curso of cursos) {
    await prisma.curso.upsert({
      where: { codigo: curso.codigo },
      update: { nombre: curso.nombre, creditos: curso.creditos, departamento: curso.departamento },
      create: { ...curso, horas_practica: 0 },
    })
  }
  console.log(`Cursos creados: ${cursos.length}`)

  // 4. Docentes de TODOS los departamentos
  interface DocenteSeed {
    codigo: string
    nombres: string
    apellidos: string
    correo: string
    categoria: CategoriaDocente
    tipo: TipoDocente
    antiguedad: number
    escuela: string
  }

  const docentes: DocenteSeed[] = [
    // ── Ingenieria de Sistemas (11 docentes) ──
    { codigo: 'DOC001', nombres: 'Everson David', apellidos: 'Agreda Gamboa', correo: 'eagreda@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 10, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC002', nombres: 'Oscar Romel', apellidos: 'Alcantara Moreno', correo: 'oalcantara@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 8, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC003', nombres: 'Cesar', apellidos: 'Arellano Salazar', correo: 'carellano@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 6, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC004', nombres: 'Luis Enrrique', apellidos: 'Boy Chavil', correo: 'lboy@unitru.edu.pe', categoria: CategoriaDocente.PRINCIPAL, tipo: TipoDocente.NOMBRADO, antiguedad: 25, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC005', nombres: 'Jose Alberto', apellidos: 'Gomez Avila', correo: 'jgomez@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 5, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC006', nombres: 'Ricardo Dario', apellidos: 'Mendoza Rivera', correo: 'rmendoza@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 7, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC007', nombres: 'Juan Carlos', apellidos: 'Obando Roldan', correo: 'jobando@unitru.edu.pe', categoria: CategoriaDocente.PRINCIPAL, tipo: TipoDocente.NOMBRADO, antiguedad: 20, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC008', nombres: 'Robert Jerry', apellidos: 'Sanchez Ticona', correo: 'rsanchez@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 12, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC009', nombres: 'Juan Pedro', apellidos: 'Santos Fernandez', correo: 'jsantos@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 15, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC010', nombres: 'Julio Luis', apellidos: 'Tenorio Cabrera', correo: 'jtenorio@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 14, escuela: 'Ingenieria de Sistemas' },
    { codigo: 'DOC011', nombres: 'Marcelino', apellidos: 'Torres Villanueva', correo: 'mtorres@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 4, escuela: 'Ingenieria de Sistemas' },

    // ── Matematicas (3 docentes para 4 cursos) ──
    { codigo: 'DOC-MAT01', nombres: 'Carlos Alberto', apellidos: 'Vasquez Cordova', correo: 'cvasquez@unitru.edu.pe', categoria: CategoriaDocente.PRINCIPAL, tipo: TipoDocente.NOMBRADO, antiguedad: 22, escuela: 'Matematicas' },
    { codigo: 'DOC-MAT02', nombres: 'Maria Elena', apellidos: 'Rodriguez Paredes', correo: 'mrodriguez@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 15, escuela: 'Matematicas' },
    { codigo: 'DOC-MAT03', nombres: 'Fernando Luis', apellidos: 'Castillo Ruiz', correo: 'fcastillo@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.CONTRATADO, antiguedad: 3, escuela: 'Matematicas' },

    // ── Fisica (2 docentes para 2 cursos) ──
    { codigo: 'DOC-FIS01', nombres: 'Jorge Eduardo', apellidos: 'Ramirez Soto', correo: 'jramirez@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 18, escuela: 'Fisica' },
    { codigo: 'DOC-FIS02', nombres: 'Ana Lucia', apellidos: 'Herrera Mendoza', correo: 'aherrera@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 7, escuela: 'Fisica' },

    // ── Estadistica (2 docentes para 2 cursos) ──
    { codigo: 'DOC-EST01', nombres: 'Pedro Miguel', apellidos: 'Chavez Luna', correo: 'pchavez@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 16, escuela: 'Estadistica' },
    { codigo: 'DOC-EST02', nombres: 'Rosa Elvira', apellidos: 'Diaz Campos', correo: 'rdiaz@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.CONTRATADO, antiguedad: 4, escuela: 'Estadistica' },

    // ── Ciencias Sociales / Psicologia / Humanidades (6 docentes para 15 cursos) ──
    { codigo: 'DOC-SOC01', nombres: 'Patricia Carmen', apellidos: 'Flores Gutierrez', correo: 'pflores@unitru.edu.pe', categoria: CategoriaDocente.PRINCIPAL, tipo: TipoDocente.NOMBRADO, antiguedad: 20, escuela: 'Ciencias Sociales' },
    { codigo: 'DOC-SOC02', nombres: 'Manuel Antonio', apellidos: 'Quispe Rojas', correo: 'mquispe@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 12, escuela: 'Ciencias Sociales' },
    { codigo: 'DOC-SOC03', nombres: 'Lucia Fernanda', apellidos: 'Vera Salinas', correo: 'lvera@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 8, escuela: 'Ciencias Sociales' },
    { codigo: 'DOC-SOC04', nombres: 'Diego Alonso', apellidos: 'Morales Tapia', correo: 'dmorales@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.CONTRATADO, antiguedad: 3, escuela: 'Ciencias Sociales' },
    { codigo: 'DOC-SOC05', nombres: 'Sandra Beatriz', apellidos: 'Huaman Rios', correo: 'shuaman@unitru.edu.pe', categoria: CategoriaDocente.JEFE_PRACTICA, tipo: TipoDocente.CONTRATADO, antiguedad: 2, escuela: 'Ciencias Sociales' },
    { codigo: 'DOC-SOC06', nombres: 'Roberto Carlos', apellidos: 'Avalos Mendez', correo: 'ravalos@unitru.edu.pe', categoria: CategoriaDocente.JEFE_PRACTICA, tipo: TipoDocente.CONTRATADO, antiguedad: 1, escuela: 'Ciencias Sociales' },

    // ── Economia (2 docentes para 2 cursos) ──
    { codigo: 'DOC-ECO01', nombres: 'Miguel Angel', apellidos: 'Pachas Villanueva', correo: 'mpachas@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 14, escuela: 'Economia' },
    { codigo: 'DOC-ECO02', nombres: 'Carmen Rosa', apellidos: 'Zavaleta Cruz', correo: 'czavaleta@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.CONTRATADO, antiguedad: 5, escuela: 'Economia' },

    // ── Contabilidad y Finanzas (2 docentes para 2 cursos) ──
    { codigo: 'DOC-CON01', nombres: 'Gloria Teresa', apellidos: 'Leon Paredes', correo: 'gleon@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO, tipo: TipoDocente.NOMBRADO, antiguedad: 17, escuela: 'Contabilidad y Finanzas' },
    { codigo: 'DOC-CON02', nombres: 'Hector Raul', apellidos: 'Medina Garcia', correo: 'hmedina@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.CONTRATADO, antiguedad: 6, escuela: 'Contabilidad y Finanzas' },

    // ── Ciencias Ambientales (1 docente para 1 curso) ──
    { codigo: 'DOC-AMB01', nombres: 'Silvia Marcela', apellidos: 'Torres Aguilar', correo: 'storres@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR, tipo: TipoDocente.NOMBRADO, antiguedad: 9, escuela: 'Ciencias Ambientales' },
  ]

  const docenteIds: Record<string, string> = {}

  for (const docente of docentes) {
    const created = await prisma.docente.upsert({
      where: { codigo: docente.codigo },
      update: {},
      create: docente,
    })
    docenteIds[docente.codigo] = created.id

    const existeDisponibilidad = await prisma.disponibilidadDocente.count({
      where: { docente_id: created.id },
    })

    if (existeDisponibilidad === 0) {
      const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const
      for (const dia of dias) {
        await prisma.disponibilidadDocente.create({
          data: {
            docente_id: created.id,
            dia,
            hora_inicio: '07:00',
            hora_fin: '20:00',
          },
        })
      }
    }
  }
  console.log(`Docentes creados: ${docentes.length}`)

  // 5. Asignar cursos a docentes (CursoDocente)
  // Mapeo: codigo del docente -> codigos de cursos que dicta
  const asignaciones: Record<string, string[]> = {
    // Ing. Sistemas - distribuir ~55 cursos entre 11 docentes (~5 cada uno)
    DOC001: ['C1-04', 'C1-05', 'C2-05', 'C2-09', 'C3-04'],
    DOC002: ['C3-06', 'C3-08', 'C4-01', 'C4-02', 'C4-07'],
    DOC003: ['C4-04', 'C4-05', 'C4-06', 'C4-08', 'C5-01'],
    DOC004: ['C5-03', 'C5-04', 'C5-05', 'C5-06', 'C5-07'],
    DOC005: ['C5-08', 'C6-04', 'C6-05', 'C6-07', 'C6-08'],
    DOC006: ['C7-01', 'C7-02', 'C7-03', 'C7-04', 'C7-05'],
    DOC007: ['C7-06', 'C7-07', 'C7-08', 'C8-01', 'C8-03'],
    DOC008: ['C8-04', 'C8-05', 'C8-06', 'C8-07', 'C8-08'],
    DOC009: ['C9-01', 'C9-02', 'C9-03', 'C9-04', 'C9-05'],
    DOC010: ['C9-06', 'C9-07', 'C9-08', 'C10-01', 'C10-02'],
    DOC011: ['C10-03', 'C10-04', 'C10-06', 'C10-07', 'C10-08'],

    // Matematicas
    'DOC-MAT01': ['C1-06', 'C2-01'],
    'DOC-MAT02': ['C1-01', 'C3-05'],
    'DOC-MAT03': ['C1-06'], // apoyo

    // Fisica
    'DOC-FIS01': ['C2-04'],
    'DOC-FIS02': ['C3-03'],

    // Estadistica
    'DOC-EST01': ['C1-03'],
    'DOC-EST02': ['C3-02'],

    // Ciencias Sociales (15 cursos entre 6 docentes)
    'DOC-SOC01': ['C1-02', 'C2-03', 'C3-01'],
    'DOC-SOC02': ['C1-07', 'C2-02', 'C3-07'],
    'DOC-SOC03': ['C2-06', 'C6-02', 'C8-02'],
    'DOC-SOC04': ['C10-05', 'C1-10'],
    'DOC-SOC05': ['C1-08', 'C1-09', 'C2-07'],
    'DOC-SOC06': ['C2-08'],

    // Economia
    'DOC-ECO01': ['C4-03'],
    'DOC-ECO02': ['C6-06'],

    // Contabilidad y Finanzas
    'DOC-CON01': ['C5-02'],
    'DOC-CON02': ['C6-01'],

    // Ciencias Ambientales
    'DOC-AMB01': ['C6-03'],
  }

  let totalAsignaciones = 0
  for (const [codigoDocente, codigosCursos] of Object.entries(asignaciones)) {
    const docenteId = docenteIds[codigoDocente]
    if (!docenteId) continue

    for (const codigoCurso of codigosCursos) {
      const curso = await prisma.curso.findUnique({ where: { codigo: codigoCurso } })
      if (!curso) continue

      await prisma.cursoDocente.upsert({
        where: {
          curso_id_docente_id: { curso_id: curso.id, docente_id: docenteId },
        },
        update: {},
        create: {
          curso_id: curso.id,
          docente_id: docenteId,
        },
      })
      totalAsignaciones++
    }
  }
  console.log(`Asignaciones docente-curso creadas: ${totalAsignaciones}`)

  // 6. Configuraciones del sistema
  const configuraciones = [
    { clave: 'ciclo_actual', valor: '2026-I', descripcion: 'Ciclo academico actual' },
    { clave: 'hora_inicio_jornada', valor: '07:00', descripcion: 'Hora de inicio de la jornada academica' },
    { clave: 'hora_fin_jornada', valor: '20:00', descripcion: 'Hora de fin de la jornada academica' },
    { clave: 'duracion_bloque', valor: '60', descripcion: 'Duracion de cada bloque horario en minutos' },
    { clave: 'max_horas_diarias_docente', valor: '8', descripcion: 'Maximo de horas diarias por docente' },
  ]

  for (const config of configuraciones) {
    await prisma.configuracionSistema.upsert({
      where: { clave: config.clave },
      update: {},
      create: config,
    })
  }
  console.log('Configuraciones del sistema creadas')

  console.log('\nSeed completado exitosamente!')
  console.log(`  ${cursos.length} cursos (10 ciclos)`)
  console.log(`  ${docentes.length} docentes (${new Set(docentes.map(d => d.escuela)).size} escuelas)`)
  console.log(`  ${ambientes.length} ambientes`)
  console.log(`  ${totalAsignaciones} asignaciones docente-curso`)
  console.log('  Usuario admin: admin@unitru.edu.pe / Admin2024!')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
