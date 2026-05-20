import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { nombreDia, formatearHora } from '@/lib/utils'
import type { HorarioConRelaciones } from '@/types'
import {
  BookOpen,
  User,
  MapPin,
  Clock,
  Calendar,
  FlaskConical,
  GraduationCap,
  Trash2,
  Pencil,
} from 'lucide-react'

interface HorarioDetailModalProps {
  horario: HorarioConRelaciones | null
  open: boolean
  onClose: () => void
  onDelete?: (id: string) => void
  onEdit?: (horario: HorarioConRelaciones) => void
}

const romanoCiclo: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
}

export function HorarioDetailModal({ horario, open, onClose, onDelete, onEdit }: HorarioDetailModalProps) {
  if (!horario) return null

  return (
    <Modal open={open} onClose={onClose} title="Detalle del horario" size="md">
      <div className="space-y-5">
        {/* Curso */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <BookOpen className="h-4.5 w-4.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Curso</p>
            <p className="text-sm font-semibold text-gray-900">{horario.curso.nombre}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gray-500">{horario.curso.codigo}</span>
              <Badge variant="info">
                Ciclo {romanoCiclo[horario.curso.ciclo] ?? horario.curso.ciclo}
              </Badge>
              <Badge variant={horario.tipo === 'LABORATORIO' ? 'warning' : 'default'}>
                {horario.tipo === 'LABORATORIO' ? (
                  <><FlaskConical className="mr-1 h-3 w-3" />Laboratorio</>
                ) : (
                  <><GraduationCap className="mr-1 h-3 w-3" />Teoria</>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Docente */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <User className="h-4.5 w-4.5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Docente</p>
            <p className="text-sm font-semibold text-gray-900">
              {horario.docente.apellidos}, {horario.docente.nombres}
            </p>
            <p className="text-xs text-gray-500">{horario.docente.correo}</p>
          </div>
        </div>

        {/* Ambiente */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <MapPin className="h-4.5 w-4.5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Ambiente</p>
            <p className="text-sm font-semibold text-gray-900">
              {horario.ambiente.codigo} - {horario.ambiente.nombre}
            </p>
            <p className="text-xs text-gray-500">
              Capacidad: {horario.ambiente.capacidad} alumnos
              {horario.ambiente.ubicacion && ` | ${horario.ambiente.ubicacion}`}
            </p>
          </div>
        </div>

        {/* Horario */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Horario</p>
            <p className="text-sm font-semibold text-gray-900">
              {nombreDia(horario.dia)} {formatearHora(horario.hora_inicio)} — {formatearHora(horario.hora_fin)}
            </p>
            <p className="text-xs text-gray-500">Ciclo academico: {horario.ciclo_academico}</p>
          </div>
        </div>

        {/* Acciones */}
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(horario)}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Desactivar este horario?')) {
                    onDelete(horario.id)
                    onClose()
                  }
                }}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Eliminar
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
