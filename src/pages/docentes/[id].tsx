import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
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
  const { data: session } = useSession()
  const rol = (session?.user as { rol?: string })?.rol ?? 'Usuario'
  const esDocente = rol === 'DOCENTE'

  const [tab, setTab] = useState<'cursos' | 'disponibilidad'>('cursos')
  const activeTab = esDocente ? 'disponibilidad' : tab
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
          {!esDocente ? (
            <Link
              href="/docentes"
              className="inline-flex items-center text-sm text-primary-600 hover:underline mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver a docentes
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-primary-600 hover:underline mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver al dashboard
            </Link>
          )}

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
        {!esDocente && (
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
        )}

        {/* Tab: Cursos */}
        {activeTab === 'cursos' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-500" />
                  Cursos Asignados para este Docente
                </h3>
                <span className="text-xs text-gray-400">
                  Total de créditos: {docente.cursos_asignados?.reduce((acc: number, ca: any) => acc + ca.curso.creditos, 0) ?? 0}
                </span>
              </div>
              
              {docente.cursos_asignados && docente.cursos_asignados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docente.cursos_asignados.map((ca: any) => (
                    <div
                      key={ca.id}
                      className="flex items-center gap-3 p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">
                          {ca.curso.nombre}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-gray-400 font-semibold">
                            {ca.curso.codigo}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Ciclo {romanoCiclo[ca.curso.ciclo] ?? ca.curso.ciclo}
                          </span>
                        </div>
                      </div>
                      <Badge variant="info" className="shrink-0 text-[10px]">
                        {ca.curso.creditos} crd
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">Este docente aún no tiene cursos asignados.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    La asignación de cursos debe realizarse desde el módulo de cursos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Disponibilidad */}
        {activeTab === 'disponibilidad' && (
          <div className="space-y-4">
            {!esDocente && (docente?.disponibilidades?.length ?? 0) === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Disponibilidad no registrada por el docente</h4>
                  <p className="text-xs mt-1">
                    La disponibilidad de horarios debe ser ingresada inicialmente por el propio profesor. 
                    Hasta que el docente no registre su disponibilidad por primera vez desde su cuenta, 
                    administración no podrá crearla ni modificarla.
                  </p>
                </div>
              </div>
            ) : (
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
            )}

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left text-gray-500 font-medium w-24">Hora</th>
                      {DIAS.map((dia) => {
                        const disabledGrid = !esDocente && (docente?.disponibilidades?.length ?? 0) === 0
                        return (
                          <th key={dia.value} className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => seleccionarDiaCompleto(dia.value)}
                              disabled={disabledGrid}
                              className={cn(
                                "font-medium text-gray-700 hover:text-primary-600 transition-colors",
                                disabledGrid && "opacity-60 cursor-not-allowed hover:text-gray-700"
                              )}
                            >
                              {dia.label}
                            </button>
                          </th>
                        )
                      })}
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
                          const disabledGrid = !esDocente && (docente?.disponibilidades?.length ?? 0) === 0
                          return (
                            <td key={dia.value} className="p-1 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDisponibilidad(dia.value, hora.inicio)
                                }
                                disabled={disabledGrid}
                                className={cn(
                                  'w-full h-8 rounded-md border transition-all',
                                  active
                                    ? 'bg-green-500 border-green-600 shadow-sm'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100',
                                  disabledGrid && 'opacity-50 cursor-not-allowed hover:bg-gray-50'
                                )}
                                title={
                                  disabledGrid
                                    ? 'No se puede modificar (el docente aún no registra disponibilidad)'
                                    : active
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
