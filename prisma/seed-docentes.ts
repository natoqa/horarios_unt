import { PrismaClient, CategoriaDocente, TipoDocente } from '@prisma/client'

const prisma = new PrismaClient()

const docentes = [
  { codigo: 'DOC001', nombres: 'Everson David', apellidos: 'Agreda Gamboa', correo: 'eagreda@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO },
  { codigo: 'DOC002', nombres: 'Oscar Romel', apellidos: 'Alcántara Moreno', correo: 'oalcantara@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR },
  { codigo: 'DOC003', nombres: 'César', apellidos: 'Arellano Salazar', correo: 'carellano@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR },
  { codigo: 'DOC004', nombres: 'Luis Enrrique', apellidos: 'Boy Chavil', correo: 'lboy@unitru.edu.pe', categoria: CategoriaDocente.PRINCIPAL },
  { codigo: 'DOC005', nombres: 'José Alberto', apellidos: 'Gómez Ávila', correo: 'jgomez@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR },
  { codigo: 'DOC006', nombres: 'Ricardo Darío', apellidos: 'Mendoza Rivera', correo: 'rmendoza@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR },
  { codigo: 'DOC007', nombres: 'Juan Carlos', apellidos: 'Obando Roldán', correo: 'jobando@unitru.edu.pe', categoria: CategoriaDocente.PRINCIPAL },
  { codigo: 'DOC008', nombres: 'Robert Jerry', apellidos: 'Sánchez Ticona', correo: 'rsanchez@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO },
  { codigo: 'DOC009', nombres: 'Juan Pedro', apellidos: 'Santos Fernández', correo: 'jsantos@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO },
  { codigo: 'DOC010', nombres: 'Julio Luis', apellidos: 'Tenorio Cabrera', correo: 'jtenorio@unitru.edu.pe', categoria: CategoriaDocente.ASOCIADO },
  { codigo: 'DOC011', nombres: 'Marcelino', apellidos: 'Torres Villanueva', correo: 'mtorres@unitru.edu.pe', categoria: CategoriaDocente.AUXILIAR },
]

async function main() {
  // Obtener IDs de docentes de Ingeniería de Sistemas
  const docentesSistemas = await prisma.docente.findMany({
    where: { escuela: 'Ingeniería de Sistemas' },
    select: { id: true }
  })
  const docenteIds = docentesSistemas.map(d => d.id)

  // Eliminar registros relacionados primero
  await prisma.horario.deleteMany({
    where: { docente_id: { in: docenteIds } }
  })
  await prisma.cursoDocente.deleteMany({
    where: { docente_id: { in: docenteIds } }
  })
  await prisma.disponibilidadDocente.deleteMany({
    where: { docente_id: { in: docenteIds } }
  })
  await prisma.docente.deleteMany({
    where: { id: { in: docenteIds } }
  })
  console.log('Docentes anteriores eliminados')

  for (const d of docentes) {
    await prisma.docente.upsert({
      where: { codigo: d.codigo },
      update: {
        nombres: d.nombres,
        apellidos: d.apellidos,
        correo: d.correo,
        categoria: d.categoria,
        tipo: TipoDocente.NOMBRADO,
        escuela: 'Ingeniería de Sistemas',
        antiguedad: 0,
      },
      create: {
        ...d,
        tipo: TipoDocente.NOMBRADO,
        escuela: 'Ingeniería de Sistemas',
        antiguedad: 0,
      },
    })
    console.log(`  + ${d.apellidos}, ${d.nombres}`)
  }

  console.log(`\n${docentes.length} docentes insertados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
