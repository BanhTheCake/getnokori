import { Router } from 'express'
import RequestHandlers from './controller'
import PlatformSessions from '@/middleware/platformSessions'
import Frequencies from '@/middleware/frequencies'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.post(
  '/execute',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(), 
  RequestHandlers.handleQueryExecutionRequest,
)

router.post(
  '/drafts/execute',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(), 
  RequestHandlers.handleDraftQueryExecutionRequest,
)

//
// Queries - Handle Query Requests
//
// router.get('/:hubId/queries', AuthMiddleware(), RequestHandlers.handleQueryRequest)

//
// Queries - Create Query
//
router.post(
  '/',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(), 
  RequestHandlers.handleCreateQuery,
)

//
// Queries - Get Query
//
router.get(
  '/:queryId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(), 
  RequestHandlers.handleGetQuery,
)

//
// Queries - Update Query
//
router.put(
  '/:queryId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(), 
  RequestHandlers.handleUpdateQuery,
)

//
// Queries - Create Query
//
router.delete(
  '/:queryId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(), 
  RequestHandlers.handleDeleteQuery,
)

router.get(
  '/:queryId/logs',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(), 
  RequestHandlers.handleGetQueryLogs,
)

router.get(
  '/:queryId/logs/:logId',
  PlatformSessions({ allowAnonymous: true }), 
  FrequenciesMiddleware(), 
  RequestHandlers.handleGetQueryLog,
)

export default router
