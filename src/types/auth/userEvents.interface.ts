import type AuthEvents from '@/enums/auth/events.enum'

export interface UserEventsModel {
  eventId: string
  userId: string
  platformAccountId: string
  event: AuthEvents
  eventDate: string
}

export interface UserEventsTrend {
  date: string
  count: number
}
