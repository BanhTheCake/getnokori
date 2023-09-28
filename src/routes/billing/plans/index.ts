import PlatformSessions from '@/middleware/platformSessions'
import { Router } from 'express'
import controller from './controller'

const router = Router()

router.get('/', PlatformSessions(), controller.getPlans)
router.get('/subscriptions/:accountId', PlatformSessions(), controller.getAccountSubscriptions)

router.post('/', PlatformSessions(), controller.createPlan)

router.post('/subscribe', PlatformSessions(), controller.subscribeAccountToPlan)

export default router
