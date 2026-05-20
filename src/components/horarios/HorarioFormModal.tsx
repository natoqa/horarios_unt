import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { trpc } from '@/lib/trpc'
import { CICLOS_ACADEMICOS, CICLO_ACADEMICO_DEFAULT, DIAS_SEMANA } from '@/lib/constants'
import type { HorarioConRelaciones } from '@/types'
import { Save, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const HORAS_INICIO = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
]

interface HorarioFormModalProps {
  open: boolean
  onClose: () => void
  horario?: HorarioConRelaciones | null
  onSuccess: () => void
  defaultCiclo?: string
}

export function HorarioFormModal({ open, onClose, horario, onSuccess, defaultCiclo }: HorarioFormModalProps) {
  const isEdit = !!horario

  const [form, setForm] = useState({
    curso_id: '',
    docente_id: '',
    ambiente_id: '',
    dia: '',
    hora_inicio: '',
    hora_fin: '',
    tipo: '',
    ciclo_academico: defaultCiclo || CICLO_ACADEMICO_DEFAULT,
  })
  const [errors, setErrors] = useState<string[]>([])

  const { data: cursos } = trpc.curso.getAll.useQuery()
  const { data: docentes } = trpc.docente.getAll.useQuery()
  const { data: ambientesDisponibles } = trpc.ambiente.getDisponibles.useQuery(
    {
      dia: form.dia,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      tipo: form.tipo || undefined,
    },
    { enabled: !!form.dia && !!form.hora_inicio && !!form.hora_fin && !!form.tipo }
  )

  const utils = trpc.useUtils()

  const createMutation = trpc.horario.create.useMutation({
    onSuccess: (data) => {
      if (data.advertencias?.length) {
        data.advertencias.forEach((w: string) => toast(w, { icon: '⚠️' }))
      }
      toast.success('Horario creado')
      utils.horario.getAll.invalidate()
      utils.horario.getConflictos.invalidate()
      onSuccess()
      onClose()
    },
    onError: (e) => setErrors([e.message]),
  })

  const updateMutation = trpc.horario.update.useMutation({
    onSuccess: (data) => {
      if (data.advertencias?.length) {
        data.advertencias.forEach((w: string) => toast(w, { icon: '⚠️' }))
      }
      toast.success('Horario actualizado')
      utils.horario.getAll.invalidate()
      utils.horario.getConflictos.invalidate()
      onSuccess()
      onClose()
    },
    onError: (e) => setErrors([e.message]),
  })

  useEffect(() => {
    if (!open) return
    if (horario) {
      setForm({
        curso_id: horario.curso_id,
        docente_id: horario.docente_id,
        ambiente_id: horario.ambiente_id,
        dia: horario.dia,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        tipo: horario.tipo,
        ciclo_academico: horario.ciclo_academico,
      })
    } else {
      setForm({
        curso_id: '',
        docente_id: '',
        ambiente_id: '',
        dia: '',
        hora_inicio: '',
        hora_fin: '',
        tipo: '',
        ciclo_academico: defaultCiclo || CICLO_ACADEMICO_DEFAULT,
      })
    }
    setErrors([])
  }, [horario, open, defaultCiclo])

  const docentesFiltrados = useMemo(() => {
    if (!docentes) return []
    if (!form.curso_id) return docentes
    return docentes.filter(d =>
      d.cursos_asignados.some((ca: any) => ca.curso_id === form.curso_id)
    )
  }, [docentes, form.curso_id])

  const horasFinDisponibles = useMemo(() => {
    if (!form.hora_inicio) return []
    return [...HORAS_INICIO.slice(1), '20:00'].filter(h => h > form.hora_inicio)
  }, [form.hora_inicio])

  const ambientesParaSelect = useMemo(() => {
    const lista = ambientesDisponibles ?? []
    if (isEdit && horario && !lista.some((a: any) => a.id === horario.ambiente_id)) {
      return [horario.ambiente, ...lista]
    }
    return lista
  }, [ambientesDisponibles, horario, isEdit])

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = () => {
    setErrors([])
    const missing = []
    if (!form.curso_id) missing.push('Curso')
    if (!form.docente_id) missing.push('Docente')
    if (!form.dia) missing.push('Dia')
    if (!form.hora_inicio) missing.push('Hora inicio')
    if (!form.hora_fin) missing.push('Hora fin')
    if (!form.tipo) missing.push('Tipo')
    if (!form.ambiente_id) missing.push('Ambiente')

    if (missing.length) {
      setErrors([`Campos requeridos: ${missing.join(', ')}`])
      return
    }

    if (isEdit && horario) {
      updateMutation.mutate({ id: horario.id, data: form as any })
    } else {
      createMutation.mutate(form as any)
    }
  }

  const loading = createMutation.isLoading || updateMutation.isLoading

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar horario' : 'Nuevo horario'} size="lg">
      <div className="space-y-4">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-red-700 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                {e}
              </p>
            ))}
          </div>
        )}

        <Select
          label="Ciclo academico"
          value={form.ciclo_academico}
          onChange={(e) => set('ciclo_academico', e.target.value)}
          options={CICLOS_ACADEMICOS.map(c => ({ value: c, label: c }))}
        />

        <Select
          label="Curso"
          value={form.curso_id}
          onChange={(e) => setForm(f => ({ ...f, curso_id: e.target.value, docente_id: '' }))}
          options={(cursos ?? []).map(c => ({
            value: c.id,
            label: `${c.codigo} - ${c.nombre} (Ciclo ${c.ciclo})`,
          }))}
          placeholder="Seleccione un curso"
        />

        <Select
          label="Docente"
          value={form.docente_id}
          onChange={(e) => set('docente_id', e.target.value)}
          options={docentesFiltrados.map((d: any) => ({
            value: d.id,
            label: `${d.apellidos}, ${d.nombres}`,
          }))}
          placeholder={form.curso_id ? 'Seleccione docente' : 'Primero seleccione un curso'}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="horario-tipo"
                value="AULA"
                checked={form.tipo === 'AULA'}
                onChange={() => setForm(f => ({ ...f, tipo: 'AULA', ambiente_id: '' }))}
                className="text-blue-600"
              />
              <span className="text-sm">Teoria</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="horario-tipo"
                value="LABORATORIO"
                checked={form.tipo === 'LABORATORIO'}
                onChange={() => setForm(f => ({ ...f, tipo: 'LABORATORIO', ambiente_id: '' }))}
                className="text-blue-600"
              />
              <span className="text-sm">Laboratorio</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Dia"
            value={form.dia}
            onChange={(e) => setForm(f => ({ ...f, dia: e.target.value, ambiente_id: '' }))}
            options={DIAS_SEMANA.map(d => ({ value: d.value, label: d.label }))}
            placeholder="Dia"
          />
          <Select
            label="Hora inicio"
            value={form.hora_inicio}
            onChange={(e) => setForm(f => ({ ...f, hora_inicio: e.target.value, hora_fin: '', ambiente_id: '' }))}
            options={HORAS_INICIO.map(h => ({ value: h, label: h }))}
            placeholder="Inicio"
          />
          <Select
            label="Hora fin"
            value={form.hora_fin}
            onChange={(e) => setForm(f => ({ ...f, hora_fin: e.target.value, ambiente_id: '' }))}
            options={horasFinDisponibles.map(h => ({ value: h, label: h }))}
            placeholder="Fin"
          />
        </div>

        <Select
          label="Ambiente"
          value={form.ambiente_id}
          onChange={(e) => set('ambiente_id', e.target.value)}
          options={(ambientesParaSelect as any[]).map((a: any) => ({
            value: a.id,
            label: `${a.codigo} - ${a.nombre} (Cap: ${a.capacidad})`,
          }))}
          placeholder={
            form.dia && form.hora_inicio && form.hora_fin && form.tipo
              ? 'Seleccione ambiente disponible'
              : 'Complete tipo, dia y horas primero'
          }
        />

        <div className="flex justify-end gap-3 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Guardar cambios' : 'Crear horario'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
