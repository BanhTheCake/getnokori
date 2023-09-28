import { getActiveAccountsForDateRange } from '@/repositories/accounts/accounts.repo' 
import type { DashboardMetricsParams } from '@/types/dashboard/types'
import { dateStringToISO8601, datesBetweenInclusive, subtractDays } from '@/utils/dates'

export const getMetric = async (accountId: string, metric: string, params: DashboardMetricsParams): Promise<any | null> => {
 
  let results: [] = []
  switch (metric) {
    case 'newAccounts':
      results = await getActiveAccountsForDateRange(accountId, params.datesFrom, params.datesTo)
      break
  
    default:
      return null
      break
  }

  const invertedResultsObject = invertArrayToKeyedObject(results, 'date')
  
  const datesRange = datesBetweenInclusive(params.datesFrom, params.datesTo)
  const mappedResults = datesRange.map((date: string) => {
    if(invertedResultsObject[date])
      return { date, name: metric, count: Number(invertedResultsObject[date].count) }

    else
      return { date, name: metric, count: 0 }
  })

  return mappedResults
}

function invertArrayToKeyedObject(array: any[], key: string){
  const obj: any = {}
  for(const item of array)
    obj[item[key]] = { count: item.count }
  
  return obj
}
