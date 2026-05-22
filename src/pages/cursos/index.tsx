import { useMemo, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { trpc } from '@/lib/trpc'
import toast from 'react-hot-toast'
import { Select } from '@/components/ui/Select'
import { DEPARTAMENTOS_CURSO } from '@/lib/constants'
import { Plus, BookOpen, Clock, FlaskConical, GraduationCap, Trash2, Search, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const romanoCiclo: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
}

const colorCiclo: Record<number, { bg: string; text: string; badge: string }> = {
  1: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  2: { bg: 'bg-violet-50', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
  3: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  4: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  5: { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
  6: { bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700' },
  7: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  8: { bg: 'bg-teal-50', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700' },
  9: { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  10: { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
}

const defaultColor = { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' }

export default function CursosPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

  const toggleCiclo = (ciclo: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(ciclo) ? next.delete(ciclo) : next.add(ciclo)
      return next
    })
  }
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    creditos: 3,
    horas_teoria: 2,
    horas_laboratorio: 2,
    horas_practica: 0,
    ciclo: 1,
    departamento: 'Ingeniería de Sistemas',
    plan_estudios: '2018',
  })

  const utils = trpc.useUtils()
  const { data: cursos, isLoading } = trpc.curso.getAll.useQuery()

  // Estado para la asignación de docentes
  const [asignarModalOpen, setAsignarModalOpen] = useState(false)
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null)
  const [docentesSeleccionados, setDocentesSeleccionados] = useState<Set<string>>(new Set())
  const [buscarDocente, setBuscarDocente] = useState('')

  const { data: docentes } = trpc.docente.getAll.useQuery(undefined, {
    enabled: asignarModalOpen,
  })

  const asignarDocentesMutation = trpc.curso.asignarDocentes.useMutation({
    onSuccess: () => {
      toast.success('Docentes asignados correctamente')
      utils.curso.getAll.invalidate()
      setAsignarModalOpen(false)
    },
    onError: (e) => toast.error(e.message),
  })

  const handleOpenAsignar = (curso: any) => {
    setCursoSeleccionado(curso)
    setDocentesSeleccionados(new Set(curso.docentes.map((d: any) => d.docente.id)))
    setBuscarDocente('')
    setAsignarModalOpen(true)
  }

  const toggleDocente = (docenteId: string) => {
    setDocentesSeleccionados((prev) => {
      const next = new Set(prev)
      next.has(docenteId) ? next.delete(docenteId) : next.add(docenteId)
      return next
    })
  }

  const handleSaveAsignar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cursoSeleccionado) return
    asignarDocentesMutation.mutate({
      curso_id: cursoSeleccionado.id,
      docentes_ids: Array.from(docentesSeleccionados),
    })
  }

  const docentesFiltradosModal = useMemo(() => {
    if (!docentes) return []
    if (!buscarDocente.trim()) return docentes
    const q = buscarDocente.toLowerCase()
    return docentes.filter(
      (d) =>
        d.nombres.toLowerCase().includes(q) ||
        d.apellidos.toLowerCase().includes(q) ||
        d.codigo.toLowerCase().includes(q)
    )
  }, [docentes, buscarDocente])

  const createMutation = trpc.curso.create.useMutation({
    onSuccess: () => {
      toast.success('Curso registrado')
      utils.curso.getAll.invalidate()
      setModalOpen(false)
      setForm({ codigo: '', nombre: '', creditos: 3, horas_teoria: 2, horas_laboratorio: 2, horas_practica: 0, ciclo: 1, departamento: 'Ingeniería de Sistemas', plan_estudios: '2018' })
    },
    onError: (e) => toast.error(e.message),
  })
  const deleteMutation = trpc.curso.delete.useMutation({
    onSuccess: () => {
      toast.success('Curso desactivado')
      utils.curso.getAll.invalidate()
    },
    onError: (e) => toast.error(e.message),
  })

  const cursosFiltrados = useMemo(() => {
    if (!cursos) return []
    if (!busqueda.trim()) return cursos
    const q = busqueda.toLowerCase()
    return cursos.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q)
    )
  }, [cursos, busqueda])

  const cursosPorCiclo = useMemo(() => {
    const map = new Map<number, typeof cursosFiltrados>()
    for (const c of cursosFiltrados) {
      const grupo = map.get(c.ciclo) ?? []
      grupo.push(c)
      map.set(c.ciclo, grupo)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [cursosFiltrados])

  const totalCreditos = cursosFiltrados.reduce((acc, c) => acc + c.creditos, 0)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      creditos: Number(form.creditos),
      horas_teoria: Number(form.horas_teoria),
      horas_laboratorio: Number(form.horas_laboratorio),
      horas_practica: Number(form.horas_practica),
      ciclo: Number(form.ciclo),
      departamento: form.departamento,
    })
  }

  return (
    <Layout>
      <>
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Cursos</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Plan de estudios — Ingeniería de Sistemas</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo curso
          </Button>
        </header>

        {/* Stats + Búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-gray-200 text-sm dark:bg-gray-800 dark:border-gray-700">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Cursos:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{cursosFiltrados.length}</span>
            </div>
            <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-gray-200 text-sm dark:bg-gray-800 dark:border-gray-700">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Créditos:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCreditos}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !cursos?.length ? (
          <EmptyState titulo="Sin cursos" descripcion="Registre el primer curso." />
        ) : cursosPorCiclo.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron cursos para "{busqueda}"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cursosPorCiclo.map(([ciclo, cursosCiclo]) => {
              const color = colorCiclo[ciclo] ?? defaultColor
              return (
                <div key={ciclo} className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  {/* Header del ciclo */}
                  <button
                    type="button"
                    onClick={() => toggleCiclo(ciclo)}
                    className={cn('w-full px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors hover:brightness-95 dark:hover:brightness-110', color.bg, !collapsed.has(ciclo) && 'border-b border-gray-100 dark:border-gray-700')}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', color.text, collapsed.has(ciclo) && '-rotate-90')} />
                      <span className={cn('text-sm font-bold', color.text)}>
                        Ciclo {romanoCiclo[ciclo] ?? ciclo}
                      </span>
                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', color.badge)}>
                        {cursosCiclo.length} {cursosCiclo.length === 1 ? 'curso' : 'cursos'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {cursosCiclo.reduce((a, c) => a + c.creditos, 0)} créditos
                    </span>
                  </button>

                  {/* Lista de cursos */}
                  {!collapsed.has(ciclo) && <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {cursosCiclo.map((c) => (
                      <div key={c.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                        {/* Código */}
                        <span className="text-xs font-mono font-semibold text-gray-400 w-16 shrink-0">
                          {c.codigo}
                        </span>

                        {/* Nombre + Departamento + Docentes Asignados */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
                            {c.nombre}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {(c as any).departamento && (c as any).departamento !== 'Ingeniería de Sistemas' && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mr-1.5 shrink-0">
                                {(c as any).departamento}
                              </span>
                            )}
                            {c.docentes && c.docentes.length > 0 ? (
                              c.docentes.map((cd: any) => (
                                <Badge key={cd.docente.id} variant="default" className="text-[10px] py-0 px-1.5 font-normal dark:bg-gray-700 dark:text-gray-300">
                                  {cd.docente.nombres} {cd.docente.apellidos}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                                Sin docentes asignados
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tags de horas */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" title="Horas de teoría">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{c.horas_teoria}T</span>
                          </div>
                          {c.horas_laboratorio > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" title="Horas de laboratorio">
                              <FlaskConical className="h-3.5 w-3.5" />
                              <span>{c.horas_laboratorio}L</span>
                            </div>
                          )}
                        </div>

                        {/* Créditos */}
                        <Badge variant="info" className="shrink-0">
                          {c.creditos} crd
                        </Badge>

                        {/* Acción */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => handleOpenAsignar(c)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            title="Asignar docentes"
                          >
                            <GraduationCap className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Desactivar este curso?')) {
                                deleteMutation.mutate(c.id)
                              }
                            }}
                            className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Desactivar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>}
                </div>
              )
            })}
          </div>
        )}

        {/* Modal crear */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo curso" size="lg">
          <form onSubmit={handleCreate} className="space-y-4">
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-0 p-0">
              <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="IS101" required />
              <Input label="Ciclo" type="number" value={form.ciclo} onChange={(e) => setForm({ ...form, ciclo: Number(e.target.value) })} required />
              <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Programación I" required />
              <Input label="Créditos" type="number" value={form.creditos} onChange={(e) => setForm({ ...form, creditos: Number(e.target.value) })} required />
              <Input label="H. Teoría" type="number" value={form.horas_teoria} onChange={(e) => setForm({ ...form, horas_teoria: Number(e.target.value) })} required />
              <Input label="H. Laboratorio" type="number" value={form.horas_laboratorio} onChange={(e) => setForm({ ...form, horas_laboratorio: Number(e.target.value) })} required />
              <Input label="H. Práctica" type="number" value={form.horas_practica} onChange={(e) => setForm({ ...form, horas_practica: Number(e.target.value) })} />
              <Select label="Departamento" value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} options={DEPARTAMENTOS_CURSO} />
              <Input label="Plan de estudios" value={form.plan_estudios} onChange={(e) => setForm({ ...form, plan_estudios: e.target.value })} />
            </fieldset>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isLoading}>Guardar</Button>
            </div>
          </form>
        </Modal>

        {/* Modal asignar docentes */}
        <Modal
          open={asignarModalOpen}
          onClose={() => setAsignarModalOpen(false)}
          title={`Asignar docentes a: ${cursoSeleccionado?.nombre ?? ''}`}
          size="lg"
        >
          <form onSubmit={handleSaveAsignar} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar docente por nombre o código..."
                value={buscarDocente}
                onChange={(e) => setBuscarDocente(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-1 dark:border-gray-700">
              {docentesFiltradosModal.length > 0 ? (
                docentesFiltradosModal.map((docente) => {
                  const selected = docentesSeleccionados.has(docente.id)
                  return (
                    <button
                      key={docente.id}
                      type="button"
                      onClick={() => toggleDocente(docente.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm',
                        selected
                          ? 'bg-primary-50 border border-primary-200 dark:bg-primary-950/20 dark:border-primary-900'
                          : 'hover:bg-gray-50 border border-transparent dark:hover:bg-gray-700/50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                          selected
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-gray-300 dark:border-gray-600'
                        )}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-mono text-xs text-gray-400 w-16 shrink-0">
                        {docente.codigo}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate block">
                          {docente.apellidos}, {docente.nombres}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 block">
                          {docente.escuela} — {docente.categoria} ({docente.tipo})
                        </span>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  No se encontraron docentes.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAsignarModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={asignarDocentesMutation.isLoading}>
                Guardar asignaciones
              </Button>
            </div>
          </form>
        </Modal>
      </>
    </Layout>
  )
}
