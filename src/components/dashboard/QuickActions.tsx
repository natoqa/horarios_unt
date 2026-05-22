import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Calendar, FileText, Clock } from 'lucide-react'
import { useSession } from 'next-auth/react'

export function QuickActions() {
  const { data: session } = useSession()
  const rol = (session?.user as { rol?: string })?.rol
  const docenteId = (session?.user as { docente_id?: string | null })?.docente_id
  const esDocente = rol === 'DOCENTE'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg dark:text-gray-100">Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {esDocente ? (
          <>
            {docenteId && (
              <Link href={`/docentes/${docenteId}`}>
                <Button variant="default" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Ver mi disponibilidad
                </Button>
              </Link>
            )}
            <Link href="/horarios">
              <Button variant="secondary" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Ver horarios
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/docentes">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Gestionar docentes
              </Button>
            </Link>
            <Link href="/horarios/generar">
              <Button variant="default" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Generar horarios
              </Button>
            </Link>
            <Link href="/reportes">
              <Button variant="secondary" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Ver reportes
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
