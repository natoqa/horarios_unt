import { useMemo } from 'react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { CICLOS_ACADEMICOS, getCiclosCursoPorPeriodo } from '@/lib/constants'
import { X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Curso, Docente, Ambiente } from '@/types'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const DIAS_FILTRO = [
  { value: 'LUNES', label: 'Lun' },
  { value: 'MARTES', label: 'Mar' },
  { value: 'MIERCOLES', label: 'Mié' },
  { value: 'JUEVES', label: 'Jue' },
  { value: 'VIERNES', label: 'Vie' },
]

export interface FiltrosHorario {
  cicloAcademico: string
  cicloCurso: string
  docenteId: string
  ambienteId: string
  tipo: string
  dia: string
}

interface ScheduleFiltersProps {
  filtros: FiltrosHorario
  onChange: (filtros: FiltrosHorario) => void
  docentes?: Docente[]
  ambientes?: Ambiente[]
}

export function ScheduleFilters({ filtros, onChange, docentes, ambientes }: ScheduleFiltersProps) {
  const ciclosCurso = useMemo(() => {
    const numeros = getCiclosCursoPorPeriodo(filtros.cicloAcademico)
    return numeros.map((n) => ({ value: String(n), label: `Ciclo ${ROMAN[n - 1]}` }))
  }, [filtros.cicloAcademico])

  const update = (partial: Partial<FiltrosHorario>) => {
    if (partial.cicloAcademico && partial.cicloAcademico !== filtros.cicloAcademico) {
      partial.cicloCurso = ''
    }
    onChange({ ...filtros, ...partial })
  }

  const hasActiveFilters =
    filtros.cicloCurso || filtros.docenteId || filtros.ambienteId || filtros.tipo || filtros.dia

  const clearFilters = () => {
    onChange({
      ...filtros,
      cicloCurso: '',
      docenteId: '',
      ambienteId: '',
      tipo: '',
      dia: '',
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-36">
          <Select
            label="Ciclo acad."
            value={filtros.cicloAcademico}
            onChange={(e) => update({ cicloAcademico: e.target.value })}
            options={CICLOS_ACADEMICOS.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <div className="w-36">
          <Select
            label="Ciclo curso"
            value={filtros.cicloCurso}
            onChange={(e) => update({ cicloCurso: e.target.value })}
            options={ciclosCurso}
            placeholder="Todos"
          />
        </div>
        <div className="w-52">
          <Select
            label="Docente"
            value={filtros.docenteId}
            onChange={(e) => update({ docenteId: e.target.value })}
            options={
              docentes?.map((d) => ({
                value: d.id,
                label: `${d.apellidos}, ${d.nombres}`,
              })) ?? []
            }
            placeholder="Todos"
          />
        </div>
        <div className="w-44">
          <Select
            label="Ambiente"
            value={filtros.ambienteId}
            onChange={(e) => update({ ambienteId: e.target.value })}
            options={
              ambientes?.map((a) => ({
                value: a.id,
                label: `${a.codigo} - ${a.nombre}`,
              })) ?? []
            }
            placeholder="Todos"
          />
        </div>
        <div className="w-36">
          <Select
            label="Tipo"
            value={filtros.tipo}
            onChange={(e) => update({ tipo: e.target.value })}
            options={[
              { value: 'AULA', label: 'Teoria' },
              { value: 'LABORATORIO', label: 'Laboratorio' },
            ]}
            placeholder="Todos"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
            <X className="mr-1 h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Chips de dia */}
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <div className="flex gap-1">
          {DIAS_FILTRO.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => update({ dia: filtros.dia === d.value ? '' : d.value })}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filtros.dia === d.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
