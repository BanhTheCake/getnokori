import type Session from '@/types/auth/session.interface'
import db from '@/models/mysql'

const upsertSession = async (session: Partial<Session>): Promise<boolean> => {
  const query = 'INSERT INTO auth_sessions SET ? ON DUPLICATE KEY UPDATE ?'
  const result = await db.query(query, [session, session])
  return result ? true : false
}

const getSessions = async (platformAccountId): Promise<Session[]> => {
  const query = 'SELECT * FROM auth_sessions WHERE platformAccountId = ?'
  const result = await db.query(query, [platformAccountId])
  return result ? result : []
}

const getSession = async (platformAccountId, sessionKey): Promise<Session | null> => {
  const query = 'SELECT * FROM auth_sessions WHERE  platformAccountId = ? AND sessionKey = ?'
  const result = await db.query(query, [platformAccountId, sessionKey])
  return result ? result[0] : null
}

const getSessionByUserId = async (platformAccountId, userId): Promise<Session | null> => {
  const query = 'SELECT * FROM auth_sessions WHERE userId = ? AND platformAccountId = ?'
  const result = await db.query(query, [userId, platformAccountId])
  return result ? result[0] : null
}

const updateSession = async (platformAccountId, sessionKey, session: Partial<Session>): Promise<boolean> => {
  const query = 'UPDATE auth_sessions SET ? WHERE sessionKey = ? AND platformAccountId = ?'
  const result = await db.query(query, [session, sessionKey, platformAccountId])
  return result ? true : false
}

const terminate = async (platformAccountId, sessionKey): Promise<boolish> => {
  const query = 'DELETE FROM auth_sessions WHERE sessionKey = ? AND platformAccountId = ?'
  const result = await db.query(query, [sessionKey, platformAccountId])
  return result.affectedRows > 0 ? true : null
}

const terminateAll = async (platformAccountId): Promise<boolish> => {
  const query = 'DELETE FROM auth_sessions WHERE platformAccountId = ?'
  const result = await db.query(query, [platformAccountId])
  return result.affectedRows > 0 ? true : null
}

const getAllActiveSessions = async (platformAccountId: string, offset: number = 0, limit: number = 10): Promise<Session[] | null> => {
  const query = `SELECT 
        usr.firstName as firstName, 
        usr.lastName as lastName, 
        usr.email as email, 
        ass.sessionKey as sessionKey, 
        ass.userId as userId, 
        ass.strategy as strategy, 
        ass.issuedAt as issuedAt, 
        ass.expiresAt as expiresAt,
    FROM auth_sessions ass
    JOIN accounts acc ON ass.platformAccountId = acc.platformAccountId
    join auth_users usr ON ass.userId = usr.userId
    WHERE acc.platformAccountId = ?
    AND ass.expiresAt >= UNIX_TIMESTAMP()
    ORDER BY ass.platformAccountId DESC
    LIMIT ?, ?`
  const results = await db.query(query, [platformAccountId, offset, limit])
  return results ? results : null
}

export default {
  getAllActiveSessions,
  getSession,
  getSessions,
  getSessionByUserId,
  terminate,
  terminateAll,
  updateSession,
  upsertSession,
}
