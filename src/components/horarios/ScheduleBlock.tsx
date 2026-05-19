import { cn } from '@/lib/utils'
import type { HorarioConRelaciones } from '@/types'
import { FlaskConical, BookOpen } from 'lucide-react'

const colorCiclo: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  2: { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-900' },
  3: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900' },
  4: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-900' },
  5: { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-900' },
  6: { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-900' },
  7: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
  8: { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
  9: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900' },
  10: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
}

const defaultColor = { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-900' }

interface ScheduleBlockProps {
  horario: HorarioConRelaciones
  height: number
  hasConflict?: boolean
  onClick?: () => void
}

export function ScheduleBlock({ horario, height, hasConflict, onClick }: ScheduleBlockProps) {
  const color = colorCiclo[horario.curso.ciclo] ?? defaultColor
  const isCompact = height <= 1

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute inset-x-0.5 rounded-md border px-1.5 py-1 text-left transition-all hover:shadow-md hover:brightness-95 cursor-pointer overflow-hidden z-10',
        color.bg,
        color.border,
        color.text,
        hasConflict && 'ring-2 ring-red-500 border-red-500 animate-pulse'
      )}
      style={{ height: `calc(${height * 100}% - 2px)` }}
      title={`${horario.curso.nombre}\n${horario.docente.apellidos}, ${horario.docente.nombres}\n${horario.ambiente.codigo} - ${horario.ambiente.nombre}\n${horario.hora_inicio} - ${horario.hora_fin}`}
    >
      <div className="flex items-start gap-1">
        <span className="text-[10px] font-bold truncate leading-tight flex-1">
          {horario.curso.codigo}
        </span>
        {horario.tipo === 'LABORATORIO' ? (
          <FlaskConical className="h-3 w-3 shrink-0 opacity-60" />
        ) : (
          <BookOpen className="h-3 w-3 shrink-0 opacity-60" />
        )}
      </div>
      {!isCompact && (
        <>
          <p className="text-[10px] leading-tight truncate opacity-80">
            {horario.curso.nombre}
          </p>
          <p className="text-[10px] leading-tight truncate opacity-70 mt-0.5">
            {horario.docente.apellidos}
          </p>
          <p className="text-[10px] leading-tight truncate opacity-60">
            {horario.ambiente.codigo}
          </p>
        </>
      )}
    </button>
  )
}

export { colorCiclo }
