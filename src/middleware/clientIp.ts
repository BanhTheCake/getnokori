import { getClientIp } from 'request-ip'
import type { NextFunction, Request, Response } from 'express'

export default function (req: Request, res: Response, next: NextFunction) {
  req['clientIp'] = getClientIp(req)

  next()
}
