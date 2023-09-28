import type { NextFunction, Request, Response } from 'express'
import { getMetric } from '@/services/dashboard'
import type { ActiveAccountsParams } from '@/types/dashboard/types'
import { success } from '@/utils/apiResponse'
import { dateStringToISO8601 } from '@/utils/dates'

const handleGetDashboardMetric = async (req: Request, res: Response, next: NextFunction) => {
  const { platformAccountId } = req.user
  const { metric } = req.params

  const datesFrom = req.query.datesFrom ? dateStringToISO8601(req.query.datesFrom as string) : null
  const datesTo = req.query.datesTo ? dateStringToISO8601(req.query.datesTo as string) : null
  
  const metricsParams = { datesFrom, datesTo } as ActiveAccountsParams

  const metrics = await getMetric(platformAccountId, metric, metricsParams)
  return res.status(200).json(success(metrics))

}

export default {
  handleGetDashboardMetric,
}
