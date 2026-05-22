import { Users, BookOpen, Building2, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Estadisticas {
  totalDocentes?: number
  totalCursos?: number
  totalAulas?: number
  totalLaboratorios?: number
  totalHorarios?: number
  porcentajeOcupacion?: string
}

interface StatsCardsProps {
  estadisticas?: Estadisticas | null
}

const cards = [
  { key: 'docentes', label: 'Docentes', icon: Users, field: 'totalDocentes' as const },
  { key: 'cursos', label: 'Cursos', icon: BookOpen, field: 'totalCursos' as const },
  { key: 'aulas', label: 'Aulas', icon: Building2, field: 'totalAulas' as const },
  { key: 'horarios', label: 'Horarios activos', icon: Calendar, field: 'totalHorarios' as const },
]

export function StatsCards({ estadisticas }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, field }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</CardTitle>
            <Icon className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{estadisticas?.[field] ?? 0}</p>
            {key === 'horarios' && estadisticas?.porcentajeOcupacion && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ocupación: {estadisticas.porcentajeOcupacion}%
              </p>
            )}
            {key === 'aulas' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Labs: {estadisticas?.totalLaboratorios ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
