import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  titulo: string
  descripcion: string
  icon?: React.ReactNode
  accion?: React.ReactNode
}

export function EmptyState({ titulo, descripcion, icon, accion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-gray-400 mb-4">
        {icon || <InboxIcon className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{titulo}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">{descripcion}</p>
      {accion && <div>{accion}</div>}
    </div>
  )
}
