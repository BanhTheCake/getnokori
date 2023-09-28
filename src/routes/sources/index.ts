import { Router } from 'express'
import RequestHandlers from './controller'
import PlatformSessions from '@/middleware/platformSessions'
import Frequencies from '@/middleware/frequencies'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.get('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.getSources,
)

router.post('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleCreateSource,
)

router.get('/catalog',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.getSourcesCatalog,
)

router.post('/validate',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleValidateSource,
)

router.get('/:sourceId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.getSourceById,
)

router.put('/:sourceId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleUpdateSource,
)

router.delete('/:sourceId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleDeleteSource,
)

router.get('/:sourceId/schemas',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.getSourceSchemas,
) 

router.get('/:sourceId/schemas/:schemaId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.getSourceSchema,
) 

// Returns a list of tables/indexes depending on database type
router.get('/:sourceId/schemas/:schemaId/entities',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.getSchemaEntities,
) 

export default router
