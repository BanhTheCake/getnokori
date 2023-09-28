import db from '../../models/mysql'

const upsertToken = async (userId: string, platformAccountId: string, token: string ): Promise<boolean> => {
  const query = 'INSERT INTO auth_verify (userId, platformAccountId, token, expiresAt) VALUES (?,?,?,CURRENT_TIMESTAMP + INTERVAL 1 HOUR) ON DUPLICATE KEY UPDATE token = VALUES(token), expiresAt = CURRENT_TIMESTAMP + INTERVAL 1 HOUR'
  const result = await db.query(query, [userId, platformAccountId, token])
  return result.affectedRows > 0
}

const getActiveToken = async (token: string, platformAccountId: string): Promise<boolean> => {
  const query = 'SELECT token FROM auth_verify where token = ? AND platformAccountId = ? AND expiresAt > CURRENT_TIMESTAMP'
  const result = await db.query(query, [token, platformAccountId])
  return result.length ? result[0] : null
}

const getUserByToken = async (token: string, platformAccountId: string): Promise<any | null> => {
  const query = 'SELECT userId, token FROM auth_verify where token = ? AND platformAccountId = ? AND expiresAt >= CURRENT_TIMESTAMP'
  const result = await db.query(query, [token, platformAccountId])
  return result.length ? result[0] : null
}

const deleteToken = async (token: string, platformAccountId: string): Promise<boolean> => {
  const query = 'DELETE FROM auth_verify WHERE token = ? AND platformAccountId = ?'
  const result = await db.query(query, [token, platformAccountId])
  return result.affectedRows > 0
}

export default {
  upsertToken,
  getActiveToken,
  getUserByToken,
  deleteToken,
}
