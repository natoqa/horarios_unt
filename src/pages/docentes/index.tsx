import { useMemo, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { trpc } from '@/lib/trpc'
import { CATEGORIAS_DOCENTE, TIPOS_DOCENTE, ESCUELAS } from '@/lib/constants'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Plus, Search, Users, Mail, Clock, Trash2, ShieldCheck, FileSignature, ChevronDown, GraduationCap, BookOpen, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const tipoConfig = {
  NOMBRADO: {
    label: 'Nombrado',
    icon: ShieldCheck,
    badge: 'bg-emerald-100 text-emerald-700',
  },
  CONTRATADO: {
    label: 'Contratado',
    icon: FileSignature,
    badge: 'bg-amber-100 text-amber-700',
  },
}

const categoriaLabel: Record<string, string> = {
  PRINCIPAL: 'Principal',
  ASOCIADO: 'Asociado',
  AUXILIAR: 'Auxiliar',
  JEFE_PRACTICA: 'Jefe de Práctica',
}

const categoriaBadge: Record<string, string> = {
  PRINCIPAL: 'bg-purple-100 text-purple-700',
  ASOCIADO: 'bg-blue-100 text-blue-700',
  AUXILIAR: 'bg-teal-100 text-teal-700',
  JEFE_PRACTICA: 'bg-orange-100 text-orange-700',
}

const escuelaColors: Record<string, { bg: string; text: string; badge: string; iconBg: string }> = {
  'Ingeniería de Sistemas': { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-100 text-blue-600' },
  'Ingeniería Industrial': { bg: 'bg-violet-50', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', iconBg: 'bg-violet-100 text-violet-600' },
  'Ingeniería Mecánica': { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600' },
  'Ingeniería de Materiales': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-100 text-amber-600' },
  'Ingeniería Metalúrgica': { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', iconBg: 'bg-rose-100 text-rose-600' },
  'Matemáticas': { bg: 'bg-cyan-50', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700', iconBg: 'bg-cyan-100 text-cyan-600' },
  'Estadística': { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', iconBg: 'bg-orange-100 text-orange-600' },
  'Física': { bg: 'bg-teal-50', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700', iconBg: 'bg-teal-100 text-teal-600' },
  'Informática': { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', iconBg: 'bg-indigo-100 text-indigo-600' },
}

const defaultEscuelaColor = { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700', iconBg: 'bg-gray-100 text-gray-600' }

export default function DocentesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    codigo: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    categoria: 'PRINCIPAL',
    tipo: 'NOMBRADO',
    antiguedad: 0,
    escuela: 'Ingeniería de Sistemas',
  })

  const [pdfEscuela, setPdfEscuela] = useState('')

  const toggleEscuela = (escuela: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(escuela) ? next.delete(escuela) : next.add(escuela)
      return next
    })
  }

  const utils = trpc.useUtils()
  const { data: docentes, isLoading } = trpc.docente.getAll.useQuery()
  const createMutation = trpc.docente.create.useMutation({
    onSuccess: () => {
      toast.success('Docente registrado')
      utils.docente.getAll.invalidate()
      setModalOpen(false)
      setForm({ codigo: '', nombres: '', apellidos: '', correo: '', telefono: '', categoria: 'PRINCIPAL', tipo: 'NOMBRADO', antiguedad: 0, escuela: 'Ingeniería de Sistemas' })
    },
    onError: (e) => toast.error(e.message),
  })
  const deleteMutation = trpc.docente.delete.useMutation({
    onSuccess: () => {
      toast.success('Docente desactivado')
      utils.docente.getAll.invalidate()
    },
    onError: (e) => toast.error(e.message),
  })
  const pdfMutation = trpc.reporte.generarReporteDocentes.useMutation({
    onSuccess: (d) => {
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${d.archivo}`
      link.download = d.nombre
      link.click()
      toast.success('PDF descargado')
    },
    onError: (e) => toast.error(e.message),
  })

  const filtrados = useMemo(() => {
    if (!docentes) return []
    if (!busqueda.trim()) return docentes
    const q = busqueda.toLowerCase()
    return docentes.filter(
      (d) =>
        d.nombres.toLowerCase().includes(q) ||
        d.apellidos.toLowerCase().includes(q) ||
        d.codigo.toLowerCase().includes(q) ||
        d.correo.toLowerCase().includes(q) ||
        (d as any).escuela?.toLowerCase().includes(q)
    )
  }, [docentes, busqueda])

  const agrupadosPorEscuela = useMemo(() => {
    const map = new Map<string, typeof filtrados>()
    for (const d of filtrados) {
      const escuela = (d as any).escuela ?? 'Ingeniería de Sistemas'
      const grupo = map.get(escuela) ?? []
      grupo.push(d)
      map.set(escuela, grupo)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === 'Ingeniería de Sistemas') return -1
        if (b === 'Ingeniería de Sistemas') return 1
        return a.localeCompare(b)
      })
      .map(([escuela, items]) => ({
        escuela,
        items: items.sort((a, b) => a.apellidos.localeCompare(b.apellidos)),
      }))
  }, [filtrados])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      categoria: form.categoria as 'PRINCIPAL',
      tipo: form.tipo as 'NOMBRADO',
      antiguedad: Number(form.antiguedad),
      telefono: form.telefono || undefined,
    })
  }

  return (
    <Layout>
      <>
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Docentes</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestión de docentes por escuela profesional</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pdfEscuela}
              onChange={(e) => setPdfEscuela(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todas las escuelas</option>
              {ESCUELAS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              disabled={pdfMutation.isLoading}
              onClick={() => pdfMutation.mutate({ escuela: pdfEscuela || undefined })}
            >
              {pdfMutation.isLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Descargar PDF
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo docente
            </Button>
          </div>
        </header>

        {/* Búsqueda + Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, correo o escuela..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-gray-200 text-sm dark:bg-gray-800 dark:border-gray-700">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Total:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{filtrados.length}</span>
            </div>
            <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-gray-200 text-sm dark:bg-gray-800 dark:border-gray-700">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Escuelas:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{agrupadosPorEscuela.length}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !docentes?.length ? (
          <EmptyState titulo="Sin docentes" descripcion="Registre el primer docente." />
        ) : agrupadosPorEscuela.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron docentes para &quot;{busqueda}&quot;</p>
          </div>
        ) : (
          <div className="space-y-6">
            {agrupadosPorEscuela.map(({ escuela, items }) => {
              const color = escuelaColors[escuela] ?? defaultEscuelaColor
              return (
                <div key={escuela} className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  {/* Header del grupo */}
                  <button
                    type="button"
                    onClick={() => toggleEscuela(escuela)}
                    className={cn('w-full px-5 py-3.5 flex items-center justify-between cursor-pointer transition-colors hover:brightness-95 dark:hover:brightness-110', color.bg, !collapsed.has(escuela) && 'border-b border-gray-100 dark:border-gray-700')}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', color.text, collapsed.has(escuela) && '-rotate-90')} />
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', color.iconBg)}>
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <span className={cn('text-sm font-bold', color.text)}>
                        {escuela}
                      </span>
                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', color.badge)}>
                        {items.length} {items.length === 1 ? 'docente' : 'docentes'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {items.filter(d => d.tipo === 'NOMBRADO').length} N
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {items.filter(d => d.tipo === 'CONTRATADO').length} C
                      </span>
                    </div>
                  </button>

                  {/* Lista */}
                  {!collapsed.has(escuela) && <div className="divide-y divide-gray-50">
                    {items.map((d) => {
                      const tipoC = tipoConfig[d.tipo as keyof typeof tipoConfig]
                      const numCursos = d.cursos_asignados?.length ?? 0
                      return (
                        <div key={d.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                          {/* Avatar - clickeable */}
                          <Link href={`/docentes/${d.id}`} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-white">
                              {d.nombres[0]}{d.apellidos[0]}
                            </span>
                          </Link>

                          {/* Nombre + correo - clickeable */}
                          <Link href={`/docentes/${d.id}`} className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate hover:text-primary-600 transition-colors">
                              {d.apellidos}, {d.nombres}
                            </p>
                            <div className="hidden sm:flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400 truncate">{d.correo}</span>
                              </span>
                              <span className={cn(
                                'flex items-center gap-1 text-xs',
                                numCursos > 0 ? 'text-green-600' : 'text-amber-500'
                              )}>
                                <BookOpen className="h-3 w-3" />
                                {numCursos} {numCursos === 1 ? 'curso' : 'cursos'}
                              </span>
                            </div>
                          </Link>

                          {/* Código */}
                          <span className="hidden md:block text-xs font-mono font-semibold text-gray-400 shrink-0">
                            {d.codigo}
                          </span>

                          {/* Tipo */}
                          {tipoC && (
                            <span className={cn(
                              'hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0',
                              tipoC.badge
                            )}>
                              {tipoC.label}
                            </span>
                          )}

                          {/* Categoría */}
                          <span className={cn(
                            'hidden sm:inline-flex text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0',
                            categoriaBadge[d.categoria] ?? 'bg-gray-100 text-gray-700'
                          )}>
                            {categoriaLabel[d.categoria] ?? d.categoria}
                          </span>

                          {/* Antigüedad */}
                          <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500 shrink-0" title="Antigüedad">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{d.antiguedad}a</span>
                          </div>

                          {/* Acción */}
                          <button
                            onClick={() => {
                              if (confirm('¿Desactivar este docente?')) {
                                deleteMutation.mutate(d.id)
                              }
                            }}
                            className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Desactivar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>}
                </div>
              )
            })}
          </div>
        )}

        {/* Modal crear */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo docente" size="lg">
          <form onSubmit={handleCreate} className="space-y-4">
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-0 p-0">
              <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="DOC001" required />
              <Input label="Correo" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="correo@unitru.edu.pe" required />
              <Input label="Nombres" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
              <Input label="Apellidos" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
              <Select label="Escuela" value={form.escuela} onChange={(e) => setForm({ ...form, escuela: e.target.value })} options={ESCUELAS} />
              <Select label="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} options={CATEGORIAS_DOCENTE} />
              <Select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} options={TIPOS_DOCENTE} />
              <Input label="Antigüedad (años)" type="number" value={form.antiguedad} onChange={(e) => setForm({ ...form, antiguedad: Number(e.target.value) })} required />
              <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Opcional" />
            </fieldset>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isLoading}>Guardar</Button>
            </div>
          </form>
        </Modal>
      </>
    </Layout>
  )
}
