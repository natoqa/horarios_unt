import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.docente.deleteMany({
    where: { apellidos: { contains: 'Tenorio' } },
  })
  console.log(`Eliminado: ${result.count} docente(s)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
