import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Calendar, FileText } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
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
      </CardContent>
    </Card>
  )
}
