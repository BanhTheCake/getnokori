import APIResponse from '@/utils/apiResponse'
import type { Request, Response } from 'express'
import FrequenciesService from '@/services/frequencies'

import { dateStringToISO8601, datesBetweenInclusive, subtractDays } from '@/utils/dates'

const handleGetEvents = async (req: Request, res: Response) => {
  const accountId = req.user.platformAccountId
  
  let timeStart = req.query.timeStart ? dateStringToISO8601(req.query.timeStart as string) : null
  let timeEnd = req.query.timeEnd ? dateStringToISO8601(req.query.timeEnd as string) : null
  
  // Defaults to last 7 days
  if(!timeStart || !timeEnd){
    timeEnd = new Date().toISOString().split('T')[0]
    timeStart = subtractDays(timeEnd, 7)
  }

  const datesRange = datesBetweenInclusive(timeStart, timeEnd)

  const metricQ = req.params.metric as string
  if(!metricQ)
    return res.status(400).json(APIResponse.failure('Missing metric query parameter'))

  const results = await FrequenciesService.getEvents({ accountId, metricQ, dates: datesRange })

  const invertedResultsObject = invertArrayToKeyedObject(results, 'date')

  const mappedResults = datesRange.map((date: string) => {
    if(invertedResultsObject[date])
      return { date, metric: metricQ, count: Number(invertedResultsObject[date].count) }

    else
      return { date, metric: metricQ, count: 0 }
  })

  return res.status(200).json(APIResponse.success(mappedResults))
}

const handleIncrementMetric = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const value = req.body.value || 1

  const metricQ = req.params.metric as string
  if(!metricQ)
    return res.status(400).json(APIResponse.failure('Missing metric query parameter'))

  FrequenciesService.increment(platformAccountId, metricQ, value)

  const response = {
    name: metricQ,
    incr: value,
  }
  return res.status(200).json(APIResponse.success(response))
}

const handleDecrementMetric = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const value = req.body.value || 1

  const metricQ = req.params.metric as string
  if(!metricQ)
    return res.status(400).json(APIResponse.failure('Missing metric query parameter'))

  FrequenciesService.decrement(platformAccountId, metricQ, value)

  return res.status(200).json(APIResponse.success())
}

function invertArrayToKeyedObject(array: any[], key: string){
  const obj: any = {}
  for(const item of array)
    obj[item[key]] = { name: item.name, count: item.count }
  
  return obj
}

export default {
  handleGetEvents,
  handleIncrementMetric,
  handleDecrementMetric, 
}
