import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { trpc } from '@/lib/trpc'
import { CICLOS_ACADEMICOS, CICLO_ACADEMICO_DEFAULT } from '@/lib/constants'
import toast from 'react-hot-toast'
import { Download, FileText } from 'lucide-react'

function descargarPdf(base64: string, nombre: string) {
  const link = document.createElement('a')
  link.href = `data:application/pdf;base64,${base64}`
  link.download = nombre
  link.click()
}

export default function ReportesPage() {
  const [ciclo, setCiclo] = useState(CICLO_ACADEMICO_DEFAULT)
  const [docenteId, setDocenteId] = useState('')

  const { data: docentes } = trpc.docente.getAll.useQuery()
  const generalMutation = trpc.reporte.generarHorarioGeneral.useMutation({
    onSuccess: (d) => {
      descargarPdf(d.archivo, d.nombre)
      toast.success('PDF descargado')
    },
    onError: (e) => toast.error(e.message),
  })
  const docenteMutation = trpc.reporte.generarHorarioDocente.useMutation({
    onSuccess: (d) => {
      descargarPdf(d.archivo, d.nombre)
      toast.success('PDF descargado')
    },
    onError: (e) => toast.error(e.message),
  })
  const ambientesMutation = trpc.reporte.generarReporteAmbientes.useMutation({
    onSuccess: (d) => {
      descargarPdf(d.archivo, d.nombre)
      toast.success('PDF descargado')
    },
    onError: (e) => toast.error(e.message),
  })

  const loading =
    generalMutation.isLoading ||
    docenteMutation.isLoading ||
    ambientesMutation.isLoading

  return (
    <Layout>
      <>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">Exportación de horarios en PDF</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Horario general
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Ciclo"
                value={ciclo}
                onChange={(e) => setCiclo(e.target.value)}
                options={CICLOS_ACADEMICOS.map((c) => ({ value: c, label: c }))}
              />
              <Button
                className="w-full"
                disabled={loading}
                onClick={() => generalMutation.mutate({ ciclo })}
              >
                {loading ? <Spinner size="sm" /> : <Download className="mr-2 h-4 w-4" />}
                Descargar PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horario por docente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Docente"
                value={docenteId}
                onChange={(e) => setDocenteId(e.target.value)}
                options={
                  docentes?.map((d) => ({
                    value: d.id,
                    label: `${d.apellidos}, ${d.nombres}`,
                  })) ?? []
                }
                placeholder="Seleccione docente"
              />
              <Button
                className="w-full"
                disabled={loading || !docenteId}
                onClick={() => docenteMutation.mutate({ docenteId })}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reporte de ambientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="secondary"
                disabled={loading}
                onClick={() => ambientesMutation.mutate()}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    </Layout>
  )
}
