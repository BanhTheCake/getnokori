import db from '@/models/mysql'

const create = async (log: Record<any, any>): Promise<true | null> => {
  const query = 'INSERT INTO logs SET ?'
  const result = await db.query(query, [log])
  return result.affectedRows > 0 ? true : null
}

const getQueryLogs = async (queryId: string, offset: number = 0, limit: number = 25): Promise<any[] | null> => {
  const query = 'SELECT *, request->>"$.query.query" as query FROM logs WHERE queryId = ? ORDER BY timestamp DESC LIMIT ?,?'
  const results = await db.query(query, [queryId, offset, limit])
  return results ? results : null
}

const getQueryLog = async (logId: string): Promise<any | null> => {
  const query = 'SELECT * FROM logs WHERE logId = ?'
  const result = await db.query(query, [logId])
  return result ? result[0] : null
}

const getLogsForAccount = async (accountId: string) => {}

const getLogsForHub = async (hubId: string) => {}

export default {
  create,
  getQueryLogs,
  getQueryLog,
  getLogsForAccount,
}
