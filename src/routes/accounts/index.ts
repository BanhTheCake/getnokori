import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import { failure } from '@/utils/apiResponse'
import RequestHandlers from './controller'
import APIReqProps from '@/enums/APIReqProps.enum'
import multer from 'multer'
import FrequenciesMiddleware from '@/middleware/frequencies'
const upload = multer()

const router = Router()

const assertMinimumAccountProps = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const platformAccountId = req[APIReqProps.PLATFORM_ACCOUNT_ID] || null
    const accountId = req.params.accountId || null
    const userId = req.params.userId || null

    if(!platformAccountId || !accountId || !userId) return res.status(400).json(failure('Missing required params'))
    
    if(accountId === ':accountId' || userId === ':userId') return res.status(400).json(failure('Missing required params'))
    next()
  }
}

/**
 * Get User profile
 *
 * @var {[type]}
 */
router.get('/:accountId/users/:userId',
  assertMinimumAccountProps(),
  FrequenciesMiddleware(),
  RequestHandlers.handleGetUserProfile,
)

/**
 * Update User Profile
 *
 * @var {[type]}
 */
router.put('/:accountId/users/:userId',
  FrequenciesMiddleware(),
  RequestHandlers.handleUpdateUserProfile,
)

/**
 * TODO: Update User Password
 *
 * @var {[type]}
 */
// router.put('/:accountId/users/:userId/password',
// RequestHandlers.handleUpdateUserPassword)

/**
 * Handle Avatar Upload
 *
 * @var {[type]}
 */
router.put('/:accountId/users/:userId/avatar',
  upload.any(),
  RequestHandlers.handleImageUpload,
)

router.get('/:accountId/settings',
  FrequenciesMiddleware(),
  RequestHandlers.handleGetAccountSettings,
 
)

/**
 * Delete Account
 *
 * @var {[type]}
 */
// router.delete('/:accountId', Sessions({ allowAnonymous: true }), RequestHandlers.handleDeleteAccount)

export default router
