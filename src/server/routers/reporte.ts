import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { ReportService } from '../services/reportService'

export const reporteRouter = router({
  generarHorarioGeneral: protectedProcedure
    .input(
      z.object({
        ciclo: z.string().optional(),
        cicloCurso: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reportService = new ReportService(ctx.prisma)
      const pdfBuffer = await reportService.generarHorarioGeneral(input.ciclo, input.cicloCurso)

      const cicloSuffix = input.cicloCurso ? `_Ciclo_${input.cicloCurso}` : ''
      return {
        archivo: Buffer.from(pdfBuffer).toString('base64'),
        tipo: 'application/pdf',
        nombre: `Horario_General_${input.ciclo || 'Completo'}${cicloSuffix}.pdf`,
      }
    }),

  generarHorarioDocente: protectedProcedure
    .input(
      z.object({
        docenteId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reportService = new ReportService(ctx.prisma)
      const pdfBuffer = await reportService.generarHorarioPorDocente(input.docenteId)
      
      const docente = await ctx.prisma.docente.findUnique({
        where: { id: input.docenteId },
        select: { apellidos: true, nombres: true },
      })

      return {
        archivo: Buffer.from(pdfBuffer).toString('base64'),
        tipo: 'application/pdf',
        nombre: `Horario_${docente?.apellidos}_${docente?.nombres}.pdf`,
      }
    }),

  generarReporteDocentes: protectedProcedure
    .input(
      z.object({
        escuela: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reportService = new ReportService(ctx.prisma)
      const pdfBuffer = await reportService.generarReporteDocentes(input.escuela)

      const suffix = input.escuela ? `_${input.escuela.replace(/\s+/g, '_')}` : '_Todas'
      return {
        archivo: Buffer.from(pdfBuffer).toString('base64'),
        tipo: 'application/pdf',
        nombre: `Reporte_Docentes${suffix}.pdf`,
      }
    }),

  generarReporteAmbientes: protectedProcedure
    .mutation(async ({ ctx }) => {
      const reportService = new ReportService(ctx.prisma)
      const pdfBuffer = await reportService.generarReporteAmbientes()
      
      return {
        archivo: Buffer.from(pdfBuffer).toString('base64'),
        tipo: 'application/pdf',
        nombre: 'Reporte_Ambientes.pdf',
      }
    }),

  getEstadisticasReporte: protectedProcedure.query(async ({ ctx }) => {
    const [totalHorarios, conflictos, ultimaGeneracion] = await Promise.all([
      ctx.prisma.horario.count(),
      ctx.prisma.auditoriaCambio.count({
        where: { accion: 'CONFLICTO_DETECTADO' },
      }),
      ctx.prisma.horario.findFirst({
        orderBy: { creado_en: 'desc' },
        select: { creado_en: true, ciclo_academico: true },
      }),
    ])

    return {
      totalHorariosGenerados: totalHorarios,
      conflictosDetectados: conflictos,
      ultimaGeneracion,
    }
  }),
})

