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
import { getCiclosCursoPorPeriodo } from '@/lib/constants'

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

const DIAS: DiaSemanaValor[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
const HORAS_MANANA = [7, 8, 9, 10, 11, 12]
const HORAS_TARDE = [14, 15, 16, 17, 18, 19]
const TODAS_LAS_HORAS = [...HORAS_MANANA, ...HORAS_TARDE]
const MAX_HORAS_CONSECUTIVAS = 4

function horaStr(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`
}

function horaNum(s: string): number {
  return parseInt(s.split(':')[0])
}

export class HorarioGenerator {
  private prisma: PrismaClient
  private cursosCicloMap: Map<string, number> = new Map()

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
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

  /**
   * Distribuye las horas en bloques. Nunca produce bloques de 1h
   * a menos que el total sea exactamente 1h.
   * Ejemplo: 3h=[3], 4h=[2,2], 5h=[3,2], 6h=[3,3]
   */
  private calcularDistribucionBloques(horas: number): number[] {
    if (horas <= 0) return []
    if (horas <= 4) return [horas]
    if (horas === 5) return [3, 2]
    if (horas === 6) return [3, 3]
    if (horas === 7) return [4, 3]
    if (horas === 8) return [4, 4]

    const bloques: number[] = []
    let restantes = horas
    while (restantes > 0) {
      if (restantes >= 4) {
        bloques.push(4)
        restantes -= 4
      } else if (restantes >= 2) {
        bloques.push(restantes)
        restantes = 0
      } else {
        bloques.push(restantes)
        restantes = 0
      }
    }
    return bloques
  }

  private docenteDisponibleEnRango(
    docente: DocenteConRelaciones,
    dia: DiaSemanaValor,
    horaInicio: number,
    horaFin: number
  ): boolean {
    if (docente.disponibilidades.length === 0) return true

    return docente.disponibilidades.some(
      (d) =>
        d.dia === dia &&
        d.hora_inicio <= horaStr(horaInicio) &&
        d.hora_fin >= horaStr(horaFin)
    )
  }

  /**
   * Verifica si un rango de horas colisiona con asignaciones existentes.
   * Funciona con bloques multi-hora (ej: 07:00-09:00).
   */
  private rangoOcupado(
    asignaciones: Asignacion[],
    campo: 'docente_id' | 'ambiente_id',
    id: string,
    dia: DiaSemanaValor,
    horaInicio: number,
    horaFin: number
  ): boolean {
    const inicio = horaStr(horaInicio)
    const fin = horaStr(horaFin)
    return asignaciones.some(
      (a) =>
        a[campo] === id &&
        a.dia === dia &&
        a.hora_inicio < fin &&
        a.hora_fin > inicio
    )
  }

  /**
   * Verifica que un docente no tenga mas de MAX_HORAS_CONSECUTIVAS seguidas.
   * Soporta bloques multi-hora existentes.
   */
  private excederiaHorasConsecutivas(
    asignaciones: Asignacion[],
    docenteId: string,
    dia: DiaSemanaValor,
    horaInicio: number,
    horaFin: number
  ): boolean {
    const rangos = asignaciones
      .filter((a) => a.docente_id === docenteId && a.dia === dia)
      .map((a) => ({ inicio: horaNum(a.hora_inicio), fin: horaNum(a.hora_fin) }))

    rangos.push({ inicio: horaInicio, fin: horaFin })
    rangos.sort((a, b) => a.inicio - b.inicio)

    let consecutivas = 0
    let prevFin = -1
    for (const r of rangos) {
      if (prevFin === r.inicio) {
        consecutivas += r.fin - r.inicio
      } else {
        consecutivas = r.fin - r.inicio
      }
      if (consecutivas > MAX_HORAS_CONSECUTIVAS) return true
      prevFin = r.fin
    }

    return false
  }

  /**
   * Verifica que no haya colision con otros cursos del mismo ciclo.
   */
  private colisionaConMismoCiclo(
    asignaciones: Asignacion[],
    cursoId: string,
    dia: DiaSemanaValor,
    horaInicio: number,
    horaFin: number
  ): boolean {
    const cicloCurso = this.cursosCicloMap.get(cursoId)
    if (cicloCurso === undefined) return false

    const inicio = horaStr(horaInicio)
    const fin = horaStr(horaFin)

    return asignaciones.some((a) => {
      if (a.curso_id === cursoId) return false
      const cicloOtro = this.cursosCicloMap.get(a.curso_id)
      if (cicloOtro !== cicloCurso) return false
      return a.dia === dia && a.hora_inicio < fin && a.hora_fin > inicio
    })
  }

  /**
   * Busca N horas consecutivas en un dia y retorna UNA asignacion
   * con hora_inicio y hora_fin que abarcan todo el bloque.
   * Ej: bloque de 2h -> { hora_inicio: "07:00", hora_fin: "09:00" }
   */
  private buscarBloqueConsecutivo(
    docente: DocenteConRelaciones,
    curso: Curso,
    dia: DiaSemanaValor,
    tamanoBloque: number,
    ambientes: Ambiente[],
    asignaciones: Asignacion[],
    tipo: TipoAmbienteValor
  ): Asignacion | null {
    for (let i = 0; i <= TODAS_LAS_HORAS.length - tamanoBloque; i++) {
      const horasBloque = TODAS_LAS_HORAS.slice(i, i + tamanoBloque)

      // Verificar que las horas sean realmente consecutivas
      const sonConsecutivas = horasBloque.every((h, idx) => {
        if (idx === 0) return true
        return h === horasBloque[idx - 1] + 1
      })
      if (!sonConsecutivas) continue

      // No cruzar la hora de almuerzo (12-14)
      const cruzaAlmuerzo = horasBloque.some((h) => h === 13)
      if (cruzaAlmuerzo) continue
      const tieneManana = horasBloque.some((h) => h <= 12)
      const tieneTarde = horasBloque.some((h) => h >= 14)
      if (tieneManana && tieneTarde) continue

      const horaInicio = horasBloque[0]
      const horaFin = horasBloque[horasBloque.length - 1] + 1

      if (!this.docenteDisponibleEnRango(docente, dia, horaInicio, horaFin)) continue
      if (this.rangoOcupado(asignaciones, 'docente_id', docente.id, dia, horaInicio, horaFin)) continue
      if (this.excederiaHorasConsecutivas(asignaciones, docente.id, dia, horaInicio, horaFin)) continue
      if (this.colisionaConMismoCiclo(asignaciones, curso.id, dia, horaInicio, horaFin)) continue

      const ambienteLibre = ambientes.find(
        (amb) => !this.rangoOcupado(asignaciones, 'ambiente_id', amb.id, dia, horaInicio, horaFin)
      )
      if (!ambienteLibre) continue

      return {
        curso_id: curso.id,
        docente_id: docente.id,
        ambiente_id: ambienteLibre.id,
        dia,
        hora_inicio: horaStr(horaInicio),
        hora_fin: horaStr(horaFin),
        tipo,
      }
    }

    return null
  }

  /**
   * Intenta asignar horas en bloques consecutivos en dias diferentes.
   * Si no puede con el tamano ideal, intenta bloques mas pequenos (min 2h).
   */
  private intentarAsignarEnBloques(
    docente: DocenteConRelaciones,
    curso: Curso,
    tipo: TipoAmbienteValor,
    horasRequeridas: number,
    ambientes: Ambiente[],
    asignaciones: Asignacion[]
  ): { asignadas: number; mensajes: string[] } {
    const bloques = this.calcularDistribucionBloques(horasRequeridas)
    const mensajes: string[] = []
    let horasAsignadas = 0
    const diasUsados = new Set<DiaSemanaValor>()

    for (const tamano of bloques) {
      let asignado = false

      // Priorizar dias no usados para distribuir la carga
      const diasOrdenados = [
        ...DIAS.filter((d) => !diasUsados.has(d)),
        ...DIAS.filter((d) => diasUsados.has(d)),
      ]

      // Intentar con el tamano ideal
      for (const dia of diasOrdenados) {
        const resultado = this.buscarBloqueConsecutivo(
          docente, curso, dia, tamano, ambientes, asignaciones, tipo
        )
        if (resultado) {
          asignaciones.push(resultado)
          horasAsignadas += tamano
          diasUsados.add(dia)
          asignado = true
          break
        }
      }

      if (asignado) continue

      // Fallback: intentar bloques mas pequenos (pero minimo 2h)
      let restantes = tamano
      while (restantes >= 2) {
        const subTamano = Math.min(restantes, 2)
        let subAsignado = false

        for (const dia of diasOrdenados) {
          const resultado = this.buscarBloqueConsecutivo(
            docente, curso, dia, subTamano, ambientes, asignaciones, tipo
          )
          if (resultado) {
            asignaciones.push(resultado)
            horasAsignadas += subTamano
            restantes -= subTamano
            diasUsados.add(dia)
            subAsignado = true
            break
          }
        }

        if (!subAsignado) break
      }

      if (restantes > 0 && restantes < tamano) {
        mensajes.push(
          `${curso.nombre}: bloque de ${tamano}h no disponible, se asignaron bloques mas cortos`
        )
      }
    }

    if (horasAsignadas < horasRequeridas) {
      const tipoLabel = tipo === 'AULA' ? 'teoria' : 'laboratorio'
      mensajes.push(
        `${curso.nombre}: solo ${horasAsignadas}/${horasRequeridas}h de ${tipoLabel} asignadas a ${docente.nombres} ${docente.apellidos}`
      )
    }

    return { asignadas: horasAsignadas, mensajes }
  }

  async generarHorario(ciclo: string, forzar = false): Promise<ResultadoGeneracion> {
    const conflictos: string[] = []
    const advertencias: string[] = []
    const asignaciones: Asignacion[] = []
    let preExistentes = 0

    const horariosExistentes = await this.prisma.horario.findMany({
      where: { ciclo_academico: ciclo, estado: 'ACTIVO' },
      include: { curso: true },
    })

    if (!forzar) {
      for (const h of horariosExistentes) {
        asignaciones.push({
          curso_id: h.curso_id,
          docente_id: h.docente_id,
          ambiente_id: h.ambiente_id,
          dia: h.dia as DiaSemanaValor,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          tipo: h.tipo as TipoAmbienteValor,
        })
      }
      preExistentes = asignaciones.length

      if (preExistentes > 0) {
        advertencias.push(
          `${preExistentes} bloque(s) existentes respetados (use "forzar" para regenerar)`
        )
      }
    }

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

    const todosCursos = await this.prisma.curso.findMany({
      where: { activo: true },
      select: { id: true, ciclo: true },
    })
    this.cursosCicloMap = new Map(todosCursos.map((c) => [c.id, c.ciclo]))

    const docentesOrdenados = [...docentes].sort(
      (a: DocenteConRelaciones, b: DocenteConRelaciones) =>
        this.calcularPrioridad(b) - this.calcularPrioridad(a)
    )

    // Filtrar cursos segun paridad del ciclo academico
    // 2026-I -> ciclos impares (1,3,5,7,9), 2026-II -> ciclos pares (2,4,6,8,10)
    const ciclosValidos = getCiclosCursoPorPeriodo(ciclo)
    const ciclosValidosSet = new Set(ciclosValidos)

    const docentesSinDisponibilidad: string[] = []
    const docentesSinCursos: string[] = []

    for (const docente of docentesOrdenados) {
      const cursosDelPeriodo = docente.cursos_asignados.filter(
        (ca) => ciclosValidosSet.has(ca.curso.ciclo)
      )

      if (cursosDelPeriodo.length === 0) {
        if (docente.cursos_asignados.length > 0) continue
        docentesSinCursos.push(`${docente.nombres} ${docente.apellidos}`)
        continue
      }

      if (docente.disponibilidades.length === 0) {
        docentesSinDisponibilidad.push(`${docente.nombres} ${docente.apellidos}`)
      }

      for (const cursoAsignado of cursosDelPeriodo) {
        const curso = cursoAsignado.curso

        if (curso.horas_teoria > 0) {
          const resultado = this.intentarAsignarEnBloques(
            docente, curso, 'AULA', curso.horas_teoria, aulas, asignaciones
          )
          advertencias.push(...resultado.mensajes)
        }

        if (curso.horas_laboratorio > 0) {
          if (laboratorios.length === 0) {
            conflictos.push(`${curso.nombre}: requiere laboratorio pero no hay laboratorios disponibles`)
            continue
          }
          const resultado = this.intentarAsignarEnBloques(
            docente, curso, 'LABORATORIO', curso.horas_laboratorio, laboratorios, asignaciones
          )
          advertencias.push(...resultado.mensajes)
        }
      }
    }

    if (docentesSinDisponibilidad.length > 0) {
      advertencias.push(
        `${docentesSinDisponibilidad.length} docente(s) sin disponibilidad registrada (se asignaron en cualquier franja): ${docentesSinDisponibilidad.join(', ')}`
      )
    }

    if (docentesSinCursos.length > 0) {
      advertencias.push(
        `${docentesSinCursos.length} docente(s) activos sin cursos asignados: ${docentesSinCursos.join(', ')}`
      )
    }

    const nuevasAsignaciones = asignaciones.slice(preExistentes)

    return { asignaciones: nuevasAsignaciones, conflictos, advertencias }
  }
}
