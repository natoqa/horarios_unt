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
        <CardTitle className="text-lg dark:text-gray-100">Distribución</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-48">
          <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Docentes por categoría</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={docentesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  color: '#f9fafb'
                }}
                itemStyle={{ color: '#f9fafb' }}
              />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {cursosData.length > 0 && (
          <div className="h-48">
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Cursos por ciclo</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cursosData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={{ fill: '#6b7280', fontSize: 11 }}
                >
                  {cursosData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    color: '#f9fafb'
                  }}
                  itemStyle={{ color: '#f9fafb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
