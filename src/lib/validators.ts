import { z } from 'zod'
import { CategoriaDocente, TipoDocente, DiaSemana, TipoAmbiente } from '@/lib/prisma-types'

export const docenteSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(20, 'Máximo 20 caracteres'),
  nombres: z.string().min(2, 'Nombre muy corto').max(100, 'Máximo 100 caracteres'),
  apellidos: z.string().min(2, 'Apellidos muy cortos').max(100, 'Máximo 100 caracteres'),
  correo: z.string().email('Correo inválido'),
  telefono: z.string().max(15, 'Máximo 15 caracteres').optional().or(z.literal('')),
  categoria: z.nativeEnum(CategoriaDocente),
  tipo: z.nativeEnum(TipoDocente),
  antiguedad: z.number().min(0, 'No puede ser negativo').max(50, 'Máximo 50 años'),
  escuela: z.string().min(1, 'La escuela es requerida').max(100).default('Ingeniería de Sistemas'),
})

export const cursoSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(10),
  nombre: z.string().min(3, 'Nombre muy corto').max(200),
  creditos: z.number().min(1, 'Mínimo 1 crédito').max(8, 'Máximo 8 créditos'),
  horas_teoria: z.number().min(0).max(40),
  horas_laboratorio: z.number().min(0).max(40),
  horas_practica: z.number().min(0).max(40),
  ciclo: z.number().min(1).max(10),
  plan_estudios: z.string().default('2018'),
})

export const ambienteSchema = z.object({
  codigo: z.string().min(1).max(20),
  nombre: z.string().min(3).max(100),
  tipo: z.nativeEnum(TipoAmbiente),
  capacidad: z.number().min(1).max(200),
  ubicacion: z.string().max(200).optional().or(z.literal('')),
  piso: z.number().min(1).max(10).optional().nullable(),
})

export const horarioSchema = z.object({
  curso_id: z.string().min(1),
  docente_id: z.string().min(1),
  ambiente_id: z.string().min(1),
  dia: z.nativeEnum(DiaSemana),
  hora_inicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm requerido'),
  hora_fin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm requerido'),
  tipo: z.nativeEnum(TipoAmbiente),
  ciclo_academico: z.string().default('2024-I'),
})

export const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  correo: z.string().email('Correo inválido'),
  contrasena: z.string().min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúsculas')
    .regex(/[a-z]/, 'Debe contener minúsculas')
    .regex(/[0-9]/, 'Debe contener números'),
  confirmarContrasena: z.string(),
  nombre: z.string().min(2),
  apellidos: z.string().min(2),
}).refine(data => data.contrasena === data.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
})

export type DocenteFormData = z.infer<typeof docenteSchema>
export type CursoFormData = z.infer<typeof cursoSchema>
export type AmbienteFormData = z.infer<typeof ambienteSchema>
export type HorarioFormData = z.infer<typeof horarioSchema>
