import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, getUserId } from '../trpc'
import { horarioSchema } from '@/lib/validators'
import { TRPCError } from '@trpc/server'
import { HorarioGenerator } from '../services/horarioGenerator'
import { ValidationService } from '../services/validationService'

export const horarioRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        ciclo: z.string().optional(),
        docente_id: z.string().optional(),
        curso_id: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.horario.findMany({
        where: {
          ...(input?.ciclo && { ciclo_academico: input.ciclo }),
          ...(input?.docente_id && { docente_id: input.docente_id }),
          ...(input?.curso_id && { curso_id: input.curso_id }),
          estado: 'ACTIVO',
        },
        include: {
          curso: true,
          docente: true,
          ambiente: true,
        },
        orderBy: [{ dia: 'asc' }, { hora_inicio: 'asc' }],
      })
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const horario = await ctx.prisma.horario.findUnique({
        where: { id: input },
        include: {
          curso: true,
          docente: true,
          ambiente: true,
        },
      })

      if (!horario) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Horario no encontrado' })
      }

      return horario
    }),

  create: adminProcedure
    .input(horarioSchema)
    .mutation(async ({ ctx, input }) => {
      const validationService = new ValidationService(ctx.prisma)
      const resultado = await validationService.validarHorarioCompleto(input)

      if (!resultado.valido) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: resultado.errores.join('. '),
        })
      }

      const horario = await ctx.prisma.horario.create({ data: input })

      return {
        horario,
        advertencias: resultado.advertencias,
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: horarioSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.horario.update({
        where: { id: input.id },
        data: input.data,
      })
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.horario.update({
        where: { id: input },
        data: { estado: 'INACTIVO' },
      })

      return { mensaje: 'Horario eliminado exitosamente' }
    }),

  generarHorarios: adminProcedure
    .input(
      z.object({
        ciclo: z.string().default('2024-I'),
        forzar: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Eliminar horarios existentes si se fuerza
      if (input.forzar) {
        await ctx.prisma.horario.deleteMany({
          where: { ciclo_academico: input.ciclo },
        })
      }

      const generator = new HorarioGenerator(ctx.prisma)
      const resultado = await generator.generarHorario(input.ciclo)

      // Guardar asignaciones
      const horarios = []
      for (const asignacion of resultado.asignaciones) {
        const horario = await ctx.prisma.horario.create({
          data: {
            ...asignacion,
            ciclo_academico: input.ciclo,
          },
        })
        horarios.push(horario)
      }

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'GENERAR_HORARIOS',
          entidad: 'Horario',
          entidad_id: input.ciclo,
          cambios: {
            total: horarios.length,
            ciclo: input.ciclo,
            conflictos: resultado.conflictos,
          },
        },
      })

      return {
        mensaje: `Horarios generados exitosamente: ${horarios.length} asignaciones`,
        total: horarios.length,
        conflictos: resultado.conflictos,
        advertencias: resultado.advertencias,
      }
    }),

  validarHorario: adminProcedure
    .input(horarioSchema)
    .mutation(async ({ ctx, input }) => {
      const validationService = new ValidationService(ctx.prisma)
      return validationService.validarHorarioCompleto(input)
    }),

  getConflictos: protectedProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      const ciclo = input || '2024-I'
      
      // Aquí se implementaría la lógica de detección de conflictos
      const conflictos = await ctx.prisma.auditoriaCambio.findMany({
        where: {
          accion: 'CONFLICTO_DETECTADO',
          creado_en: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 días
          },
        },
        take: 50,
        orderBy: { creado_en: 'desc' },
      })

      return conflictos
    }),
})

