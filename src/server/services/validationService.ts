import { PrismaClient } from '@prisma/client'
import type { DiaSemanaValor, TipoAmbienteValor } from '@/lib/prisma-types'

interface HorarioInput {
  curso_id: string
  docente_id: string
  ambiente_id: string
  dia: DiaSemanaValor
  hora_inicio: string
  hora_fin: string
  tipo: TipoAmbienteValor
  ciclo_academico?: string
}

interface ValidacionResultado {
  valido: boolean
  errores: string[]
  advertencias: string[]
}

interface ConflictoDetectado {
  tipo: 'DOCENTE' | 'AMBIENTE'
  entidad_nombre: string
  dia: string
  hora_inicio: string
  hora_fin: string
  curso_a: string
  curso_b: string
}

export class ValidationService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async validarHorarioCompleto(horario: HorarioInput, excluirId?: string): Promise<ValidacionResultado> {
    const errores: string[] = []
    const advertencias: string[] = []

    if (horario.hora_inicio >= horario.hora_fin) {
      errores.push('La hora de inicio debe ser menor a la hora de fin')
    }

    const docenteDisponible = await this.validarDisponibilidadDocente(
      horario.docente_id,
      horario.dia,
      horario.hora_inicio,
      horario.hora_fin,
      excluirId
    )

    if (!docenteDisponible) {
      errores.push('El docente no está disponible en ese horario o ya tiene una clase asignada')
    }

    const ambienteDisponible = await this.validarDisponibilidadAmbiente(
      horario.ambiente_id,
      horario.dia,
      horario.hora_inicio,
      horario.hora_fin,
      excluirId
    )

    if (!ambienteDisponible) {
      errores.push('El ambiente no está disponible en ese horario')
    }

    const ambiente = await this.prisma.ambiente.findUnique({
      where: { id: horario.ambiente_id },
    })

    if (ambiente && ambiente.tipo !== horario.tipo) {
      errores.push(`El ambiente es de tipo ${ambiente.tipo} pero la clase requiere ${horario.tipo}`)
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
    }
  }

  async detectarConflictos(cicloAcademico: string): Promise<ConflictoDetectado[]> {
    const conflictos: ConflictoDetectado[] = []

    const horarios = await this.prisma.horario.findMany({
      where: { ciclo_academico: cicloAcademico, estado: 'ACTIVO' },
      include: {
        curso: { select: { nombre: true } },
        docente: { select: { nombres: true, apellidos: true } },
        ambiente: { select: { nombre: true } },
      },
      orderBy: [{ dia: 'asc' }, { hora_inicio: 'asc' }],
    })

    for (let i = 0; i < horarios.length; i++) {
      for (let j = i + 1; j < horarios.length; j++) {
        const a = horarios[i]
        const b = horarios[j]

        if (a.dia !== b.dia) continue
        const seSolapan = a.hora_inicio < b.hora_fin && a.hora_fin > b.hora_inicio
        if (!seSolapan) continue

        if (a.docente_id === b.docente_id) {
          conflictos.push({
            tipo: 'DOCENTE',
            entidad_nombre: `${a.docente.nombres} ${a.docente.apellidos}`,
            dia: a.dia,
            hora_inicio: a.hora_inicio > b.hora_inicio ? b.hora_inicio : a.hora_inicio,
            hora_fin: a.hora_fin > b.hora_fin ? a.hora_fin : b.hora_fin,
            curso_a: a.curso.nombre,
            curso_b: b.curso.nombre,
          })
        }

        if (a.ambiente_id === b.ambiente_id) {
          conflictos.push({
            tipo: 'AMBIENTE',
            entidad_nombre: a.ambiente.nombre,
            dia: a.dia,
            hora_inicio: a.hora_inicio > b.hora_inicio ? b.hora_inicio : a.hora_inicio,
            hora_fin: a.hora_fin > b.hora_fin ? a.hora_fin : b.hora_fin,
            curso_a: a.curso.nombre,
            curso_b: b.curso.nombre,
          })
        }
      }
    }

    return conflictos
  }

  private async validarDisponibilidadDocente(
    docenteId: string,
    dia: DiaSemanaValor,
    horaInicio: string,
    horaFin: string,
    excluirId?: string
  ): Promise<boolean> {
    const tieneDisponibilidades = await this.prisma.disponibilidadDocente.count({
      where: { docente_id: docenteId },
    })

    if (tieneDisponibilidades > 0) {
      const disponibilidad = await this.prisma.disponibilidadDocente.findFirst({
        where: {
          docente_id: docenteId,
          dia: dia,
          hora_inicio: { lte: horaInicio },
          hora_fin: { gte: horaFin },
        },
      })

      if (!disponibilidad) return false
    }

    const whereClause: Record<string, unknown> = {
      docente_id: docenteId,
      dia: dia,
      estado: 'ACTIVO',
      hora_inicio: { lt: horaFin },
      hora_fin: { gt: horaInicio },
    }

    if (excluirId) {
      whereClause.id = { not: excluirId }
    }

    const cruce = await this.prisma.horario.findFirst({ where: whereClause })

    return !cruce
  }

  private async validarDisponibilidadAmbiente(
    ambienteId: string,
    dia: DiaSemanaValor,
    horaInicio: string,
    horaFin: string,
    excluirId?: string
  ): Promise<boolean> {
    const whereClause: Record<string, unknown> = {
      ambiente_id: ambienteId,
      dia: dia,
      estado: 'ACTIVO',
      hora_inicio: { lt: horaFin },
      hora_fin: { gt: horaInicio },
    }

    if (excluirId) {
      whereClause.id = { not: excluirId }
    }

    const ocupado = await this.prisma.horario.findFirst({ where: whereClause })

    return !ocupado
  }
}
