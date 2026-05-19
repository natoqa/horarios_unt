import { useState } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { trpc } from '@/lib/trpc'
import { CICLOS_ACADEMICOS } from '@/lib/constants'
import toast from 'react-hot-toast'
import { ArrowLeft, Zap } from 'lucide-react'

export default function GenerarHorariosPage() {
  const [ciclo, setCiclo] = useState('2024-I')
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
            Algoritmo por prioridad: nombrados → contratados, por categoría y antigüedad
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

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={forzar}
                onChange={(e) => setForzar(e.target.checked)}
              />
              Forzar regeneración (elimina horarios existentes del ciclo)
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

        {resultado && (
          <Card className="mt-6 max-w-xl">
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-green-700">Asignaciones creadas: {resultado.total}</p>
              {resultado.conflictos.length > 0 && (
                <ul className="list-disc pl-5 text-red-600">
                  {resultado.conflictos.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
              {resultado.advertencias.length > 0 && (
                <ul className="list-disc pl-5 text-amber-600">
                  {resultado.advertencias.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </>
    </Layout>
  )
}
