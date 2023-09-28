import PlatformSessions from '@/middleware/platformSessions'
import { Router } from 'express'
import controller from './controller'

const router = Router()

router.get('/metrics/:metric',
  PlatformSessions(),
  controller.handleGetDashboardMetric,
)

export default router
