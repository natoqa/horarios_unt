import { useMemo } from 'react'
import { cn, nombreDia } from '@/lib/utils'
import { ScheduleBlock } from './ScheduleBlock'
import type { HorarioConRelaciones } from '@/types'

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const

const HORAS_MANANA = [7, 8, 9, 10, 11, 12]
const HORAS_TARDE = [14, 15, 16, 17, 18, 19]
const TODAS_LAS_HORAS = [...HORAS_MANANA, ...HORAS_TARDE]

const ROW_HEIGHT = 56

function horaToIndex(hora: string): number {
  const h = parseInt(hora.split(':')[0])
  return TODAS_LAS_HORAS.indexOf(h)
}

function horaSpan(inicio: string, fin: string): number {
  const hi = parseInt(inicio.split(':')[0])
  const hf = parseInt(fin.split(':')[0])
  let count = 0
  for (let h = hi; h < hf; h++) {
    if (TODAS_LAS_HORAS.includes(h)) count++
  }
  return Math.max(count, 1)
}

interface WeeklyGridProps {
  horarios: HorarioConRelaciones[]
  onClickHorario?: (horario: HorarioConRelaciones) => void
  conflictIds?: Set<string>
  filterDia?: string
}

export function WeeklyGrid({ horarios, onClickHorario, conflictIds, filterDia }: WeeklyGridProps) {
  const diasVisibles = filterDia
    ? DIAS.filter((d) => d === filterDia)
    : DIAS

  const horariosPorDiaHora = useMemo(() => {
    const map = new Map<string, HorarioConRelaciones[]>()
    for (const h of horarios) {
      const idx = horaToIndex(h.hora_inicio)
      if (idx === -1) continue
      const key = `${h.dia}_${idx}`
      const list = map.get(key) ?? []
      list.push(h)
      map.set(key, list)
    }
    return map
  }, [horarios])

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: filterDia ? 400 : 700 }}>
          <thead>
            <tr>
              <th className="w-20 p-2 text-xs font-medium text-gray-400 border-b border-r border-gray-200 bg-gray-50 sticky left-0 z-20">
                Hora
              </th>
              {diasVisibles.map((dia) => (
                <th
                  key={dia}
                  className="p-2 text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50 text-center"
                  style={{ width: `${100 / diasVisibles.length}%` }}
                >
                  {nombreDia(dia)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TODAS_LAS_HORAS.map((hora, rowIdx) => {
              const isLunchBorder = hora === 14
              const label = `${hora.toString().padStart(2, '0')}:00`
              const labelFin = `${(hora + 1).toString().padStart(2, '0')}:00`

              return (
                <tr
                  key={hora}
                  className={cn(isLunchBorder && 'border-t-2 border-t-orange-200')}
                >
                  <td
                    className={cn(
                      'px-2 py-0 text-[11px] font-mono text-gray-400 border-r border-b border-gray-100 bg-gray-50/60 sticky left-0 z-20 align-top whitespace-nowrap'
                    )}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span className="block pt-1">{label}</span>
                    <span className="block text-[9px] text-gray-300">{labelFin}</span>
                  </td>
                  {diasVisibles.map((dia) => {
                    const key = `${dia}_${rowIdx}`
                    const bloquesAqui = horariosPorDiaHora.get(key) ?? []

                    return (
                      <td
                        key={dia}
                        className="border-b border-gray-100 p-0 align-top"
                        style={{ height: ROW_HEIGHT, position: 'relative' }}
                      >
                        {bloquesAqui.map((h, i) => {
                          const span = horaSpan(h.hora_inicio, h.hora_fin)
                          return (
                            <ScheduleBlock
                              key={h.id}
                              horario={h}
                              height={span}
                              hasConflict={conflictIds?.has(h.id)}
                              onClick={() => onClickHorario?.(h)}
                            />
                          )
                        })}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-500">
        <span className="font-medium text-gray-600 mr-1">Ciclo:</span>
        {(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']).map((label, i) => {
          const colors = [
            'bg-blue-200', 'bg-violet-200', 'bg-emerald-200', 'bg-amber-200', 'bg-rose-200',
            'bg-cyan-200', 'bg-orange-200', 'bg-teal-200', 'bg-indigo-200', 'bg-pink-200',
          ]
          return (
            <span key={label} className="flex items-center gap-1">
              <span className={cn('w-2.5 h-2.5 rounded-sm', colors[i])} />
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
