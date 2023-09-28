import db from '@/models/mysql'
import type PlatformKeys from '@/types/auth/plaformKeys.interface'
import type Accounts from '@/repositories/accounts/accounts.interface'

const findByAPIKey = async (
  apiKey: string,
): Promise<{platformAccountId: string} | null> => {
  const query = `SELECT platformAccountId FROM platform_keys
  WHERE publicKey = ? AND banned = 0`
  const account = await db.query(query, [apiKey])
  return account.length > 0 ? account[0] : null
}

const createAPIKey = async (platformAccountId: PlatformKeys['platformAccountId'], apiKey: PlatformKeys['publicKey']): Promise<boolish> => {
  const query = 'INSERT INTO platform_keys (platformAccountId, publicKey) VALUES (?, ?)'
  const result = await db.query(query, [platformAccountId, apiKey])
  return result.affectedRows > 0 ? true : false
}

const deleteAPIKey = async (platformAccountId: PlatformKeys['platformAccountId']): Promise<boolish> => {
  const query = 'DELETE FROM platform_keys WHERE platformAccountId = ?'
  const result = await db.query(query, [platformAccountId])
  return result.affectedRows > 0 ? true : false
}

const getAPIKey = async (platformAccountId: PlatformKeys['platformAccountId']): Promise<PlatformKeys['publicKey'] | null> => {
  const query = 'SELECT publicKey FROM platform_keys WHERE platformAccountId = ?'
  const result = await db.query(query, [platformAccountId])
  return result.length > 0 ? result[0] : null
}

const updateAPIKey = async (platformAccountId: PlatformKeys['platformAccountId'], apiKey: PlatformKeys['publicKey']): Promise<boolish> => {
  const query = 'UPDATE platform_keys SET publicKey = ? WHERE platformAccountId = ?'
  const result = await db.query(query, [apiKey, platformAccountId])
  return result.affectedRows > 0 ? true : false
}

export default {
  createAPIKey,
  deleteAPIKey,
  getAPIKey,
  updateAPIKey,
  findByAPIKey,
}
