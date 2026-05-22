import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import superjson from 'superjson'
import { ZodError } from 'zod'

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerSession(opts.req, opts.res, authOptions)
  
  return {
    session,
    prisma,
    req: opts.req,
    res: opts.res,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Debe iniciar sesión para acceder a este recurso',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session as typeof ctx.session & {
        user: { id: string; rol?: string; docente_id?: string | null }
      },
    },
  })
})

const isAdmin = middleware(async ({ ctx, next }) => {
  const rol = (ctx.session?.user as { rol?: string } | undefined)?.rol
  const esAdminNivel = 
    rol === 'ADMINISTRADOR' || 
    rol === 'SECRETARIA' || 
    rol === 'DIRECTOR' || 
    rol === 'COORDINADOR'

  if (!ctx.session?.user?.id || !esAdminNivel) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Se requieren permisos de administración',
    })
  }

  return next({ ctx })
})

export const protectedProcedure = t.procedure.use(isAuthenticated)
export const adminProcedure = t.procedure.use(isAuthenticated).use(isAdmin)

export function getUserId(ctx: Context): string {
  const id = ctx.session?.user?.id
  if (!id) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Debe iniciar sesión para acceder a este recurso',
    })
  }
  return id
}
