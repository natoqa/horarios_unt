import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'UNT Credentials',
      credentials: {
        correo: { 
          label: 'Correo Electrónico', 
          type: 'email',
          placeholder: 'usuario@unitru.edu.pe' 
        },
        contrasena: { 
          label: 'Contraseña', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) {
          throw new Error('Credenciales incompletas')
        }

        const usuario = await prisma.usuario.findUnique({
          where: { correo: credentials.correo },
          include: { docente: true }
        })

        if (!usuario || !usuario.activo) {
          throw new Error('Usuario no encontrado o inactivo')
        }

        const contrasenaValida = await bcrypt.compare(
          credentials.contrasena, 
          usuario.contrasena
        )

        if (!contrasenaValida) {
          await prisma.auditoriaCambio.create({
            data: {
              usuario_id: usuario.id,
              accion: 'LOGIN_FALLIDO',
              entidad: 'Usuario',
              entidad_id: usuario.id,
              cambios: { motivo: 'contraseña incorrecta' }
            }
          })
          throw new Error('Contraseña incorrecta')
        }

        await prisma.auditoriaCambio.create({
          data: {
            usuario_id: usuario.id,
            accion: 'LOGIN_EXITOSO',
            entidad: 'Usuario',
            entidad_id: usuario.id,
            cambios: { navegador: 'web' }
          }
        })

        return {
          id: usuario.id,
          correo: usuario.correo,
          nombre: `${usuario.nombre} ${usuario.apellidos}`,
          rol: usuario.rol,
          docente_id: usuario.docente?.id || null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.rol = (user as { rol: string }).rol
        token.docente_id = (user as { docente_id: string | null }).docente_id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.rol = token.rol as string
        session.user.docente_id = (token.docente_id as string | null) ?? null
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
  },
  secret: process.env.NEXTAUTH_SECRET
}

