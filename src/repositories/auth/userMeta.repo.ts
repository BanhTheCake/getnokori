import type IUserMetaModel from '@/types/auth/userMeta.interface'
import db from '@/models/mysql'

const upsertUserMeta = async (userMeta: any[][]): Promise<true | null> => {
  const query = `INSERT INTO auth_users_meta (platformAccountId, userId, metaKey, metaValue) 
  VALUES ?
  ON DUPLICATE KEY UPDATE metaValue = VALUES(metaValue)`
  const result = await db.query(query, [userMeta])

  return result.affectedRows > 0 ? true : null
}

const getAll = async (platformAccountId: string, userId: string): Promise<IUserMetaModel[]> => {
  const query = 'SELECT metaKey as `key`, metaValue as `value` FROM auth_users_meta WHERE platformAccountId = ? AND userId = ?'
  const results = await db.query(query, [platformAccountId, userId])
  return results ? results : []
}

const getByKey = async (platformAccountId: string, userId: string, key: string): Promise<IUserMetaModel | null> => {
  const query = 'SELECT metaKey as `key`, metaValue as value FROM auth_users_meta WHERE platformAccountId = ? AND userId = ? AND metaKey = ?'
  const results = await db.query(query, [platformAccountId, userId, key])
  return results ? results[0] : null
}

const deleteByKey = async (platformAccountId: string, userId: string, key: string): Promise<boolean> => {
  const query = 'DELETE FROM auth_users_meta WHERE platformAccountId = ? AND userId = ? AND metaKey = ?'
  const result = await db.query(query, [platformAccountId, userId, key])
  return result.affectedRows > 0
}

export default {
  upsertUserMeta,
  getAll,
  getByKey,
  deleteByKey,
}
