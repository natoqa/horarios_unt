export const DIAS_SEMANA = [
    { value: 'LUNES', label: 'Lunes' },
    { value: 'MARTES', label: 'Martes' },
    { value: 'MIERCOLES', label: 'Miércoles' },
    { value: 'JUEVES', label: 'Jueves' },
    { value: 'VIERNES', label: 'Viernes' },
    { value: 'SABADO', label: 'Sábado' },
  ]
  
  export const CATEGORIAS_DOCENTE = [
    { value: 'PRINCIPAL', label: 'Principal' },
    { value: 'ASOCIADO', label: 'Asociado' },
    { value: 'AUXILIAR', label: 'Auxiliar' },
    { value: 'JEFE_PRACTICA', label: 'Jefe de Práctica' },
  ]
  
  export const TIPOS_DOCENTE = [
    { value: 'NOMBRADO', label: 'Nombrado' },
    { value: 'CONTRATADO', label: 'Contratado' },
  ]
  
  export const TIPOS_AMBIENTE = [
    { value: 'AULA', label: 'Aula' },
    { value: 'LABORATORIO', label: 'Laboratorio' },
  ]

  export const ESCUELAS = [
    { value: 'Ingeniería de Sistemas', label: 'Ingeniería de Sistemas' },
    { value: 'Ingeniería Industrial', label: 'Ingeniería Industrial' },
    { value: 'Ingeniería Mecánica', label: 'Ingeniería Mecánica' },
    { value: 'Ingeniería de Materiales', label: 'Ingeniería de Materiales' },
    { value: 'Ingeniería Metalúrgica', label: 'Ingeniería Metalúrgica' },
    { value: 'Matemáticas', label: 'Matemáticas' },
    { value: 'Estadística', label: 'Estadística' },
    { value: 'Física', label: 'Física' },
    { value: 'Informática', label: 'Informática' },
  ]

  export const DEPARTAMENTOS_CURSO = [
    { value: 'Ingeniería de Sistemas', label: 'Ingeniería de Sistemas (carrera)' },
    { value: 'Matemáticas', label: 'Matemáticas' },
    { value: 'Estadística', label: 'Estadística' },
    { value: 'Física', label: 'Física' },
    { value: 'Economía', label: 'Economía' },
    { value: 'Contabilidad y Finanzas', label: 'Contabilidad y Finanzas' },
    { value: 'Ciencias Ambientales', label: 'Ciencias Ambientales' },
    { value: 'Ciencias Sociales', label: 'Ciencias Sociales' },
    { value: 'Idiomas', label: 'Idiomas' },
  ]
  
  export const CICLOS_ACADEMICOS = [
    '2026-I',
    '2026-II',
    '2026-Nivelacion',
    '2027-I',
    '2027-II',
    '2027-Nivelacion',
    '2028-I',
    '2028-II',
  ] as const

  export const CICLO_ACADEMICO_DEFAULT = '2026-I'

  /**
   * En la UNT, el periodo I (primer semestre) dicta ciclos impares (1,3,5,7,9)
   * y el periodo II dicta ciclos pares (2,4,6,8,10).
   * Nivelacion puede incluir cualquier ciclo.
   */
  export function getCiclosCursoPorPeriodo(cicloAcademico: string): number[] {
    if (cicloAcademico.endsWith('-I')) {
      return [1, 3, 5, 7, 9]
    }
    if (cicloAcademico.endsWith('-II')) {
      return [2, 4, 6, 8, 10]
    }
    // Nivelacion: todos los ciclos
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
  
  export const ESTADOS_HORARIO = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
    { value: 'TEMPORAL', label: 'Temporal' },
  ]
  
  export const ROLES_USUARIO = [
    { value: 'ADMINISTRADOR', label: 'Administrador' },
    { value: 'COORDINADOR', label: 'Coordinador' },
    { value: 'DOCENTE', label: 'Docente' },
  ]
  