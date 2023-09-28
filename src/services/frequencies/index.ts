import FrequenciesRepo from '@/repositories/frequencies'
import FrequencyBuffer from '@/services/frequencies/FrequencyBuffer.class'
import BillingService from '@/services/billing/billing.service'

const getEventsByName = async (accountId: string, name: string, timeStart: string, timeEnd: string) => {}

export const getEvents = async ({ accountId, metricQ, dates }: 
{accountId: string; metricQ: string; dates: string[]},
) => {
  const metricParts = metricQ.split('.')
  const metric = metricParts[0] ? metricParts[0] as string : null

  if(!metric)
    return []

  const metricLevel2 = metricParts[1] || undefined
  const metricLevel3 = metricParts[2] || undefined
  const results = await FrequenciesRepo.getEvents({ accountId, metric, metricLevel2, metricLevel3, dates })
  return results.length ? results : []
}

const createEvent = async (accountId: string, name: string, time: string) => {}

const createEvents = async (events) => {
  /**
   * Bulk insert events utilizing MySQL bulk insert functionality
   */
  const mappedEvents = events.map((event) => {
    const [metric, metricLevel1, metricLevel2] = event.name.split('.')
    return [event.accountId, metric, metricLevel1 || null, metricLevel2 || null, event.value, new Date().toISOString().split('T')[0]]
  })
  await FrequenciesRepo.createEvents(mappedEvents)

  events.map((event) => {
    BillingService.notify(event.accountId, event.name, event.value)
    return true
  })
}

export const flushHandler = async (events: Record<string, number>) => {
  const eventsEntries = Object.entries(events)
  // console.log('events entries', eventsEntries)
  const mappedEvents = eventsEntries.map(([eventKey, value]) => {
    const keyParts = eventKey.split('::')
    const accountId = keyParts[0]
    const name = keyParts[1]
    return { accountId, name, value }
  })

  createEvents(mappedEvents)
}

const increment = (accountId: string, name: string, value?: number): void => {
  value = value || 1
  FrequencyBuffer.increment(accountId, name, value)
}

const decrement = (accountId: string, name: string, value?: number): void => {
  value = value || 1
  FrequencyBuffer.decrement(accountId, name, value)
}

export default {
  getEvents,
  flushHandler,
  increment, 
  decrement,
}
