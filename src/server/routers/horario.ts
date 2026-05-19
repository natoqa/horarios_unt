import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, getUserId } from '../trpc'
import { horarioSchema } from '@/lib/validators'
import { TRPCError } from '@trpc/server'
import { HorarioGenerator } from '../services/horarioGenerator'
import { ValidationService } from '../services/validationService'
import { CICLOS_ACADEMICOS } from '@/lib/constants'

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

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'CREAR',
          entidad: 'Horario',
          entidad_id: horario.id,
          cambios: input as any,
        },
      })

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
      const actual = await ctx.prisma.horario.findUnique({ where: { id: input.id } })
      if (!actual) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Horario no encontrado' })
      }

      const datosCompletos = { ...actual, ...input.data }
      const validationService = new ValidationService(ctx.prisma)
      const resultado = await validationService.validarHorarioCompleto(
        {
          curso_id: datosCompletos.curso_id,
          docente_id: datosCompletos.docente_id,
          ambiente_id: datosCompletos.ambiente_id,
          dia: datosCompletos.dia,
          hora_inicio: datosCompletos.hora_inicio,
          hora_fin: datosCompletos.hora_fin,
          tipo: datosCompletos.tipo,
          ciclo_academico: datosCompletos.ciclo_academico,
        },
        input.id
      )

      if (!resultado.valido) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: resultado.errores.join('. '),
        })
      }

      const horario = await ctx.prisma.horario.update({
        where: { id: input.id },
        data: input.data,
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'ACTUALIZAR',
          entidad: 'Horario',
          entidad_id: horario.id,
          cambios: input.data as any,
        },
      })

      return { horario, advertencias: resultado.advertencias }
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.horario.update({
        where: { id: input },
        data: { estado: 'INACTIVO' },
      })

      await ctx.prisma.auditoriaCambio.create({
        data: {
          usuario_id: getUserId(ctx),
          accion: 'ELIMINAR',
          entidad: 'Horario',
          entidad_id: input,
          cambios: { estado: 'INACTIVO' },
        },
      })

      return { mensaje: 'Horario eliminado exitosamente' }
    }),

  generarHorarios: adminProcedure
    .input(
      z.object({
        ciclo: z.string().default(CICLOS_ACADEMICOS[0]),
        forzar: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const generator = new HorarioGenerator(ctx.prisma)
      const resultado = await generator.generarHorario(input.ciclo, input.forzar)

      const horarios = await ctx.prisma.$transaction(async (tx) => {
        if (input.forzar) {
          await tx.horario.deleteMany({
            where: { ciclo_academico: input.ciclo },
          })
        }

        const creados = []
        for (const asignacion of resultado.asignaciones) {
          const horario = await tx.horario.create({
            data: {
              ...asignacion,
              ciclo_academico: input.ciclo,
            },
          })
          creados.push(horario)
        }

        await tx.auditoriaCambio.create({
          data: {
            usuario_id: getUserId(ctx),
            accion: 'GENERAR_HORARIOS',
            entidad: 'Horario',
            entidad_id: input.ciclo,
            cambios: {
              total: creados.length,
              ciclo: input.ciclo,
              conflictos: resultado.conflictos.length,
              advertencias: resultado.advertencias.length,
            },
          },
        })

        return creados
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
      const ciclo = input || CICLOS_ACADEMICOS[0]
      const validationService = new ValidationService(ctx.prisma)
      return validationService.detectarConflictos(ciclo)
    }),
})
