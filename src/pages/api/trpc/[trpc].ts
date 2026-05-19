import { createNextApiHandler } from '@trpc/server/adapters/next'
import { appRouter } from '@/server/routers/root'
import { createTRPCContext } from '@/server/trpc'

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(`❌ Error en tRPC [${path}]:`, error.message)
        }
      : undefined,
})
