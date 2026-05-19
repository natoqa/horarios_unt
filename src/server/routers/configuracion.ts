import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'

export const configuracionRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.configuracionSistema.findMany({
      orderBy: { clave: 'asc' },
    })
  }),

  getByClave: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.configuracionSistema.findUnique({
        where: { clave: input },
      })
    }),

  update: adminProcedure
    .input(
      z.object({
        clave: z.string(),
        valor: z.string(),
        descripcion: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.configuracionSistema.upsert({
        where: { clave: input.clave },
        create: {
          clave: input.clave,
          valor: input.valor,
          descripcion: input.descripcion,
        },
        update: {
          valor: input.valor,
          descripcion: input.descripcion,
        },
      })
    }),

  updateMultiple: adminProcedure
    .input(
      z.array(
        z.object({
          clave: z.string(),
          valor: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const updates = input.map(({ clave, valor }) =>
        ctx.prisma.configuracionSistema.upsert({
          where: { clave },
          create: { clave, valor },
          update: { valor },
        })
      )

      return Promise.all(updates)
    }),
})
