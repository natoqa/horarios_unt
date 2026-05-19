import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'

export const usuarioRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.usuario.findMany({
      select: {
        id: true,
        correo: true,
        nombre: true,
        apellidos: true,
        rol: true,
        activo: true,
        creado_en: true,
        docente: {
          select: {
            id: true,
            codigo: true,
            categoria: true,
            tipo: true,
          },
        },
      },
      orderBy: { creado_en: 'desc' },
    })
  }),

  getById: adminProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const usuario = await ctx.prisma.usuario.findUnique({
        where: { id: input },
        include: {
          docente: true,
          sesiones: {
            take: 5,
            orderBy: { creado_en: 'desc' },
          },
        },
      })

      if (!usuario) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' })
      }

      return usuario
    }),

  create: adminProcedure
    .input(
      z.object({
        correo: z.string().email(),
        contrasena: z.string().min(8),
        nombre: z.string().min(2),
        apellidos: z.string().min(2),
        rol: z.enum(['ADMINISTRADOR', 'DOCENTE', 'COORDINADOR']),
        docente_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existe = await ctx.prisma.usuario.findUnique({
        where: { correo: input.correo },
      })

      if (existe) {
        throw new TRPCError({ code: 'CONFLICT', message: 'El correo ya está registrado' })
      }

      const contrasenaHash = await bcrypt.hash(input.contrasena, 12)

      const usuario = await ctx.prisma.usuario.create({
        data: {
          correo: input.correo,
          contrasena: contrasenaHash,
          nombre: input.nombre,
          apellidos: input.apellidos,
          rol: input.rol,
        },
        select: {
          id: true,
          correo: true,
          nombre: true,
          apellidos: true,
          rol: true,
        },
      })

      if (input.docente_id) {
        await ctx.prisma.docente.update({
          where: { id: input.docente_id },
          data: { usuario_id: usuario.id },
        })
      }

      return usuario
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          nombre: z.string().min(2).optional(),
          apellidos: z.string().min(2).optional(),
          rol: z.enum(['ADMINISTRADOR', 'DOCENTE', 'COORDINADOR']).optional(),
          activo: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.usuario.update({
        where: { id: input.id },
        data: input.data,
        select: { id: true, nombre: true, apellidos: true, rol: true },
      })
    }),

  toggleActivo: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const usuario = await ctx.prisma.usuario.findUnique({
        where: { id: input },
      })

      if (!usuario) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' })
      }

      return ctx.prisma.usuario.update({
        where: { id: input },
        data: { activo: !usuario.activo },
        select: { id: true, activo: true },
      })
    }),
})

