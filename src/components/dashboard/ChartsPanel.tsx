import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const COLORS = ['#2563eb', '#8B0000', '#10b981', '#f59e0b', '#6366f1']

interface Estadisticas {
  docentesPorCategoria?: { categoria: string; _count: number }[]
  cursosPorCiclo?: { ciclo: number; _count: number }[]
}

interface ChartsPanelProps {
  estadisticas?: Estadisticas | null
}

export function ChartsPanel({ estadisticas }: ChartsPanelProps) {
  const docentesData =
    estadisticas?.docentesPorCategoria?.map((d) => ({
      name: d.categoria.replace('_', ' '),
      total: d._count,
    })) ?? []

  const cursosData =
    estadisticas?.cursosPorCiclo?.map((c) => ({
      name: `Ciclo ${c.ciclo}`,
      total: c._count,
    })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribución</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-48">
          <p className="mb-2 text-sm font-medium text-gray-600">Docentes por categoría</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={docentesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {cursosData.length > 0 && (
          <div className="h-48">
            <p className="mb-2 text-sm font-medium text-gray-600">Cursos por ciclo</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cursosData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {cursosData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
