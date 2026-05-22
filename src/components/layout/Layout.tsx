import { useState, useEffect, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Spinner } from '@/components/ui/Spinner'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const rol = (session?.user as { rol?: string })?.rol
  const userDocenteId = (session?.user as { docente_id?: string | null })?.docente_id
  const esDocente = rol === 'DOCENTE'

  let isUnauthorized = false
  if (status === 'authenticated' && esDocente && router.isReady) {
    const path = router.pathname
    if (
      path === '/docentes' ||
      path.startsWith('/cursos') ||
      path.startsWith('/ambientes') ||
      path.startsWith('/reportes') ||
      path.startsWith('/configuracion') ||
      path === '/horarios/generar' ||
      (path === '/docentes/[id]' && router.query.id !== userDocenteId)
    ) {
      isUnauthorized = true
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`)
      return
    }

    if (status === 'authenticated' && router.isReady && isUnauthorized) {
      router.replace('/dashboard')
    }
  }, [status, router, router.isReady, isUnauthorized])

  useEffect(() => {
    setMobileOpen(false)
  }, [router.pathname])

  if (status === 'loading' || (status === 'authenticated' && isUnauthorized)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-200',
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
        )}
      >
        <Navbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
