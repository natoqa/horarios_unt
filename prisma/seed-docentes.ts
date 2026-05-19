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
  await prisma.horario.deleteMany({ where: { docente: { escuela: 'Ingeniería de Sistemas' } } })
  await prisma.cursoDocente.deleteMany({ where: { docente: { escuela: 'Ingeniería de Sistemas' } } })
  await prisma.disponibilidadDocente.deleteMany({ where: { docente: { escuela: 'Ingeniería de Sistemas' } } })
  await prisma.docente.deleteMany()
  console.log('Docentes anteriores eliminados')

  for (const d of docentes) {
    await prisma.docente.create({
      data: {
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
