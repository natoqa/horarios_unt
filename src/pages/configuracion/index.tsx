import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { trpc } from '@/lib/trpc'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function ConfiguracionPage() {
  const { data: configs, isLoading } = trpc.configuracion.getAll.useQuery()
  const [valores, setValores] = useState<Record<string, string>>({})

  useEffect(() => {
    if (configs) {
      const map: Record<string, string> = {}
      configs.forEach((c) => {
        map[c.clave] = c.valor
      })
      setValores(map)
    }
  }, [configs])

  const updateMutation = trpc.configuracion.updateMultiple.useMutation({
    onSuccess: () => toast.success('Configuración guardada'),
    onError: (e) => toast.error(e.message),
  })

  const handleSave = () => {
    const payload = Object.entries(valores).map(([clave, valor]) => ({ clave, valor }))
    updateMutation.mutate(payload)
  }

  const labels: Record<string, string> = {
    ciclo_actual: 'Ciclo académico actual',
    hora_inicio_jornada: 'Hora inicio jornada',
    hora_fin_jornada: 'Hora fin jornada',
    duracion_bloque: 'Duración bloque (minutos)',
    max_horas_diarias_docente: 'Máx. horas diarias por docente',
  }

  return (
    <Layout>
      <>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 mt-1">Parámetros del sistema de horarios</p>
        </header>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Parámetros</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="flex justify-center py-8">
                <Spinner size="lg" />
              </p>
            ) : (
              <>
                <fieldset className="space-y-4 border-0 p-0">
                  {Object.keys(labels).map((clave) => (
                    <Input
                      key={clave}
                      label={labels[clave] ?? clave}
                      value={valores[clave] ?? ''}
                      onChange={(e) =>
                        setValores((prev) => ({ ...prev, [clave]: e.target.value }))
                      }
                    />
                  ))}
                </fieldset>
                <Button
                  className="mt-6 w-full"
                  disabled={updateMutation.isLoading}
                  onClick={handleSave}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </>
    </Layout>
  )
}
