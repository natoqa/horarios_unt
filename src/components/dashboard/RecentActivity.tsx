import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatearFecha } from '@/lib/utils'

interface Actividad {
  id: string
  usuario: string
  accion: string
  entidad: string
  fecha: Date | string
}

interface RecentActivityProps {
  actividad?: Actividad[] | null
}

export function RecentActivity({ actividad }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg dark:text-gray-100">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {!actividad?.length ? (
          <EmptyState titulo="Sin actividad" descripcion="Aún no hay registros de auditoría." />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {actividad.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item.usuario}</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {item.accion} — {item.entidad}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{formatearFecha(item.fecha)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
