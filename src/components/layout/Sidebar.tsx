import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'

const menuPrincipal = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/docentes', label: 'Docentes', icon: Users },
  { href: '/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/ambientes', label: 'Ambientes', icon: Building2 },
  { href: '/horarios', label: 'Horarios', icon: Calendar },
]

const menuSecundario = [
  { href: '/reportes', label: 'Reportes', icon: FileText },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const nombre = session?.user?.name ?? 'Usuario'
  const rol = (session?.user as { rol?: string })?.rol ?? 'Usuario'
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setUserMenuOpen(false)
  }, [collapsed])

  const NavItem = ({ item, isCollapsed }: { item: typeof menuPrincipal[0]; isCollapsed: boolean }) => {
    const Icon = item.icon
    const active = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href))

    return (
      <Link
        href={item.href}
        onClick={onMobileClose}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150',
          isCollapsed ? 'justify-center px-2.5' : 'px-3',
          active
            ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/25'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-white')} />
        {!isCollapsed && <span>{item.label}</span>}
        {isCollapsed && (
          <div className="absolute left-full ml-2 hidden rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </Link>
    )
  }

  const buildContent = (isCollapsed: boolean) => (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="relative h-16 shrink-0 border-b border-gray-100">
        <div className="flex items-center h-full px-4 gap-3">
          <Image src="/images/logo-unt.png" alt="UNT" width={40} height={40} className="object-contain shrink-0" />
          <div className={cn(
            'min-w-0 whitespace-nowrap',
            isCollapsed ? 'opacity-0' : 'opacity-100'
          )}>
            <p className="text-sm font-bold text-gray-900 leading-tight">Horarios UNT</p>
            <p className="text-[11px] text-gray-400">Ing. de Sistemas</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 overflow-y-auto py-4', isCollapsed ? 'px-2' : 'px-3')}>
        <div className="h-5 mb-1">
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Principal</p>
          )}
        </div>
        <div className="space-y-0.5">
          {menuPrincipal.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>

        <div className={cn('my-4', isCollapsed ? 'mx-1' : 'mx-3')}>
          <div className="border-t border-gray-100" />
        </div>

        <div className="h-5 mb-1">
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sistema</p>
          )}
        </div>
        <div className="space-y-0.5">
          {menuSecundario.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>
      </nav>

      {/* Footer - Usuario */}
      <div className={cn('border-t border-gray-100 shrink-0 relative', isCollapsed ? 'p-2' : 'p-3')} ref={userMenuRef}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">{iniciales}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{nombre}</p>
              <p className="text-[11px] text-gray-400 truncate capitalize">{rol.toLowerCase()}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                'w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center transition-all',
                userMenuOpen && 'ring-2 ring-primary-300 ring-offset-2'
              )}
            >
              <span className="text-[11px] font-bold text-white">{iniciales}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute left-full bottom-2 ml-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{nombre}</p>
                  <p className="text-[11px] text-gray-400 capitalize">{rol.toLowerCase()}</p>
                </div>
                <div className="py-1.5">
                  <Link
                    href="/perfil"
                    onClick={() => { setUserMenuOpen(false); onMobileClose() }}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Mi perfil
                  </Link>
                  <Link
                    href="/configuracion"
                    onClick={() => { setUserMenuOpen(false); onMobileClose() }}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                </div>
                <div className="border-t border-gray-100 py-1.5">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar móvil - siempre expandido */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[272px] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {buildContent(false)}
      </aside>

      {/* Sidebar desktop */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen lg:block',
          'transition-[width] duration-200 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-[260px]'
        )}
      >
        <aside className="h-full bg-white border-r border-gray-200/80 overflow-hidden">
          {buildContent(collapsed)}
        </aside>
        <button
          onClick={onToggle}
          className="absolute top-7 -right-3 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 shadow-sm transition-colors z-50"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>
    </>
  )
}
