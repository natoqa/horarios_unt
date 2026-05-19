import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { ambienteSchema } from '@/lib/validators'
import { TRPCError } from '@trpc/server'

export const ambienteRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.ambiente.findMany({
      where: { activo: true },
      orderBy: [{ tipo: 'asc' }, { codigo: 'asc' }],
    })
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const ambiente = await ctx.prisma.ambiente.findUnique({
        where: { id: input },
        include: {
          horarios: {
            where: { estado: 'ACTIVO' },
            take: 10,
            include: {
              curso: true,
              docente: true,
            },
          },
          mantenimientos: {
            orderBy: { fecha_inicio: 'desc' },
            take: 5,
          },
        },
      })

      if (!ambiente) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ambiente no encontrado' })
      }

      return ambiente
    }),

  create: adminProcedure
    .input(ambienteSchema)
    .mutation(async ({ ctx, input }) => {
      const existe = await ctx.prisma.ambiente.findUnique({
        where: { codigo: input.codigo },
      })

      if (existe) {
        throw new TRPCError({ code: 'CONFLICT', message: 'El código del ambiente ya existe' })
      }

      return ctx.prisma.ambiente.create({ data: input })
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: ambienteSchema.partial().extend({
          activo: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.ambiente.update({
        where: { id: input.id },
        data: input.data,
      })
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.ambiente.update({
        where: { id: input },
        data: { activo: false },
      })

      return { mensaje: 'Ambiente desactivado exitosamente' }
    }),

  getDisponibles: protectedProcedure
    .input(
      z.object({
        dia: z.string(),
        hora_inicio: z.string(),
        hora_fin: z.string(),
        tipo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const ocupados = await ctx.prisma.horario.findMany({
        where: {
          dia: input.dia as any,
          estado: 'ACTIVO',
          hora_inicio: { lt: input.hora_fin },
          hora_fin: { gt: input.hora_inicio },
        },
        select: { ambiente_id: true },
      })

      const idsOcupados = ocupados.map(h => h.ambiente_id)

      return ctx.prisma.ambiente.findMany({
        where: {
          activo: true,
          id: { notIn: idsOcupados },
          ...(input.tipo && { tipo: input.tipo as any }),
        },
      })
    }),
})
