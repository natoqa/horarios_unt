export type {
  Docente,
  Curso,
  Ambiente,
  Horario,
  DisponibilidadDocente,
  CursoDocente,
  Usuario,
} from '@prisma/client'

export {
  CategoriaDocente,
  TipoDocente,
  TipoAmbiente,
  DiaSemana,
  EstadoHorario,
  RolUsuario,
} from '@prisma/client'

/** Tipos de enum (compatibles con el editor sin depender del client generado) */
export type DiaSemanaValor =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'

export type TipoAmbienteValor = 'AULA' | 'LABORATORIO'
