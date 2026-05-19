import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatearHora(hora: string): string {
  const [h, m] = hora.split(':')
  const horaNum = parseInt(h)
  const ampm = horaNum >= 12 ? 'PM' : 'AM'
  const hora12 = horaNum > 12 ? horaNum - 12 : horaNum
  return `${hora12}:${m} ${ampm}`
}

export function nombreDia(dia: string): string {
  const dias: Record<string, string> = {
    LUNES: 'Lunes',
    MARTES: 'Martes',
    MIERCOLES: 'Miércoles',
    JUEVES: 'Jueves',
    VIERNES: 'Viernes',
    SABADO: 'Sábado',
  }
  return dias[dia] || dia
}

export function getColorCategoria(categoria: string): string {
  const colores: Record<string, string> = {
    PRINCIPAL: 'bg-purple-100 text-purple-800',
    ASOCIADO: 'bg-blue-100 text-blue-800',
    AUXILIAR: 'bg-green-100 text-green-800',
    JEFE_PRACTICA: 'bg-orange-100 text-orange-800',
  }
  return colores[categoria] || 'bg-gray-100 text-gray-800'
}

export function getColorTipo(tipo: string): string {
  return tipo === 'NOMBRADO' 
    ? 'bg-emerald-100 text-emerald-800' 
    : 'bg-amber-100 text-amber-800'
}
