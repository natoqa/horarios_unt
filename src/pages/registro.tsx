import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { trpc } from '@/lib/trpc'
import toast from 'react-hot-toast'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    nombre: '',
    apellidos: '',
  })

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success('Cuenta creada. Iniciando sesión...')
      const result = await signIn('credentials', {
        correo: form.correo,
        contrasena: form.contrasena,
        redirect: false,
      })
      if (!result?.error) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    },
    onError: (e) => toast.error(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.contrasena !== form.confirmarContrasena) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    registerMutation.mutate(form)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Sistema de Horarios UNT</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <Input label="Apellidos" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
            <Input label="Correo" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
            <Input label="Contraseña" type="password" value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })} required />
            <Input label="Confirmar contraseña" type="password" value={form.confirmarContrasena} onChange={(e) => setForm({ ...form, confirmarContrasena: e.target.value })} required />
            <Button type="submit" className="w-full" disabled={registerMutation.isLoading}>
              {registerMutation.isLoading ? <Spinner size="sm" /> : 'Registrarse'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tiene cuenta?{' '}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
