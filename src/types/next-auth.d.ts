import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      rol: string
      docente_id: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    rol: string
    docente_id: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rol?: string
    docente_id?: string | null
  }
}
