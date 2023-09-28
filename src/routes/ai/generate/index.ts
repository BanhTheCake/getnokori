
import { Router } from 'express'
import RequestHandlers from './controller'
import AuthMiddleware from '@/middleware/authorization'
import PlatformSessions from '@/middleware/platformSessions'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.post('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleCreateGeneration,
)

export default router
