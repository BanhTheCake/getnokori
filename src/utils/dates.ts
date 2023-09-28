/**
 * Takes a timestamp in YYYY-MM-DDT00:00:00:000z format
 * and returns 'YYYY-MM-DD'
 */
export const dateFromTimestamp = (date: string): string | null => {
  return date.split('T')[0] || null
}

export const dateStringToISO8601 = (date: string): string => {
  return new Date(`${date}T12:00:00`).toISOString().split('T')[0]
}

export const emptyTrend = async (from, to) => {
  const begin = new Date(`${from}T12:00:00`)
  const end = new Date(`${to}T12:00:00`)
  const timeTraveler = begin
  const output = {}

  output[`${begin.toISOString().split('T')[0]}`] = 0

  for (let i = 0; begin.getTime() < end.getTime(); i++) {
    timeTraveler.setDate(timeTraveler.getDate() + 1)
    output[timeTraveler.toISOString().split('T')[0]] = 0
  }

  return output
}

/**
 * Returns an array of Y-m-d format dates up to and inclusive of the end date.
 * start <= dates[] <= end
 */
export const datesBetweenInclusive = (start: string, end: string): string[] => {
  const dates: string[] = []
  const startDate = new Date(`${start}T12:00:00`)
  const endDate = new Date(`${end}T12:00:00`)
  const currentDate = startDate

  while(currentDate <= endDate ){
    const date = new Date(currentDate)
    dates.push(date.toISOString().split('T')[0])
    currentDate.setDate(date.getDate() + 1)
  }

  return dates
}

export const getCurrentMonthDates = (): { start: string; end: string } => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const start = startOfMonth.toISOString().slice(0, 10)
  const end = endOfMonth.toISOString().slice(0, 10)

  return { start, end }
}

export const subtractDays = (date: string, days: number): string => {
  const newDate = new Date(`${dateFromTimestamp(date)}T12:00:00`)
  newDate.setDate(newDate.getDate() - days)
  return newDate.toISOString().split('T')[0]
}

export const addDays = (date: string, days: number): string => {
  const newDate = new Date(`${dateFromTimestamp(date)}T12:00:00`)
  newDate.setDate(newDate.getDate() + days)
  return newDate.toISOString().split('T')[0]
}
