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
  
  /** Ciclos académicos ordenados cronológicamente (año → periodo) */
  export const CICLOS_ACADEMICOS = [
    '2024-I',
    '2024-II',
    '2024-Nivelación',
    '2025-I',
    '2025-II',
    '2025-Nivelación',
    '2026-I',
    '2026-Nivelación',
  ] as const

  export const CICLO_ACADEMICO_DEFAULT = CICLOS_ACADEMICOS[0]
  
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
  