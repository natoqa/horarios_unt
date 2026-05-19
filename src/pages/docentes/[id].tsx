import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { trpc } from '@/lib/trpc'
import { DIAS_SEMANA } from '@/lib/constants'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Save,
  User,
  Mail,
  GraduationCap,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'

const HORAS = Array.from({ length: 13 }, (_, i) => {
  const h = i < 6 ? i + 7 : i + 8
  return {
    inicio: `${h.toString().padStart(2, '0')}:00`,
    fin: `${(h + 1).toString().padStart(2, '0')}:00`,
    label: `${h}:00 - ${h + 1}:00`,
  }
})

const DIAS = DIAS_SEMANA.filter((d) => d.value !== 'SABADO')

export default function DocenteDetallePage() {
  const router = useRouter()
  const id = router.query.id as string

  const [tab, setTab] = useState<'cursos' | 'disponibilidad'>('cursos')
  const [cursosSeleccionados, setCursosSeleccionados] = useState<Set<string>>(new Set())
  const [disponibilidad, setDisponibilidad] = useState<Set<string>>(new Set())
  const [initialized, setInitialized] = useState(false)

  const { data: docente, isLoading } = trpc.docente.getById.useQuery(id, {
    enabled: !!id,
    onSuccess: (data) => {
      if (!initialized) {
        setCursosSeleccionados(new Set(data.cursos_asignados.map((ca: any) => ca.curso_id)))
        setDisponibilidad(
          new Set(data.disponibilidades.map((d: any) => `${d.dia}_${d.hora_inicio}`))
        )
        setInitialized(true)
      }
    },
  })

  const { data: cursos } = trpc.curso.getAll.useQuery()

  const utils = trpc.useUtils()

  const asignarCursosMutation = trpc.docente.asignarCursos.useMutation({
    onSuccess: () => {
      toast.success('Cursos asignados correctamente')
      utils.docente.getById.invalidate(id)
    },
    onError: (e) => toast.error(e.message),
  })

  const updateDisponibilidadMutation = trpc.docente.updateDisponibilidad.useMutation({
    onSuccess: () => {
      toast.success('Disponibilidad actualizada')
      utils.docente.getById.invalidate(id)
    },
    onError: (e) => toast.error(e.message),
  })

  const toggleCurso = (cursoId: string) => {
    setCursosSeleccionados((prev) => {
      const next = new Set(prev)
      next.has(cursoId) ? next.delete(cursoId) : next.add(cursoId)
      return next
    })
  }

  const toggleDisponibilidad = (dia: string, horaInicio: string) => {
    const key = `${dia}_${horaInicio}`
    setDisponibilidad((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const seleccionarDiaCompleto = (dia: string) => {
    const todasLasHoras = HORAS.map((h) => `${dia}_${h.inicio}`)
    const todasSeleccionadas = todasLasHoras.every((k) => disponibilidad.has(k))

    setDisponibilidad((prev) => {
      const next = new Set(prev)
      for (const k of todasLasHoras) {
        todasSeleccionadas ? next.delete(k) : next.add(k)
      }
      return next
    })
  }

  const guardarCursos = () => {
    asignarCursosMutation.mutate({
      docente_id: id,
      cursos_ids: Array.from(cursosSeleccionados),
    })
  }

  const guardarDisponibilidad = () => {
    const entries: { dia: string; hora_inicio: string; hora_fin: string }[] = []
    for (const key of disponibilidad) {
      const [dia, horaInicio] = key.split('_')
      const hora = HORAS.find((h) => h.inicio === horaInicio)
      if (hora) {
        entries.push({ dia, hora_inicio: hora.inicio, hora_fin: hora.fin })
      }
    }
    updateDisponibilidadMutation.mutate({
      docente_id: id,
      disponibilidades: entries,
    })
  }

  const cursosPorCiclo = useMemo(() => {
    if (!cursos) return []
    const map = new Map<number, typeof cursos>()
    for (const c of cursos) {
      const grupo = map.get(c.ciclo) ?? []
      grupo.push(c)
      map.set(c.ciclo, grupo)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [cursos])

  const romanoCiclo: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  }

  if (isLoading || !docente) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  const esExterno = (curso: any) =>
    (curso.departamento ?? 'Ingeniería de Sistemas') !== 'Ingeniería de Sistemas'

  return (
    <Layout>
      <>
        <header className="mb-6">
          <Link
            href="/docentes"
            className="inline-flex items-center text-sm text-primary-600 hover:underline mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a docentes
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-white">
                {docente.nombres[0]}
                {docente.apellidos[0]}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {docente.apellidos}, {docente.nombres}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {docente.correo}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {(docente as any).escuela}
                </span>
                <Badge variant="info">{docente.categoria}</Badge>
                <Badge variant={docente.tipo === 'NOMBRADO' ? 'success' : 'warning'}>
                  {docente.tipo}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('cursos')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              tab === 'cursos'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <BookOpen className="inline mr-2 h-4 w-4" />
            Cursos asignados ({cursosSeleccionados.size})
          </button>
          <button
            onClick={() => setTab('disponibilidad')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              tab === 'disponibilidad'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Clock className="inline mr-2 h-4 w-4" />
            Disponibilidad ({disponibilidad.size} bloques)
          </button>
        </div>

        {/* Tab: Cursos */}
        {tab === 'cursos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Selecciona los cursos que dicta este docente. Los cursos de otros departamentos
                aparecen marcados.
              </p>
              <Button
                onClick={guardarCursos}
                disabled={asignarCursosMutation.isLoading}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar cursos
              </Button>
            </div>

            {cursosPorCiclo.map(([ciclo, cursosCiclo]) => (
              <Card key={ciclo}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">
                    Ciclo {romanoCiclo[ciclo] ?? ciclo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="space-y-1">
                    {cursosCiclo.map((curso) => {
                      const selected = cursosSeleccionados.has(curso.id)
                      const externo = esExterno(curso)
                      return (
                        <button
                          key={curso.id}
                          type="button"
                          onClick={() => toggleCurso(curso.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm',
                            selected
                              ? 'bg-primary-50 border border-primary-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                              selected
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-gray-300'
                            )}
                          >
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="font-mono text-xs text-gray-400 w-14 shrink-0">
                            {curso.codigo}
                          </span>
                          <span className="flex-1 truncate">{curso.nombre}</span>
                          {externo && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                              {(curso as any).departamento}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 shrink-0">
                            {curso.horas_teoria}T + {curso.horas_laboratorio}L
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Disponibilidad */}
        {tab === 'disponibilidad' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>Haz clic en las celdas para marcar disponibilidad. Clic en el nombre del
                  d&iacute;a para seleccionar todo el d&iacute;a.</p>
                {disponibilidad.size === 0 && (
                  <p className="flex items-center gap-1 mt-1 text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Sin disponibilidad: el generador asignar&aacute; en cualquier franja
                  </p>
                )}
              </div>
              <Button
                onClick={guardarDisponibilidad}
                disabled={updateDisponibilidadMutation.isLoading}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar disponibilidad
              </Button>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left text-gray-500 font-medium w-24">Hora</th>
                      {DIAS.map((dia) => (
                        <th key={dia.value} className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => seleccionarDiaCompleto(dia.value)}
                            className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
                          >
                            {dia.label}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORAS.map((hora, idx) => (
                      <tr
                        key={hora.inicio}
                        className={cn(
                          idx === 5 && 'border-b-2 border-gray-300'
                        )}
                      >
                        <td className="p-2 text-gray-500 font-mono whitespace-nowrap">
                          {hora.label}
                        </td>
                        {DIAS.map((dia) => {
                          const key = `${dia.value}_${hora.inicio}`
                          const active = disponibilidad.has(key)
                          return (
                            <td key={dia.value} className="p-1 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDisponibilidad(dia.value, hora.inicio)
                                }
                                className={cn(
                                  'w-full h-8 rounded-md border transition-all',
                                  active
                                    ? 'bg-green-500 border-green-600 shadow-sm'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                )}
                                title={
                                  active
                                    ? `${dia.label} ${hora.label} - Disponible`
                                    : `${dia.label} ${hora.label} - No disponible`
                                }
                              >
                                {active && (
                                  <Check className="h-3 w-3 text-white mx-auto" />
                                )}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    </Layout>
  )
}
