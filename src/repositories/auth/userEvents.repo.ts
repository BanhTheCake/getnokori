import type { UserEventsModel, UserEventsTrend } from '@/types/auth/userEvents.interface'
import AuthEvents from '@/enums/auth/events.enum'
import db from '@/models/mysql'

const createEvent = async (
  eventId: UserEventsModel['eventId'], 
  userId: UserEventsModel['userId'], 
  platformAccountId: UserEventsModel['event'], 
  event: UserEventsModel['event'],
): Promise<boolean> => {
  const query = 'INSERT INTO auth_users_events SET eventId = ?, userId = ?, platformAccountId = ?, event = ?'
  const result = await db.query(query, [eventId, userId, platformAccountId, event])
  return result.affectedRows > 0 ? true : false
}

export const createEventWithDate = async (
  eventId: UserEventsModel['eventId'], 
  userId: UserEventsModel['userId'], 
  platformAccountId: UserEventsModel['event'], 
  event: UserEventsModel['event'],
  date: string,
): Promise<boolean> => {
  const query = 'INSERT INTO auth_users_events SET eventId = ?, userId = ?, platformAccountId = ?, event = ?, eventDate = ?'
  const result = await db.query(query, [eventId, userId, platformAccountId, event, date])
  return result.affectedRows > 0 ? true : false
}

const getEventsByUserId = async (platformAccountId: string, userId: string, limit: number = 5): Promise<UserEventsModel[]> => {
  const query = `SELECT 
  eventId, userId, event, eventDate 
  FROM auth_users_events 
  WHERE 
  event IN ("USER_CREATED", "USER_VERIFIED", "LOGGED_IN", "LOGGED_OUT", "PASSWORD_RECOVERY", "PASSWORD_RESET", "USER_DEACTIVATED")
  AND
  platformAccountId = ? AND userId = ? ORDER BY eventDate DESC LIMIT ?`
  const results = await db.query(query, [platformAccountId, userId, limit])
  return results ? results : []
}

const getUsersCreatedBetweenDates = async (platformAccountId: string, startDate: string, endDate: string): Promise<UserEventsTrend[]> => {
  const query = `SELECT DATE(eventDate) as date, count(*) as count
                FROM auth_users_events 
                WHERE event = "${AuthEvents.USER_CREATED}"
                AND platformAccountId = ?
                AND DATE(eventDate) BETWEEN ? AND ?
                GROUP BY DATE(eventDate)
                ORDER BY eventDate ASC`
  const results = await db.query(query, [platformAccountId, startDate, endDate])
  return results ? results : []
}

const getUsersInactivatedBetweenDates = async (platformAccountId: string, startDate: string, endDate: string): Promise<UserEventsTrend[]> => {
  const query = `SELECT DATE(eventDate) as date, count(*) as count
                FROM auth_users_events 
                WHERE event = "${AuthEvents.USER_DEACTIVATED}"
                AND platformAccountId = ?
                AND eventDate BETWEEN ? AND ?
                GROUP BY DATE(eventDate)
                ORDER BY eventDate ASC`
  const results = await db.query(query, [platformAccountId, startDate, endDate])
  return results ? results : []
}

const getAvgDailyActiveUsers = async (platformAccountId: string, startDate: string, endDate: string): Promise<number> => {
  const query = `SELECT ROUND(AVG(active_users)) AS avgDAU
                FROM (
                  SELECT DATE(eventDate) AS day, COUNT(DISTINCT userID) AS active_users
                  FROM auth_users_events
                  WHERE 
                  platformAccountId = ?
                  AND (event = "${AuthEvents.USER_CREATED}" OR event = "${AuthEvents.LOGGED_IN}") 
                  AND DATE(eventDate) BETWEEN ? AND ?
                  GROUP BY day
                ) AS daily`
  const result = await db.query(query, [platformAccountId, startDate, endDate])
  return result ? +result[0].avgDAU : 0
}

const getAvgMonthlyActiveUsers = async (platformAccountId: string, startDate: string, endDate: string): Promise<number> => {
  const query = `SELECT COUNT(DISTINCT userID) AS MAU
                 FROM auth_users_events
                  WHERE 
                  platformAccountId = ?
                  AND (event = "${AuthEvents.USER_CREATED}" OR event = "${AuthEvents.LOGGED_IN}") 
                  AND eventDate BETWEEN ? AND ?`
  const result = await db.query(query, [platformAccountId, startDate, endDate])
  return result ? result[0].MAU : 0
}

export default { 
  createEvent,
  getAvgDailyActiveUsers,
  getAvgMonthlyActiveUsers,
  getEventsByUserId,
  getUsersCreatedBetweenDates,
  getUsersInactivatedBetweenDates,
}
