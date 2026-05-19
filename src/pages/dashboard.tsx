import { Layout } from '@/components/layout/Layout'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ChartsPanel } from '@/components/dashboard/ChartsPanel'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { useDashboard } from '@/hooks/useDashboard'
import { Spinner } from '@/components/ui/Spinner'

export default function DashboardPage() {
  const { estadisticas, actividad, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenido al Sistema de Gestión de Horarios - Escuela de Ingeniería de Sistemas UNT
          </p>
        </div>

        <StatsCards estadisticas={estadisticas} />

        <div className="grid gap-6 md:grid-cols-2">
          <ChartsPanel estadisticas={estadisticas} />
          <QuickActions />
        </div>

        <RecentActivity actividad={actividad} />
      </div>
    </Layout>
  )
}

