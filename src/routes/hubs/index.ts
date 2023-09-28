import { Router } from 'express'
import RequestHandlers from './controller'
import ServerEnvironments from '@/enums/ServerEnvs.enum'
import PlatformSessions from '@/middleware/platformSessions'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.get('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetHubs,
)

router.post('/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleCreateHub,
)

router.get('/:hubId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetHub,
)

router.put('/:hubId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleUpdateHub,
)

/**
 * Hub Contents (file tree and structure)
 */
router.put('/:hubId/contents',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleUpdateHubContent,
)

router.get('/:hubId/contents',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetHubContent,
)

/**
 * Hub Nodes
 */
// Create existing node info (label, parentId, etc.)
router.post('/:hubId/contents/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleCreateNode,
)

// Update existing node info (label, parentId, etc.)
router.put('/:hubId/contents/:nodeId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleUpdateNode,
)

router.delete('/:hubId/contents/:nodeId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleDeleteNode,
)

router.post('/:hubId/prompt',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleHubPromptRequest,
)

// Sources

// ?hubId=:hubId
// ?global=true

// Returns a list of tables/indexes depending on database type
// router.get('/:hubId/sources/:sourceId/schemas/:schemaId/entities', sourcesHandlers.getSchemaEntities)

if(process.env.NODE_ENV !== ServerEnvironments.PROD) {
  router.delete('/',
    PlatformSessions({ allowAnonymous: true }),
    FrequenciesMiddleware(),
    RequestHandlers.handleTruncateHubs,
  )
}

export default router
