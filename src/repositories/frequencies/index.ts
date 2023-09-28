import db from '@/models/mysql'
import { generateKeyedOR } from '@/utils/sql'

export const getEvents = async ({ accountId, metric, metricLevel2, metricLevel3, dates }: 
{accountId: string; metric: string; metricLevel2?: string; metricLevel3?: string; dates: string[]},
) => {
  let query = ''
  const params = [accountId]
  
  if(metricLevel2 && metricLevel3)
    query = 'SELECT CONCAT(metric, ".", metricLevel2, ".", metricLevel3) AS name'
  
  else if(metricLevel2)
    query = 'SELECT CONCAT(metric, ".",metricLevel2) AS name'
  
  else
    query = 'SELECT metric AS name'

  query += ', SUM(value) as count, createdDate as date'

  query += ' FROM frequencies'

  query += ' WHERE accountId = ?'

  query += ' AND metric = ?'
  params.push(metric)

  if (metricLevel2){
    query += ' AND metricLevel2 = ?'
    params.push(metricLevel2)
  }

  if (metricLevel3){
    query += ' AND metricLevel3 = ?'
    params.push(metricLevel3)
  }

  const datesOR = generateKeyedOR(dates, 'createdDate')
  query += ` AND (${datesOR})`
  
  query += ' GROUP BY date'

  query += ' ORDER BY date ASC'

  const results = await db.query(query, params)
  return results.length ? results : []
}

export const createEvents = async (events: [accountId: string, metric: string, metricLevel2: string | undefined, metricLevel3: string | undefined, value: number, createdDate: string]): Promise<boolish> => {
  /**
   * Bulk insert events utilizing MySQL bulk insert functionality
   */
  const query = `INSERT INTO frequencies 
  (accountId, metric, metricLevel2, metricLevel3, value, createdDate) 
  VALUES ?`
  const result = await db.query(query, [events])
  return result.affectedRows ? true : null

}

export default {
  getEvents,
  createEvents,
}
