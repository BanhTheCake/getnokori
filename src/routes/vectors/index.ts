import { Router } from 'express'
import RequestHandlers from './controller'
import PlatformSessions from '@/middleware/platformSessions'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.post('/similarity',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleVectorSimilarity,
)

router.post('/distance',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleVectorDistance,
)
 
router.post('/similarity/closest',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleClosestVector,
)

export default router
