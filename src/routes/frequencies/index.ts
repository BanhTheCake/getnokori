import { Router } from 'express'
import RequestHandlers from './controller'
import PlatformSessions from '@/middleware/platformSessions'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.get('/:metric',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetEvents,
)

router.put('/:metric/increment',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleIncrementMetric,
)

export default router
