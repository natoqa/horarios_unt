import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/Spinner'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Spinner size="lg" className="text-primary-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">
          Sistema de Horarios
        </h1>
        <p className="text-gray-600 mt-2">
          Escuela de Ingeniería de Sistemas - UNT
        </p>
        <p className="text-sm text-gray-500 mt-4">Redirigiendo...</p>
      </div>
    </div>
  )
}
