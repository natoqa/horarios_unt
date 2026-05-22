import { useSession } from 'next-auth/react'
import { Menu, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface NavbarProps {
  onMobileMenuToggle: () => void
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const { data: session } = useSession()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    console.log('Toggle clicked. Current resolvedTheme:', resolvedTheme, 'Switching to:', newTheme)
    console.log('HTML class before:', document.documentElement.className)
    setTheme(newTheme)
    setTimeout(() => {
      console.log('HTML class after:', document.documentElement.className)
    }, 100)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 dark:border-gray-700/80 dark:bg-gray-900/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 hidden sm:block">Escuela de Ingeniería de Sistemas</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 sm:hidden">Ing. de Sistemas</p>
          <p className="text-[11px] text-gray-400">Universidad Nacional de Trujillo</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
            aria-label="Cambiar tema"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
        )}
        <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </button>
      </div>
    </header>
  )
}
