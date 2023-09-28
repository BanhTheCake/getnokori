import { Router } from 'express'
import RequestHandlers from './controller'
import PlatformSessions from '@/middleware/platformSessions'
import Frequencies from '@/middleware/frequencies'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.post('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleCreateTrigger,
)

router.delete('/:triggerId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleDeleteTrigger,
)

export default router
