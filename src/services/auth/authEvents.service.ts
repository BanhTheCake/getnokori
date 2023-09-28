import type { UserEventsModel, UserEventsTrend } from '@/types/auth/userEvents.interface'
import AuthEventsRepo from '@/repositories/auth/userEvents.repo'
import UsersRepo from '@/repositories/auth/users.repo'
import AuthEvents from '@/enums/auth/events.enum'
import { authEventId } from '@/utils/ids'
import { emptyTrend } from '@/utils/dates'

const createEvent = async (
  userId: UserEventsModel['userId'], 
  platformAccountId: UserEventsModel['event'], 
  event: UserEventsModel['event'],
): Promise<boolean> => {
  const eventId = authEventId()
  const result = await AuthEventsRepo.createEvent(eventId, userId, platformAccountId, event)
  return result
}

const _getUsersCreatedBetweenDates = async (platformAccountId: string, startDate: string, endDate: string): Promise<UserEventsTrend[]> => {
  return await AuthEventsRepo.getUsersCreatedBetweenDates(platformAccountId, startDate, endDate)
}

const _getUsersInactivatedBetweenDates = async (platformAccountId: string, startDate: string, endDate: string): Promise<UserEventsTrend[]> => {
  return await AuthEventsRepo.getUsersInactivatedBetweenDates(platformAccountId, startDate, endDate)
}

const getAvgDailyActiveUsers = async (platformAccountId: string, startDate: string, endDate: string): Promise<number> => {
  return await AuthEventsRepo.getAvgDailyActiveUsers(platformAccountId, startDate, endDate)
}

const getAvgMonthlyActiveUsers = async (platformAccountId: string, startDate: string, endDate: string): Promise<number> => {
  return await AuthEventsRepo.getAvgMonthlyActiveUsers(platformAccountId, startDate, endDate)
}

const getTotalActiveUsers = async (platformAccountId: string): Promise<number>=>{
  const result = await UsersRepo.countUsersByParentAccount(platformAccountId)
  return result ? result : 0
}

const _mapToTrend = async (startDate: string, endDate: string, events: UserEventsTrend[]): Promise<[string, number][]> => {
  const timeseries = await emptyTrend(startDate, endDate)
  for (const event of events) 
    timeseries[event.date] = event.count
    
  return Object.entries(timeseries)
}

const getEventsBetweenDates = async (platformAccountId: string, event: AuthEvents, startDate: string, endDate: string): Promise<[string, number][]> => {

  let stats
  switch (event) {
    case AuthEvents.USER_CREATED:
      stats = await _getUsersCreatedBetweenDates(platformAccountId, startDate, endDate)
      break
    case AuthEvents.USER_DEACTIVATED:
      stats = await _getUsersInactivatedBetweenDates(platformAccountId, startDate, endDate)
      break
    default:
      break
  }

  if(stats)
    return await _mapToTrend(startDate, endDate, stats)

  return await _mapToTrend(startDate, endDate, [])
}

const getEventsByUserId = async (platformAccountId: string, userId: string, limit: number = 5): Promise<UserEventsModel[]> => {
  return await AuthEventsRepo.getEventsByUserId(platformAccountId, userId, limit)
}

export default {
  createEvent,
  getAvgDailyActiveUsers,
  getAvgMonthlyActiveUsers,
  getEventsBetweenDates,
  getEventsByUserId,
  getTotalActiveUsers,
}
