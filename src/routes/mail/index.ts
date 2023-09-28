import { Router } from 'express'
import RequestHandlers from './controller'
import PlatformSessions from '@/middleware/platformSessions'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

router.post('/vendors/mailgun/webhooks',
  RequestHandlers.handleMailgunWebhook,
)

router.post('/send',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleSendMail,
)

router.get('/sent',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetSentMail,
)

router.get('/sent/:emailId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetSentMailSingle,
)

router.get('/templates',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetTemplates,
)

router.get('/templates/:templateId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetTemplate,
)

router.post('/templates',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleCreateTemplate,
)

router.put('/templates/:templateId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleUpdateTemplate,
)

router.delete('/templates/:templateId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleDeleteTemplate,
)

router.get('/domains',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetDomains,
)

router.post('/domains',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleCreateDomain,
)

router.delete('/domains/:domain',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleDeleteDomain,
)

router.get('/stats/sends',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetSendStats,
)

router.get('/settings/:settingKey',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetSetting,
)

router.put('/settings',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  RequestHandlers.handleUpdateSettings,
)

export default router
