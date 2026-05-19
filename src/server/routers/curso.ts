import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, getUserId } from '../trpc'
import { cursoSchema } from '@/lib/validators'
import { TRPCError } from '@trpc/server'

export const cursoRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.curso.findMany({
      where: { activo: true },
      include: {
        docentes: {
          include: { docente: true },
        },
        prerrequisitos: {
          include: { prerrequisito: true },
        },
      },
      orderBy: [{ ciclo: 'asc' }, { codigo: 'asc' }],
    })
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const curso = await ctx.prisma.curso.findUnique({
        where: { id: input },
        include: {
          docentes: {
            include: { docente: true },
          },
          prerrequisitos: {
            include: { prerrequisito: true },
          },
          es_prerrequisito: {
            include: { curso: true },
          },
          horarios: {
            where: { estado: 'ACTIVO' },
            take: 10,
          },
        },
      })

      if (!curso) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Curso no encontrado' })
      }

      return curso
    }),

  create: adminProcedure
    .input(cursoSchema)
    .mutation(async ({ ctx, input }) => {
      const existe = await ctx.prisma.curso.findUnique({
        where: { codigo: input.codigo },
      })

      if (existe) {
        throw new TRPCError({ code: 'CONFLICT', message: 'El código del curso ya existe' })
      }

      const curso = await ctx.prisma.curso.create({ data: input })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'CREAR',
          entidad: 'Curso',
          entidad_id: curso.id,
          cambios: input as any,
        },
      })

      return curso
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: cursoSchema.partial().extend({
          activo: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const curso = await ctx.prisma.curso.update({
        where: { id: input.id },
        data: input.data,
      })

      return curso
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.curso.update({
        where: { id: input },
        data: { activo: false },
      })

      return { mensaje: 'Curso desactivado exitosamente' }
    }),

  getByCiclo: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.curso.findMany({
        where: { ciclo: input, activo: true },
        orderBy: { codigo: 'asc' },
      })
    }),
})
