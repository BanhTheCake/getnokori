import { Router } from 'express'
import PlatformSessions from '@/middleware/platformSessions'
import plansRoutes from './plans'
import controller from './controller'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.use('/plans', plansRoutes)

router.get('/balance', 
  PlatformSessions({ allowAnonymous: true }), 
  FrequenciesMiddleware(), 
  controller.getAccountBalance,
)

export default router
