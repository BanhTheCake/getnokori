import db from '@/models/mysql'

const createAccount = async (platformAccountId: string, accountId: string) => {
  const query = 'INSERT INTO accounts SET accountId = ?, platformAccountId = ?, active = 1'
  const result = await db.query(query, [accountId, platformAccountId])
  return result.affectedRows > 0 ? result[0] : null
}

const deleteAccount = async (accountId: string) => {
  const query = 'DELETE FROM accounts WHERE accountId = ?'
  const result = await db.query(query, [accountId])
  return result.affectedRows > 0 ? result[0] : null
}

const getAccountByInviteToken = async (inviteToken) => {
  const query = 'SELECT * FROM account_invite_tokens WHERE inviteToken = ?'
  const result = await db.query(query, [inviteToken])
  return result.length > 0 ? result[0] : null
}

const verifyAccount = async (accountId: string) => {
  const query = 'SELECT * FROM accounts WHERE accountId = ? AND active = 1'
  const result = await db.query(query, [accountId])
  return result.length > 0 ? result[0] : null
}

export const getActiveAccountsForDateRange = async (accountId: string, startDate: string, endDate: string) => {
  const query = `SELECT DATE(createdAt) as date, count(*) as count FROM loladb_app.accounts 
  WHERE createdAt BETWEEN "?" AND "?"
  AND platformAccountId = ?
  GROUP BY date ORDER BY createdAt ASC`
  const results = await db.query(query, [startDate, endDate, accountId])
  return results.length ? results : []
}

const getActiveAccounts = async () => {
  const query = 'SELECT * FROM accounts WHERE active = 1'
  const results = await db.query(query, [])
  return results.length ? results : []
}

export default {
  createAccount,
  deleteAccount,
  getAccountByInviteToken,
  getActiveAccountsForDateRange,
  verifyAccount,
  getActiveAccounts,
}
