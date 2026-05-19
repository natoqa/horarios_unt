import { PrismaClient } from '@prisma/client'
import type {
  Ambiente,
  Curso,
  CursoDocente,
  DisponibilidadDocente,
  Docente,
  DiaSemanaValor,
  TipoAmbienteValor,
} from '@/lib/prisma-types'
import { ValidationService } from './validationService'

interface Asignacion {
  curso_id: string
  docente_id: string
  ambiente_id: string
  dia: DiaSemanaValor
  hora_inicio: string
  hora_fin: string
  tipo: TipoAmbienteValor
}

interface ResultadoGeneracion {
  asignaciones: Asignacion[]
  conflictos: string[]
  advertencias: string[]
}

type DocenteConRelaciones = Docente & {
  cursos_asignados: (CursoDocente & { curso: Curso })[]
  disponibilidades: DisponibilidadDocente[]
}

export class HorarioGenerator {
  private prisma: PrismaClient
  private validationService: ValidationService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.validationService = new ValidationService(prisma)
  }

  private calcularPrioridad(docente: DocenteConRelaciones): number {
    const prioridadBase: Record<string, number> = {
      PRINCIPAL: 1000,
      ASOCIADO: 800,
      AUXILIAR: 600,
      JEFE_PRACTICA: 400,
    }

    let prioridad = prioridadBase[docente.categoria] || 0
    prioridad += docente.antiguedad * 10

    if (docente.tipo === 'NOMBRADO') {
      prioridad += 500
    }

    return prioridad
  }

  private generarFranjasHorarias(): { dia: DiaSemanaValor; hora_inicio: string; hora_fin: string }[] {
    const dias: DiaSemanaValor[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
    const franjas: { dia: DiaSemanaValor; hora_inicio: string; hora_fin: string }[] = []

    for (const dia of dias) {
      for (let hora = 7; hora < 13; hora++) {
        franjas.push({
          dia,
          hora_inicio: `${hora.toString().padStart(2, '0')}:00`,
          hora_fin: `${(hora + 1).toString().padStart(2, '0')}:00`,
        })
      }
      for (let hora = 14; hora < 20; hora++) {
        franjas.push({
          dia,
          hora_inicio: `${hora.toString().padStart(2, '0')}:00`,
          hora_fin: `${(hora + 1).toString().padStart(2, '0')}:00`,
        })
      }
    }

    return franjas
  }

  async generarHorario(_ciclo: string): Promise<ResultadoGeneracion> {
    const conflictos: string[] = []
    const advertencias: string[] = []
    const asignaciones: Asignacion[] = []

    const docentes = (await this.prisma.docente.findMany({
      where: { activo: true },
      include: {
        cursos_asignados: {
          include: { curso: true },
        },
        disponibilidades: true,
      },
    })) as DocenteConRelaciones[]

    const ambientes = await this.prisma.ambiente.findMany({
      where: { activo: true },
    })

    const aulas = ambientes.filter((a: Ambiente) => a.tipo === 'AULA')
    const laboratorios = ambientes.filter((a: Ambiente) => a.tipo === 'LABORATORIO')

    const docentesOrdenados = [...docentes].sort(
      (a: DocenteConRelaciones, b: DocenteConRelaciones) =>
        this.calcularPrioridad(b) - this.calcularPrioridad(a)
    )

    const franjas = this.generarFranjasHorarias()

    for (const docente of docentesOrdenados) {
      for (const cursoAsignado of docente.cursos_asignados) {
        const curso = cursoAsignado.curso

        let horasTeoriaAsignadas = 0
        for (const franja of franjas) {
          if (horasTeoriaAsignadas >= curso.horas_teoria) break

          const aulaDisponible = aulas.find((aula: Ambiente) =>
            !asignaciones.some(
              (asig: Asignacion) =>
                asig.ambiente_id === aula.id &&
                asig.dia === franja.dia &&
                asig.hora_inicio < franja.hora_fin &&
                asig.hora_fin > franja.hora_inicio
            )
          )

          if (!aulaDisponible) continue

          const docenteOcupado = asignaciones.some(
            (asig: Asignacion) =>
              asig.docente_id === docente.id &&
              asig.dia === franja.dia &&
              asig.hora_inicio < franja.hora_fin &&
              asig.hora_fin > franja.hora_inicio
          )

          if (docenteOcupado) continue

          asignaciones.push({
            curso_id: curso.id,
            docente_id: docente.id,
            ambiente_id: aulaDisponible.id,
            dia: franja.dia,
            hora_inicio: franja.hora_inicio,
            hora_fin: franja.hora_fin,
            tipo: 'AULA',
          })
          horasTeoriaAsignadas++
        }

        let horasLabAsignadas = 0
        for (const franja of franjas) {
          if (horasLabAsignadas >= curso.horas_laboratorio) break

          const labDisponible = laboratorios.find((lab: Ambiente) =>
            !asignaciones.some(
              (asig: Asignacion) =>
                asig.ambiente_id === lab.id &&
                asig.dia === franja.dia &&
                asig.hora_inicio < franja.hora_fin &&
                asig.hora_fin > franja.hora_inicio
            )
          )

          if (!labDisponible) continue

          const docenteOcupado = asignaciones.some(
            (asig: Asignacion) =>
              asig.docente_id === docente.id &&
              asig.dia === franja.dia &&
              asig.hora_inicio < franja.hora_fin &&
              asig.hora_fin > franja.hora_inicio
          )

          if (docenteOcupado) continue

          asignaciones.push({
            curso_id: curso.id,
            docente_id: docente.id,
            ambiente_id: labDisponible.id,
            dia: franja.dia,
            hora_inicio: franja.hora_inicio,
            hora_fin: franja.hora_fin,
            tipo: 'LABORATORIO',
          })
          horasLabAsignadas++
        }

        if (horasTeoriaAsignadas < curso.horas_teoria) {
          advertencias.push(
            `No se pudieron asignar todas las horas de teoría para ${curso.nombre} con ${docente.nombres} ${docente.apellidos}`
          )
        }

        if (horasLabAsignadas < curso.horas_laboratorio) {
          advertencias.push(
            `No se pudieron asignar todas las horas de laboratorio para ${curso.nombre} con ${docente.nombres} ${docente.apellidos}`
          )
        }
      }
    }

    return { asignaciones, conflictos, advertencias }
  }
}
