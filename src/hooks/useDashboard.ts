import { trpc } from '@/lib/trpc'

export function useDashboard() {
  const { data: estadisticas, isLoading: isLoadingStats } = 
    trpc.dashboard.getEstadisticas.useQuery()
  
  const { data: actividad, isLoading: isLoadingActivity } = 
    trpc.dashboard.getActividadReciente.useQuery()

  return {
    estadisticas,
    actividad,
    isLoading: isLoadingStats || isLoadingActivity,
    refetch: () => {
      // Se puede implementar refetch manual
    },
  }
}
