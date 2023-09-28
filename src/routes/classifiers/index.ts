import PlatformSessions from '@/middleware/platformSessions'
import { Router } from 'express'
import controller from './controller'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.get('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetClassifiers,
)

router.post('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleCreateClassifier,
)

router.get('/:classifierId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetClassifier,
)

router.put('/:classifierId/train',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleTrainClassifier,
)

router.post('/:classifierId/predict',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleClassifierPredict,
)

router.delete('/:classifierId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleDeleteClassifier,
)

router.delete('/:classifierId/classes/:classId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleDeleteClass,
)

export default router
