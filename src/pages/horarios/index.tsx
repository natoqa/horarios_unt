import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { trpc } from '@/lib/trpc'
import { nombreDia, formatearHora } from '@/lib/utils'
import { CICLOS_ACADEMICOS } from '@/lib/constants'
import { useState } from 'react'
import { Calendar } from 'lucide-react'

export default function HorariosPage() {
  const [ciclo, setCiclo] = useState('2024-I')
  const { data: horarios, isLoading } = trpc.horario.getAll.useQuery({ ciclo })

  return (
    <Layout>
      <>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <span>
            <h1 className="text-3xl font-bold text-gray-900">Horarios</h1>
            <p className="text-gray-500 mt-1">Vista de horarios generados</p>
          </span>
          <span className="flex items-center gap-3">
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={ciclo}
              onChange={(e) => setCiclo(e.target.value)}
            >
              {CICLOS_ACADEMICOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Link href="/horarios/generar">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Generar horarios
              </Button>
            </Link>
          </span>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Horario — ciclo {ciclo}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="flex justify-center py-12">
                <Spinner size="lg" />
              </p>
            ) : !horarios?.length ? (
              <EmptyState
                titulo="Sin horarios"
                descripcion="Genere horarios automáticamente desde el panel de generación."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Día</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horarios.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{nombreDia(h.dia)}</TableCell>
                      <TableCell>
                        {formatearHora(h.hora_inicio)} — {formatearHora(h.hora_fin)}
                      </TableCell>
                      <TableCell>{h.curso.codigo}</TableCell>
                      <TableCell>{h.docente.apellidos}</TableCell>
                      <TableCell>{h.ambiente.codigo}</TableCell>
                      <TableCell>{h.tipo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </>
    </Layout>
  )
}
