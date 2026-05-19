import { router, protectedProcedure } from '../trpc'

export const dashboardRouter = router({
  getEstadisticas: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalDocentes,
      totalCursos,
      totalAulas,
      totalLaboratorios,
      totalHorarios,
      docentesPorCategoria,
      cursosPorCiclo,
      horariosPorDia,
    ] = await Promise.all([
      ctx.prisma.docente.count({ where: { activo: true } }),
      ctx.prisma.curso.count({ where: { activo: true } }),
      ctx.prisma.ambiente.count({ where: { tipo: 'AULA', activo: true } }),
      ctx.prisma.ambiente.count({ where: { tipo: 'LABORATORIO', activo: true } }),
      ctx.prisma.horario.count({ where: { estado: 'ACTIVO' } }),
      ctx.prisma.docente.groupBy({
        by: ['categoria'],
        where: { activo: true },
        _count: true,
      }),
      ctx.prisma.curso.groupBy({
        by: ['ciclo'],
        where: { activo: true },
        _count: true,
        orderBy: { ciclo: 'asc' },
      }),
      ctx.prisma.horario.groupBy({
        by: ['dia'],
        where: { estado: 'ACTIVO' },
        _count: true,
      }),
    ])

    const totalAmbientes = totalAulas + totalLaboratorios
    const porcentajeOcupacion = totalAmbientes > 0 
      ? ((totalHorarios / (totalAmbientes * 30)) * 100).toFixed(1)
      : '0'

    return {
      totalDocentes,
      totalCursos,
      totalAulas,
      totalLaboratorios,
      totalHorarios,
      porcentajeOcupacion,
      docentesPorCategoria,
      cursosPorCiclo,
      horariosPorDia,
    }
  }),

  getActividadReciente: protectedProcedure.query(async ({ ctx }) => {
    const actividad = await ctx.prisma.auditoriaCambio.findMany({
      take: 10,
      orderBy: { creado_en: 'desc' },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellidos: true,
          },
        },
      },
    })

    return actividad.map(a => ({
      id: a.id,
      usuario: `${a.usuario.nombre} ${a.usuario.apellidos}`,
      accion: a.accion,
      entidad: a.entidad,
      fecha: a.creado_en,
    }))
  }),
})
