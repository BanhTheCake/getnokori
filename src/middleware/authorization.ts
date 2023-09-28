import type { NextFunction, Request, Response } from 'express'
import { failure, success } from '@/utils/apiResponse'
import PlatformKeysService from '@/services/auth/platformKeys.service'
import AuthMessages from '@/enums/messages/auth.enum'
import nkHTTPHeaders from '@/enums/http/headers.enum'

interface authOptions { allowAnonymous?: boolean }
export default (options: authOptions = { allowAnonymous: false }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if(req.path && req.path === '/v1/feedback/')
      return next()

    if(req.path && req.path === '/v1/mail/vendors/mailgun/webhooks')
      return next()
    
    if(!req.headers[nkHTTPHeaders.NK_API_KEY] && options.allowAnonymous)
      return next()

    if(!req.headers[nkHTTPHeaders.NK_API_KEY])
      return res.status(401).json(failure(AuthMessages.UNAUTHORIZED))
    
    const apiKey = req.headers[nkHTTPHeaders.NK_API_KEY] as string

    const platformAccount = await PlatformKeysService.findByAPIKey(apiKey)
    if(!platformAccount?.platformAccountId)
      return res.status(401).json(failure(AuthMessages.UNAUTHORIZED, null, 401))

    // const accountSettings = await AccountSettingsService.getSettingByKey(platformAccount.accountId, AccountSettingsEnum.ACCOUNT_BLOCKED)
    // if(accountSettings){
    //   if(accountSettings === 'true')
    //     return res.status(402).json(failure(AuthMessages.INSUFFICIENT_FUNDS, null, 402))
    // }

    req.user = { 
      userId: null, 
      accountId: null,
      platformAccountId: platformAccount.platformAccountId,
    }

    return next()
  }
}
