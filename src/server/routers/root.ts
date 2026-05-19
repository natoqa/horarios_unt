import { router } from '../trpc'
import { authRouter } from './auth'
import { docenteRouter } from './docente'
import { cursoRouter } from './curso'
import { ambienteRouter } from './ambiente'
import { horarioRouter } from './horario'
import { dashboardRouter } from './dashboard'
import { reporteRouter } from './reporte'
import { usuarioRouter } from './usuario'
import { configuracionRouter } from './configuracion'

export const appRouter = router({
  auth: authRouter,
  docente: docenteRouter,
  curso: cursoRouter,
  ambiente: ambienteRouter,
  horario: horarioRouter,
  dashboard: dashboardRouter,
  reporte: reporteRouter,
  usuario: usuarioRouter,
  configuracion: configuracionRouter,
})

export type AppRouter = typeof appRouter
