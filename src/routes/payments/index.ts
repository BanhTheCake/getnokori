import { Router } from 'express'
import controller from './controller'
import PlatformSessions from '@/middleware/platformSessions'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.post('/methods/create',
  PlatformSessions(),
  FrequenciesMiddleware(),
  controller.handlePaymentMethodCreate,
)

router.get('/intents/setup',
  PlatformSessions(),
  FrequenciesMiddleware(),
  controller.handleSetupIntentCreate,
)

router.get('/methods',
  PlatformSessions(),
  FrequenciesMiddleware(),
  controller.handleListPaymentMethods,
)

router.patch('/methods',
  PlatformSessions(),
  FrequenciesMiddleware(),
  controller.handleUpdatePaymentMethod,
)

router.delete('/methods/:methodId',
  PlatformSessions(),
  FrequenciesMiddleware(),
  controller.handleDeletePaymentMethod,
)

// router.patch('/settings', controller.handlePaymentSettingsUpdate)

// router.get('/setting', controller.handleGetPaymentsSetting)

export default router
