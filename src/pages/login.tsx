import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Spinner } from '@/components/ui/Spinner'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  })
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {}

    if (!formData.correo) {
      nuevosErrores.correo = 'El correo es requerido'
    } else if (!formData.correo.includes('@')) {
      nuevosErrores.correo = 'Ingrese un correo válido'
    }

    if (!formData.contrasena) {
      nuevosErrores.contrasena = 'La contraseña es requerida'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        correo: formData.correo,
        contrasena: formData.contrasena,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Inicio de sesión exitoso')
        const callbackUrl = router.query.callbackUrl as string
        router.push(callbackUrl || '/dashboard')
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const isActive = (field: string) => focused === field || formData[field as keyof typeof formData]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Columna izquierda - Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-gradient-to-br from-primary-900 via-primary-800 to-unt-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-500 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-300 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-16">
          <div />
          <div className="flex flex-col items-center text-white">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl p-3">
              <Image src="/images/logo-unt.png" alt="Logo UNT" width={110} height={110} className="object-contain" />
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-center mb-4 leading-tight">
              Sistema de Gestión<br />de Horarios
            </h1>
            <p className="text-primary-200 text-center text-base xl:text-lg mb-10 max-w-sm">
              Escuela Profesional de Ingeniería de Sistemas
            </p>
            <div className="space-y-3 w-full max-w-xs">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="w-8 h-8 bg-primary-500/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-primary-100">Gestión de horarios académicos</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="w-8 h-8 bg-primary-500/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm text-primary-100">Control de docentes y ambientes</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="w-8 h-8 bg-primary-500/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-primary-100">Reportes y estadísticas</span>
              </div>
            </div>
          </div>
          <p className="text-primary-300/60 text-xs text-center">
            Universidad Nacional de Trujillo &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Columna derecha - Formulario */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 bg-white">
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10">
          <div className="w-full max-w-[420px]">
            {/* Header móvil */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mb-5 p-2 shadow-lg shadow-primary-600/25">
                <Image src="/images/logo-unt.png" alt="Logo UNT" width={60} height={60} className="object-contain" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sistema de Horarios</h2>
              <p className="text-sm text-gray-400 mt-0.5">Ingeniería de Sistemas - UNT</p>
            </div>

            {/* Header desktop */}
            <div className="hidden lg:block mb-10">
              <p className="text-sm font-medium text-primary-600 mb-2 tracking-wide uppercase">Bienvenido de vuelta</p>
              <h2 className="text-3xl xl:text-[2.125rem] font-bold text-gray-900 leading-tight">
                Inicia sesión en<br />tu cuenta
              </h2>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => toast('Próximamente disponible', { icon: 'ℹ️' })}
              className="w-full h-[52px] flex items-center justify-center gap-3 border-2 border-gray-200 bg-white rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>

            {/* Separador */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">o con tu correo</span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Correo */}
              <div>
                <div
                  className={`relative border-2 rounded-xl transition-all duration-200 ${
                    errores.correo
                      ? 'border-red-400 bg-red-50/50'
                      : focused === 'correo'
                        ? 'border-primary-500 bg-white shadow-sm shadow-primary-500/10'
                        : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                  }`}
                >
                  <label
                    htmlFor="correo"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      isActive('correo')
                        ? 'top-2 text-[11px] font-semibold tracking-wide uppercase ' + (errores.correo ? 'text-red-500' : focused === 'correo' ? 'text-primary-600' : 'text-gray-500')
                        : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
                    }`}
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => {
                      setFormData({ ...formData, correo: e.target.value })
                      if (errores.correo) setErrores({ ...errores, correo: '' })
                    }}
                    onFocus={() => setFocused('correo')}
                    onBlur={() => setFocused(null)}
                    className="w-full bg-transparent px-4 pt-6 pb-2.5 text-[15px] text-gray-900 focus:outline-none"
                    autoComplete="email"
                  />
                </div>
                {errores.correo && (
                  <p className="text-[13px] text-red-500 mt-1.5 ml-1">{errores.correo}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div>
                <div
                  className={`relative border-2 rounded-xl transition-all duration-200 ${
                    errores.contrasena
                      ? 'border-red-400 bg-red-50/50'
                      : focused === 'contrasena'
                        ? 'border-primary-500 bg-white shadow-sm shadow-primary-500/10'
                        : 'border-gray-200 bg-gray-50/80 hover:border-gray-300'
                  }`}
                >
                  <label
                    htmlFor="contrasena"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      isActive('contrasena')
                        ? 'top-2 text-[11px] font-semibold tracking-wide uppercase ' + (errores.contrasena ? 'text-red-500' : focused === 'contrasena' ? 'text-primary-600' : 'text-gray-500')
                        : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
                    }`}
                  >
                    Contraseña
                  </label>
                  <input
                    id="contrasena"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.contrasena}
                    onChange={(e) => {
                      setFormData({ ...formData, contrasena: e.target.value })
                      if (errores.contrasena) setErrores({ ...errores, contrasena: '' })
                    }}
                    onFocus={() => setFocused('contrasena')}
                    onBlur={() => setFocused(null)}
                    className="w-full bg-transparent px-4 pt-6 pb-2.5 pr-12 text-[15px] text-gray-900 focus:outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                {errores.contrasena && (
                  <p className="text-[13px] text-red-500 mt-1.5 ml-1">{errores.contrasena}</p>
                )}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-[1px] active:translate-y-0 active:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <Spinner size="sm" />
                    Verificando...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Registro */}
            <p className="text-center text-sm text-gray-400 mt-8">
              ¿No tienes una cuenta?{' '}
              <Link href="/registro" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer móvil */}
        <div className="lg:hidden py-5 text-center">
          <p className="text-xs text-gray-300">
            Universidad Nacional de Trujillo &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
