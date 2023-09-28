import PlatformSessions from '@/middleware/platformSessions'
import { Router } from 'express'
import controller from './controller'
import FrequenciesMiddleware from '@/middleware/frequencies'

const router = Router()

// unauthorized routes
router.post('/signup',
  FrequenciesMiddleware(),
  controller.signUp,
)

router.post('/login',
  FrequenciesMiddleware(),
  controller.login,
)

router.get('/logout',
  FrequenciesMiddleware(),
  controller.logout,
)

router.get('/api-keys',
  PlatformSessions(),
  FrequenciesMiddleware(),
  controller.handleGetApiKey,
)

router.put('/api-keys/refresh',
  PlatformSessions(),
  FrequenciesMiddleware(),
  controller.handleRefreshAPIKey,
)

// list sessions
router.get('/sessions',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetSessions,
)

router.get('/sessions/refresh',
  FrequenciesMiddleware(),
  controller.refreshSession,
)

router.get('/sessions/:sessionKey',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetSessionByKey,
)

router.delete('/sessions/:sessionKey',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleTerminateSession,
)

router.get('/users',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetUsers,
)

router.post('/users',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleCreateUser,
)

router.get('/users/stats',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetUserStats,
)

router.put('/users/password',
  FrequenciesMiddleware(),
  controller.handleResetPassword,
)

router.get('/users/:userId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetUserById,
)

router.put('/users/:userId',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleUpdateUser,
)

router.get('/users/:userId/events',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetUserActivity,
)

router.post('/users/:userId/password',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleSetPassword,
)

router.get('/users/:userId/meta',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetUserMeta,
)

router.get('/users/:userId/meta/:key',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleGetUserMetaByKey,
)

router.post('/users/:userId/meta',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleUpsertUserMeta,
)

router.delete('/users/:userId/meta',
  PlatformSessions({ allowAnonymous: true }),
  FrequenciesMiddleware(),
  controller.handleDeleteUserMeta,
)

router.get('/verify/:token',
  FrequenciesMiddleware(),
  controller.handleVerifyUser,
)
// TODO: This probably needs to be part of a strutctured notifications/events service offering
// router.put('/verify/resend/:token', controller.resendVerificationEmail)

export default router
