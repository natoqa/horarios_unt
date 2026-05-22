import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { WeeklyGrid } from '@/components/horarios/WeeklyGrid'
import { ScheduleFilters, type FiltrosHorario } from '@/components/horarios/ScheduleFilters'
import { HorarioDetailModal } from '@/components/horarios/HorarioDetailModal'
import { HorarioFormModal } from '@/components/horarios/HorarioFormModal'
import { trpc } from '@/lib/trpc'
import { nombreDia, formatearHora, cn } from '@/lib/utils'
import { CICLO_ACADEMICO_DEFAULT } from '@/lib/constants'
import type { HorarioConRelaciones } from '@/types'
import {
  Calendar,
  LayoutGrid,
  List,
  AlertTriangle,
  Plus,
  Download,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Vista = 'grilla' | 'tabla'

export default function HorariosPage() {
  const [vista, setVista] = useState<Vista>('grilla')
  const [filtros, setFiltros] = useState<FiltrosHorario>({
    cicloAcademico: CICLO_ACADEMICO_DEFAULT,
    cicloCurso: '',
    docenteId: '',
    ambienteId: '',
    tipo: '',
    dia: '',
  })
  const [selectedHorario, setSelectedHorario] = useState<HorarioConRelaciones | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingHorario, setEditingHorario] = useState<HorarioConRelaciones | null>(null)

  const { data: horarios, isLoading } = trpc.horario.getAll.useQuery({
    ciclo: filtros.cicloAcademico,
  })
  const { data: docentes } = trpc.docente.getAll.useQuery()
  const { data: conflictos } = trpc.horario.getConflictos.useQuery(filtros.cicloAcademico)

  const utils = trpc.useUtils()
  const deleteMutation = trpc.horario.delete.useMutation({
    onSuccess: () => {
      toast.success('Horario eliminado')
      utils.horario.getAll.invalidate()
      utils.horario.getConflictos.invalidate()
    },
    onError: (e) => toast.error(e.message),
  })

  const pdfMutation = trpc.reporte.generarHorarioGeneral.useMutation({
    onSuccess: (d) => {
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${d.archivo}`
      link.download = d.nombre
      link.click()
      toast.success('PDF descargado')
    },
    onError: (e) => toast.error(e.message),
  })

  const conflictHorarioIds = useMemo(() => {
    if (!conflictos || !horarios) return new Set<string>()
    const ids = new Set<string>()
    for (const c of conflictos) {
      for (const h of horarios) {
        if (h.dia !== c.dia) continue
        const overlaps = h.hora_inicio < c.hora_fin && h.hora_fin > c.hora_inicio
        if (!overlaps) continue
        if (c.tipo === 'DOCENTE' && `${h.docente.nombres} ${h.docente.apellidos}` === c.entidad_nombre) {
          ids.add(h.id)
        }
        if (c.tipo === 'AMBIENTE' && h.ambiente.nombre === c.entidad_nombre) {
          ids.add(h.id)
        }
      }
    }
    return ids
  }, [conflictos, horarios])

  const horariosFiltrados = useMemo(() => {
    if (!horarios) return []
    return horarios.filter((h) => {
      if (filtros.cicloCurso && h.curso.ciclo !== Number(filtros.cicloCurso)) return false
      if (filtros.docenteId && h.docente_id !== filtros.docenteId) return false
      if (filtros.ambienteId && h.ambiente_id !== filtros.ambienteId) return false
      if (filtros.tipo && h.tipo !== filtros.tipo) return false
      if (filtros.dia && h.dia !== filtros.dia) return false
      return true
    })
  }, [horarios, filtros])

  const ambientesUnicos = useMemo(() => {
    if (!horarios) return []
    const map = new Map<string, { id: string; codigo: string; nombre: string }>()
    for (const h of horarios) {
      if (!map.has(h.ambiente_id)) {
        map.set(h.ambiente_id, { id: h.ambiente_id, codigo: h.ambiente.codigo, nombre: h.ambiente.nombre })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.codigo.localeCompare(b.codigo))
  }, [horarios])

  const openDetail = (h: HorarioConRelaciones) => {
    setSelectedHorario(h)
    setModalOpen(true)
  }

  return (
    <Layout>
      <>
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Horarios</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {horariosFiltrados.length} bloques
              {filtros.cicloAcademico && ` — ciclo ${filtros.cicloAcademico}`}
              {conflictHorarioIds.size > 0 && (
                <span className="inline-flex items-center gap-1 ml-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {conflictHorarioIds.size} en conflicto
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle vista */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setVista('grilla')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  vista === 'grilla'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
                )}
                title="Vista grilla"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVista('tabla')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  vista === 'tabla'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
                )}
                title="Vista tabla"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="outline"
              disabled={pdfMutation.isLoading || !horariosFiltrados.length}
              onClick={() =>
                pdfMutation.mutate({
                  ciclo: filtros.cicloAcademico,
                  cicloCurso: filtros.cicloCurso ? parseInt(filtros.cicloCurso) : undefined,
                })
              }
            >
              {pdfMutation.isLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Descargar PDF
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setEditingHorario(null)
                setFormModalOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo horario
            </Button>

            <Link href="/horarios/generar">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Generar horarios
              </Button>
            </Link>
          </div>
        </header>

        {/* Filtros */}
        <div className="mb-5">
          <ScheduleFilters
            filtros={filtros}
            onChange={setFiltros}
            docentes={docentes as any}
            ambientes={ambientesUnicos as any}
          />
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !horarios?.length ? (
          <EmptyState
            titulo="Sin horarios"
            descripcion="Genere horarios automaticamente desde el panel de generacion."
          />
        ) : horariosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No se encontraron horarios con los filtros seleccionados.
            </p>
          </div>
        ) : vista === 'grilla' ? (
          <WeeklyGrid
            horarios={horariosFiltrados}
            onClickHorario={openDetail}
            conflictIds={conflictHorarioIds}
            filterDia={filtros.dia || undefined}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dia</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horariosFiltrados.map((h) => (
                    <TableRow
                      key={h.id}
                      className={cn(
                        'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
                        conflictHorarioIds.has(h.id) && 'bg-red-50 dark:bg-red-900/20'
                      )}
                      onClick={() => openDetail(h)}
                    >
                      <TableCell>{nombreDia(h.dia)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatearHora(h.hora_inicio)} — {formatearHora(h.hora_fin)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-400 mr-1.5">
                          {h.curso.codigo}
                        </span>
                        {h.curso.nombre}
                      </TableCell>
                      <TableCell>{h.docente.apellidos}, {h.docente.nombres}</TableCell>
                      <TableCell>{h.ambiente.codigo}</TableCell>
                      <TableCell>
                        <Badge variant={h.tipo === 'LABORATORIO' ? 'warning' : 'info'}>
                          {h.tipo === 'LABORATORIO' ? 'Lab' : 'Teoria'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conflictHorarioIds.has(h.id) ? (
                          <Badge variant="danger">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Conflicto
                          </Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Modal detalle */}
        <HorarioDetailModal
          horario={selectedHorario}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedHorario(null)
          }}
          onDelete={(id) => deleteMutation.mutate(id)}
          onEdit={(h) => {
            setModalOpen(false)
            setSelectedHorario(null)
            setEditingHorario(h)
            setFormModalOpen(true)
          }}
        />

        {/* Modal crear/editar */}
        <HorarioFormModal
          open={formModalOpen}
          onClose={() => {
            setFormModalOpen(false)
            setEditingHorario(null)
          }}
          horario={editingHorario}
          onSuccess={() => utils.horario.getAll.invalidate()}
          defaultCiclo={filtros.cicloAcademico}
        />
      </>
    </Layout>
  )
}
