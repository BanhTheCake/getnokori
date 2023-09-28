import type { NextFunction, Request, Response } from 'express'
import { failure, success } from '@/utils/apiResponse'
import AuthService from '@/services/auth/auth.service'
import nkHTTPHeaders from '@/enums/http/headers.enum'
import type { AuthZFailure }from '@/types/auth/apiResponses.interface'

interface authOptions { allowAnonymous?: boolean }
export default (options: authOptions = { allowAnonymous: false }) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    const { platformAccountId } = req.user

    // If the platformAccountId is not the master platform account id, then we can skip this middleware
    if(platformAccountId !== process.env.NK_MASTER_PLATFORM_ACCT_ID) return next()

    const accessToken = req.get(nkHTTPHeaders.NK_AUTHORIZATION)?.split(' ')[1]

    if(!accessToken && options.allowAnonymous)
      return next()

    if(!accessToken) {
      const response: AuthZFailure = {
        status: 'unauthorized',
        redirectTo: '/login', // TODO: Make this dynamic
      }
      return res.status(401).json(success(response))
    }
    
    // Gather the access token from the headers
    const authZAttempt = await AuthService.userAuthorized(platformAccountId, accessToken)
    if(!authZAttempt) {
      const response: AuthZFailure = {
        status: 'unauthorized',
        redirectTo: '/login', // TODO: Make this dynamic
      }
      return res.status(401).json(success(response))
    }

    const { userId, accountId } = authZAttempt

    if(!userId || !accountId) {
      const response: AuthZFailure = {
        status: 'unauthorized',
        redirectTo: '/login', // TODO: Make this dynamic
      }
      return res.status(401).json(success(response))
    }

    if(req.params.userId === userId) 
      return next()

    if(req.params.accountId === accountId)
      return next()

    /**
     * This "upgrades" the user's account to the platform account Id that is
     * about to act "downstream" of this middleware. This is necessary because
     * for Nokori's platform, users are manipulating their own objects on the platform
     * via our UI. This would never be the case for any of our customer's UIs though.
     */
    const shouldUpgrade = req.get(nkHTTPHeaders.NK_SHOULD_UPGRADE)
    if(platformAccountId === process.env.NK_MASTER_PLATFORM_ACCT_ID && shouldUpgrade !== 'false')
      req.user.platformAccountId = accountId
    
    return next()
  }
}
