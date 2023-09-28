import type { NextFunction, Request, Response } from 'express'
import { getMetric } from '@/services/dashboard'
import type { ActiveAccountsParams } from '@/types/dashboard/types'
import { success } from '@/utils/apiResponse'
import { getCurrentMonthDates } from '@/utils/dates'
import { getBalance } from '@/services/billing/transactions.service'

export const getAccountBalance = async (req: Request, res: Response, next: NextFunction) => {
  const { platformAccountId } = req.user
  const { metric } = req.params

  const currentPeriod = getCurrentMonthDates()

  const datesFrom = req.query.start ? req.query.start as string : currentPeriod.start
  const datesTo = req.query.end ? req.query.end as string : currentPeriod.end
  
  const balance = await getBalance(platformAccountId, datesFrom, datesTo)
  let finalBalance = 0
  if(balance)
    finalBalance = balance
  
  return res.status(200).json(success({ balance: finalBalance }))

}

export default {
  getAccountBalance,
}
