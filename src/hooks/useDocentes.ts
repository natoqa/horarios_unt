import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import toast from 'react-hot-toast'
import type { FiltrosDocente, DocenteConRelaciones } from '@/types'

export function useDocentes() {
  const [filtros, setFiltros] = useState<FiltrosDocente>({
    activo: true,
  })

  const { data: docentes, isLoading, refetch } = trpc.docente.getAll.useQuery()

  const createMutation = trpc.docente.create.useMutation({
    onSuccess: () => {
      toast.success('Docente creado exitosamente')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateMutation = trpc.docente.update.useMutation({
    onSuccess: () => {
      toast.success('Docente actualizado exitosamente')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = trpc.docente.delete.useMutation({
    onSuccess: () => {
      toast.success('Docente eliminado exitosamente')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const docentesFiltrados = docentes?.filter((docente) => {
    if (filtros.categoria && docente.categoria !== filtros.categoria) return false
    if (filtros.tipo && docente.tipo !== filtros.tipo) return false
    if (filtros.activo !== undefined && docente.activo !== filtros.activo) return false
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase()
      return (
        docente.nombres.toLowerCase().includes(busqueda) ||
        docente.apellidos.toLowerCase().includes(busqueda) ||
        docente.codigo.toLowerCase().includes(busqueda) ||
        docente.correo.toLowerCase().includes(busqueda)
      )
    }
    return true
  })

  return {
    docentes: docentesFiltrados as DocenteConRelaciones[] | undefined,
    isLoading,
    filtros,
    setFiltros,
    createDocente: createMutation.mutateAsync,
    updateDocente: updateMutation.mutateAsync,
    deleteDocente: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
