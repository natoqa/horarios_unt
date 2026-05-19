import { PrismaClient } from '@prisma/client'

interface ValidacionResultado {
  valido: boolean
  errores: string[]
  advertencias: string[]
}

export class ValidationService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async validarHorarioCompleto(horario: any, excluirId?: string): Promise<ValidacionResultado> {
    const errores: string[] = []
    const advertencias: string[] = []

    // Validar formato de horas
    if (horario.hora_inicio >= horario.hora_fin) {
      errores.push('La hora de inicio debe ser menor a la hora de fin')
    }

    // Validar disponibilidad del docente
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

    // Validar disponibilidad del ambiente
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

    // Validar tipo de ambiente
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

  private async validarDisponibilidadDocente(
    docenteId: string,
    dia: string,
    horaInicio: string,
    horaFin: string,
    excluirId?: string
  ): Promise<boolean> {
    const disponibilidad = await this.prisma.disponibilidadDocente.findFirst({
      where: {
        docente_id: docenteId,
        dia: dia as any,
        hora_inicio: { lte: horaInicio },
        hora_fin: { gte: horaFin },
      },
    })

    if (!disponibilidad) return false

    const whereClause: any = {
      docente_id: docenteId,
      dia: dia as any,
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
    dia: string,
    horaInicio: string,
    horaFin: string,
    excluirId?: string
  ): Promise<boolean> {
    const whereClause: any = {
      ambiente_id: ambienteId,
      dia: dia as any,
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
