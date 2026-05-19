import { useState } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { trpc } from '@/lib/trpc'
import { CICLOS_ACADEMICOS, CICLO_ACADEMICO_DEFAULT, getCiclosCursoPorPeriodo } from '@/lib/constants'
import toast from 'react-hot-toast'
import { ArrowLeft, Zap, Info } from 'lucide-react'

export default function GenerarHorariosPage() {
  const [ciclo, setCiclo] = useState(CICLO_ACADEMICO_DEFAULT)
  const [forzar, setForzar] = useState(false)
  const [resultado, setResultado] = useState<{
    total: number
    conflictos: string[]
    advertencias: string[]
  } | null>(null)

  const utils = trpc.useUtils()
  const generarMutation = trpc.horario.generarHorarios.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensaje)
      setResultado({
        total: data.total,
        conflictos: data.conflictos,
        advertencias: data.advertencias,
      })
      utils.horario.getAll.invalidate()
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <Layout>
      <>
        <header className="mb-6">
          <Link href="/horarios" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a horarios
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Generación automática</h1>
          <p className="text-gray-500 mt-1">
            Algoritmo inteligente con bloques consecutivos y validacion de conflictos
          </p>
        </header>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Parámetros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Ciclo académico
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={ciclo}
                onChange={(e) => setCiclo(e.target.value)}
              >
                {CICLOS_ACADEMICOS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
              <p className="text-xs font-medium text-blue-800 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Ciclos a generar: {getCiclosCursoPorPeriodo(ciclo).map(c => {
                  const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X']
                  return roman[c - 1]
                }).join(', ')}
              </p>
              <p className="text-[11px] text-blue-600 mt-0.5 ml-5">
                {ciclo.endsWith('-I') ? 'Periodo I = ciclos impares' : ciclo.endsWith('-II') ? 'Periodo II = ciclos pares' : 'Nivelacion = todos los ciclos'}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={forzar}
                onChange={(e) => setForzar(e.target.checked)}
              />
              Forzar regeneracion (elimina horarios existentes del ciclo)
            </label>

            <Button
              className="w-full"
              disabled={generarMutation.isLoading}
              onClick={() => generarMutation.mutate({ ciclo, forzar })}
            >
              {generarMutation.isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generar horarios
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info del algoritmo */}
        <Card className="mt-6 max-w-xl">
          <CardHeader>
            <CardTitle className="text-sm">Caracteristicas del algoritmo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Prioridad: nombrados antes que contratados, por categoria y antiguedad
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Bloques consecutivos: 4h de teoria = 2 bloques de 2h en dias diferentes
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Anti-colision por ciclo: cursos del mismo ciclo no se solapan
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Limite de 4h consecutivas por docente sin descanso
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Respeta disponibilidad docente y hora de almuerzo (13:00-14:00)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                Fallback: si no hay bloque consecutivo, asigna horas sueltas con advertencia
              </li>
            </ul>
          </CardContent>
        </Card>

        {resultado && (
          <Card className="mt-6 max-w-xl">
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-green-700">Asignaciones creadas: {resultado.total}</p>
              {resultado.conflictos.length > 0 && (
                <div>
                  <p className="font-medium text-red-700 mb-1">Conflictos ({resultado.conflictos.length})</p>
                  <ul className="list-disc pl-5 text-red-600 space-y-0.5">
                    {resultado.conflictos.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resultado.advertencias.length > 0 && (
                <div>
                  <p className="font-medium text-amber-700 mb-1">Advertencias ({resultado.advertencias.length})</p>
                  <ul className="list-disc pl-5 text-amber-600 space-y-0.5">
                    {resultado.advertencias.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resultado.conflictos.length === 0 && resultado.advertencias.length === 0 && (
                <p className="text-green-600">Sin conflictos ni advertencias.</p>
              )}
            </CardContent>
          </Card>
        )}
      </>
    </Layout>
  )
}
