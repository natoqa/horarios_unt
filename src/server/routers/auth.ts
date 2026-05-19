import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, getUserId } from '../trpc'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import { registerSchema } from '@/lib/validators'

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const existeUsuario = await ctx.prisma.usuario.findUnique({
        where: { correo: input.correo },
      })

      if (existeUsuario) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'El correo ya está registrado',
        })
      }

      const contrasenaHash = await bcrypt.hash(input.contrasena, 12)

      const usuario = await ctx.prisma.usuario.create({
        data: {
          correo: input.correo,
          contrasena: contrasenaHash,
          nombre: input.nombre,
          apellidos: input.apellidos,
          rol: 'DOCENTE',
        },
        select: {
          id: true,
          correo: true,
          nombre: true,
          apellidos: true,
          rol: true,
        },
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: usuario.id,
          accion: 'REGISTRO',
          entidad: 'Usuario',
          entidad_id: usuario.id,
          cambios: { metodo: 'web' },
        },
      })

      return {
        mensaje: 'Usuario registrado exitosamente',
        usuario,
      }
    }),

  cambiarContrasena: protectedProcedure
    .input(
      z.object({
        contrasena_actual: z.string(),
        nueva_contrasena: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const usuario = await ctx.prisma.usuario.findUnique({
        where: { id: getUserId(ctx) },
      })

      if (!usuario) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' })
      }

      const contrasenaValida = await bcrypt.compare(input.contrasena_actual, usuario.contrasena)

      if (!contrasenaValida) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Contraseña actual incorrecta' })
      }

      const nuevaContrasenaHash = await bcrypt.hash(input.nueva_contrasena, 12)

      await ctx.prisma.usuario.update({
        where: { id: usuario.id },
        data: { contrasena: nuevaContrasenaHash },
      })

      return { mensaje: 'Contraseña actualizada exitosamente' }
    }),

  getPerfil: protectedProcedure.query(async ({ ctx }) => {
    const usuario = await ctx.prisma.usuario.findUnique({
      where: { id: getUserId(ctx) },
      include: {
        docente: {
          select: {
            id: true,
            codigo: true,
            categoria: true,
            tipo: true,
            antiguedad: true,
          },
        },
      },
    })

    if (!usuario) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado' })
    }

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      rol: usuario.rol,
      docente: usuario.docente,
    }
  }),

  actualizarPerfil: protectedProcedure
    .input(
      z.object({
        nombre: z.string().min(2).optional(),
        apellidos: z.string().min(2).optional(),
        telefono: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.usuario.update({
        where: { id: getUserId(ctx) },
        data: input,
      })

      return { mensaje: 'Perfil actualizado exitosamente' }
    }),
})
