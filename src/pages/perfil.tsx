import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { trpc } from '@/lib/trpc'
import toast from 'react-hot-toast'

export default function PerfilPage() {
  const { data: perfil, isLoading } = trpc.auth.getPerfil.useQuery()
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre)
      setApellidos(perfil.apellidos)
    }
  }, [perfil])

  const updatePerfil = trpc.auth.actualizarPerfil.useMutation({
    onSuccess: () => toast.success('Perfil actualizado'),
    onError: (e) => toast.error(e.message),
  })
  const cambiarContrasena = trpc.auth.cambiarContrasena.useMutation({
    onSuccess: () => {
      toast.success('Contraseña actualizada')
      setContrasenaActual('')
      setNuevaContrasena('')
    },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <Layout>
        <p className="flex justify-center py-24">
          <Spinner size="lg" />
        </p>
      </Layout>
    )
  }

  return (
    <Layout>
      <>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1>
          <p className="text-gray-500 mt-1">{perfil?.correo} — {perfil?.rol}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Datos personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <Input label="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
              <Button
                onClick={() => updatePerfil.mutate({ nombre, apellidos })}
                disabled={updatePerfil.isLoading}
              >
                Guardar perfil
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Contraseña actual"
                type="password"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
              />
              <Input
                label="Nueva contraseña"
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={() =>
                  cambiarContrasena.mutate({
                    contrasena_actual: contrasenaActual,
                    nueva_contrasena: nuevaContrasena,
                  })
                }
                disabled={cambiarContrasena.isLoading}
              >
                Actualizar contraseña
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    </Layout>
  )
}
