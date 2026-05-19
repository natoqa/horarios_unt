import type {
  Docente,
  Curso,
  Ambiente,
  Horario,
  DisponibilidadDocente,
  CursoDocente,
  Usuario,
} from '@/lib/prisma-types'
import {
  CategoriaDocente,
  TipoDocente,
  TipoAmbiente,
  DiaSemana,
  EstadoHorario,
  RolUsuario,
} from '@/lib/prisma-types'
import type { HorarioFormData } from '@/lib/validators'

export type {
  Docente,
  Curso,
  Ambiente,
  Horario,
  DisponibilidadDocente,
  CursoDocente,
  Usuario,
}

export { CategoriaDocente, TipoDocente, TipoAmbiente, DiaSemana, EstadoHorario, RolUsuario }

export interface DocenteConRelaciones extends Docente {
  disponibilidades: DisponibilidadDocente[]
  cursos_asignados: (CursoDocente & { curso: Curso })[]
  usuario: Usuario | null
}

export interface CursoConRelaciones extends Curso {
  docentes: (CursoDocente & { docente: Docente })[]
  prerrequisitos: { prerrequisito: Curso }[]
}

export interface HorarioConRelaciones extends Horario {
  curso: Curso
  docente: Docente
  ambiente: Ambiente
}

export interface EstadisticasDashboard {
  totalDocentes: number
  totalCursos: number
  totalAulas: number
  totalLaboratorios: number
  totalHorarios: number
  porcentajeOcupacion: string
  docentesPorCategoria: { categoria: string; _count: number }[]
  cursosPorCiclo: { ciclo: number; _count: number }[]
  horariosPorDia: { dia: string; _count: number }[]
}

export interface ActividadReciente {
  id: string
  usuario: string
  accion: string
  entidad: string
  fecha: Date
}

export interface FiltrosDocente {
  categoria?: CategoriaDocente
  tipo?: TipoDocente
  activo?: boolean
  busqueda?: string
}

export interface FiltrosCurso {
  ciclo?: number
  activo?: boolean
  busqueda?: string
}

export interface FiltrosAmbiente {
  tipo?: TipoAmbiente
  activo?: boolean
  busqueda?: string
}

export interface ResultadoGeneracion {
  asignaciones: HorarioFormData[]
  conflictos: string[]
  advertencias: string[]
}

export interface SesionUsuario {
  user: {
    id: string
    correo: string
    nombre: string
    rol: RolUsuario
    docente_id: string | null
  }
  expires: string
}
