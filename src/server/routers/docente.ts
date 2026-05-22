import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, getUserId } from '../trpc'
import { docenteSchema } from '@/lib/validators'
import { TRPCError } from '@trpc/server'

export const docenteRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.docente.findMany({
      where: { activo: true },
      include: {
        disponibilidades: true,
        cursos_asignados: {
          include: { curso: true },
        },
        usuario: {
          select: { id: true, correo: true, activo: true },
        },
      },
      orderBy: { apellidos: 'asc' },
    })
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const docente = await ctx.prisma.docente.findUnique({
        where: { id: input },
        include: {
          disponibilidades: true,
          cursos_asignados: {
            include: { curso: true },
          },
          horarios: {
            where: { estado: 'ACTIVO' },
            include: {
              curso: true,
              ambiente: true,
            },
          },
          usuario: {
            select: { id: true, correo: true },
          },
        },
      })

      if (!docente) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Docente no encontrado' })
      }

      return docente
    }),

  create: adminProcedure
    .input(docenteSchema)
    .mutation(async ({ ctx, input }) => {
      const existeCodigo = await ctx.prisma.docente.findUnique({
        where: { codigo: input.codigo },
      })

      if (existeCodigo) {
        throw new TRPCError({ code: 'CONFLICT', message: 'El código ya existe' })
      }

      const existeCorreo = await ctx.prisma.docente.findUnique({
        where: { correo: input.correo },
      })

      if (existeCorreo) {
        throw new TRPCError({ code: 'CONFLICT', message: 'El correo ya está registrado' })
      }

      const docente = await ctx.prisma.docente.create({
        data: input,
        include: { disponibilidades: true },
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'CREAR',
          entidad: 'Docente',
          entidad_id: docente.id,
          cambios: input as any,
        },
      })

      return docente
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: docenteSchema.partial().extend({
          activo: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const docente = await ctx.prisma.docente.update({
        where: { id: input.id },
        data: input.data,
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'ACTUALIZAR',
          entidad: 'Docente',
          entidad_id: docente.id,
          cambios: input.data as any,
        },
      })

      return docente
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.docente.update({
        where: { id: input },
        data: { activo: false },
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'ELIMINAR',
          entidad: 'Docente',
          entidad_id: input,
          cambios: { activo: false },
        },
      })

      return { mensaje: 'Docente desactivado exitosamente' }
    }),

  updateDisponibilidad: protectedProcedure
    .input(
      z.object({
        docente_id: z.string(),
        disponibilidades: z.array(
          z.object({
            dia: z.string(),
            hora_inicio: z.string(),
            hora_fin: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rol = ctx.session.user.rol
      const docenteId = ctx.session.user.docente_id
      
      const esAdminNivel = 
        rol === 'ADMINISTRADOR' || 
        rol === 'SECRETARIA' || 
        rol === 'DIRECTOR' || 
        rol === 'COORDINADOR'

      if (!esAdminNivel && docenteId !== input.docente_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tiene permisos para modificar esta disponibilidad',
        })
      }

      // Si es de nivel administrativo, no puede crear la disponibilidad si el docente aún no ha registrado ninguna.
      if (esAdminNivel) {
        const disponibilidadActual = await ctx.prisma.disponibilidadDocente.count({
          where: { docente_id: input.docente_id },
        })
        if (disponibilidadActual === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'El docente aún no ha registrado su disponibilidad. Debe registrarla por primera vez desde su propia cuenta.',
          })
        }
      }

      await ctx.prisma.$transaction(async (tx) => {
        await tx.disponibilidadDocente.deleteMany({
          where: { docente_id: input.docente_id },
        })

        await tx.disponibilidadDocente.createMany({
          data: input.disponibilidades.map(d => ({
            docente_id: input.docente_id,
            dia: d.dia as any,
            hora_inicio: d.hora_inicio,
            hora_fin: d.hora_fin,
          })),
        })
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'ACTUALIZAR',
          entidad: 'DisponibilidadDocente',
          entidad_id: input.docente_id,
          cambios: { total: input.disponibilidades.length } as any,
        },
      })

      return { mensaje: 'Disponibilidad actualizada exitosamente' }
    }),

  asignarCursos: adminProcedure
    .input(
      z.object({
        docente_id: z.string(),
        cursos_ids: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        await tx.cursoDocente.deleteMany({
          where: { docente_id: input.docente_id },
        })

        await tx.cursoDocente.createMany({
          data: input.cursos_ids.map(cursoId => ({
            docente_id: input.docente_id,
            curso_id: cursoId,
          })),
        })
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'ASIGNAR_CURSOS',
          entidad: 'CursoDocente',
          entidad_id: input.docente_id,
          cambios: { cursos: input.cursos_ids } as any,
        },
      })

      return { mensaje: 'Cursos asignados exitosamente' }
    }),
})
