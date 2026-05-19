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
import { TIPOS_AMBIENTE } from '@/lib/constants'
import toast from 'react-hot-toast'
import { Plus, Search, Users, MapPin, Monitor, Projector, Trash2, DoorOpen, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

const tipoConfig = {
  AULA: {
    label: 'Aulas de Teoría',
    icon: DoorOpen,
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  LABORATORIO: {
    label: 'Laboratorios',
    icon: FlaskConical,
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
}

export default function AmbientesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    tipo: 'AULA',
    capacidad: 30,
    ubicacion: '',
    piso: 1,
  })

  const utils = trpc.useUtils()
  const { data: ambientes, isLoading } = trpc.ambiente.getAll.useQuery()
  const createMutation = trpc.ambiente.create.useMutation({
    onSuccess: () => {
      toast.success('Ambiente registrado')
      utils.ambiente.getAll.invalidate()
      setModalOpen(false)
      setForm({ codigo: '', nombre: '', tipo: 'AULA', capacidad: 30, ubicacion: '', piso: 1 })
    },
    onError: (e) => toast.error(e.message),
  })
  const deleteMutation = trpc.ambiente.delete.useMutation({
    onSuccess: () => {
      toast.success('Ambiente desactivado')
      utils.ambiente.getAll.invalidate()
    },
    onError: (e) => toast.error(e.message),
  })

  const filtrados = useMemo(() => {
    if (!ambientes) return []
    if (!busqueda.trim()) return ambientes
    const q = busqueda.toLowerCase()
    return ambientes.filter(
      (a) => a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q) || a.ubicacion?.toLowerCase().includes(q)
    )
  }, [ambientes, busqueda])

  const agrupados = useMemo(() => {
    const aulas = filtrados.filter((a) => a.tipo === 'AULA').sort((a, b) => a.codigo.localeCompare(b.codigo))
    const labs = filtrados.filter((a) => a.tipo === 'LABORATORIO').sort((a, b) => a.codigo.localeCompare(b.codigo))
    const grupos: { tipo: 'AULA' | 'LABORATORIO'; items: typeof filtrados }[] = []
    if (aulas.length) grupos.push({ tipo: 'AULA', items: aulas })
    if (labs.length) grupos.push({ tipo: 'LABORATORIO', items: labs })
    return grupos
  }, [filtrados])

  const totalCapacidad = filtrados.reduce((acc, a) => acc + a.capacidad, 0)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      tipo: form.tipo as 'AULA',
      capacidad: Number(form.capacidad),
      piso: form.piso ? Number(form.piso) : null,
      ubicacion: form.ubicacion || undefined,
    })
  }

  return (
    <Layout>
      <>
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ambientes</h1>
            <p className="text-gray-500 text-sm mt-1">Aulas de teoría y laboratorios</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo ambiente
          </Button>
        </header>

        {/* Búsqueda + Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o ubicación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-gray-200 text-sm">
              <DoorOpen className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Ambientes:</span>
              <span className="font-semibold text-gray-900">{filtrados.length}</span>
            </div>
            <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white border border-gray-200 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Capacidad:</span>
              <span className="font-semibold text-gray-900">{totalCapacidad}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !ambientes?.length ? (
          <EmptyState titulo="Sin ambientes" descripcion="Registre el primer ambiente." />
        ) : agrupados.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No se encontraron ambientes para &quot;{busqueda}&quot;</p>
          </div>
        ) : (
          <div className="space-y-6">
            {agrupados.map(({ tipo, items }) => {
              const config = tipoConfig[tipo]
              const Icon = config.icon
              return (
                <div key={tipo} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Header del grupo */}
                  <div className={cn('px-5 py-3.5 border-b border-gray-100 flex items-center justify-between', config.headerBg)}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', config.iconBg)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn('text-sm font-bold', config.headerText)}>
                        {config.label}
                      </span>
                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', config.badge)}>
                        {items.length}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {items.reduce((a, i) => a + i.capacidad, 0)} personas en total
                    </span>
                  </div>

                  {/* Lista */}
                  <div className="divide-y divide-gray-50">
                    {items.map((a) => (
                      <div key={a.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                        {/* Código */}
                        <span className="text-xs font-mono font-semibold text-gray-400 w-20 shrink-0">
                          {a.codigo}
                        </span>

                        {/* Nombre */}
                        <span className="flex-1 text-sm font-medium text-gray-900 min-w-0 truncate">
                          {a.nombre}
                        </span>

                        {/* Info */}
                        <div className="hidden sm:flex items-center gap-3">
                          {a.ubicacion && (
                            <div className="flex items-center gap-1 text-xs text-gray-500" title="Ubicación">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="max-w-[160px] truncate">{a.ubicacion}</span>
                            </div>
                          )}
                          {a.tiene_proyector && (
                            <div className="flex items-center gap-1 text-xs text-gray-500" title="Proyector">
                              <Projector className="h-3.5 w-3.5" />
                            </div>
                          )}
                          {a.tiene_computadoras && (
                            <div className="flex items-center gap-1 text-xs text-gray-500" title="Computadoras">
                              <Monitor className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Capacidad */}
                        <Badge variant={tipo === 'AULA' ? 'info' : 'success'} className="shrink-0">
                          <Users className="h-3 w-3 mr-1" />
                          {a.capacidad}
                        </Badge>

                        {/* Acción */}
                        <button
                          onClick={() => {
                            if (confirm('¿Desactivar este ambiente?')) {
                              deleteMutation.mutate(a.id)
                            }
                          }}
                          className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Desactivar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal crear */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo ambiente" size="lg">
          <form onSubmit={handleCreate} className="space-y-4">
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-0 p-0">
              <Input label="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="A101" required />
              <Select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} options={TIPOS_AMBIENTE} />
              <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Aula 101" required />
              <Input label="Capacidad" type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })} required />
              <Input label="Ubicación" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} placeholder="Pabellón A - Piso 1" />
              <Input label="Piso" type="number" value={form.piso} onChange={(e) => setForm({ ...form, piso: Number(e.target.value) })} />
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
