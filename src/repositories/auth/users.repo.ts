import db from '../../models/mysql'
import type { IUserModel } from '../../types/accounts/UsersModel.interface'

const userColumns = 'userId, accountId, firstName, lastName, email, address__streetAddress, address__streetAddressExt, address__locality,address__region,address__postalCode,address__country, active,  verified, lastLoggedInAt'

const createUser = async (args: IUserModel): Promise<true | null> => {
  const result = await db.pool.query(
    'INSERT INTO auth_users SET ?',
    [args],
  )

  return result.affectedRows > 0 ? true : null
}

const updateUser = async (platformAccountId: IUserModel['platformAccountId'], userId: IUserModel['userId'], user: Partial<IUserModel>): Promise<boolish> => {
  const result = await db.pool.query('UPDATE auth_users SET ? WHERE platformAccountId = ? AND userId = ?', [user, platformAccountId, userId])
  return result.affectedRows > 0
}

const getUserById = async (platformAccountId: IUserModel['platformAccountId'], userId: IUserModel['userId']): Promise<IUserModel | null> => {
  const query = `SELECT userId, accountId, firstName, lastName, email, address__streetAddress, address__streetAddressExt, address__locality,address__region,address__postalCode,address__country, active, verified, hasPassword, lastLoggedInAt
  FROM auth_users WHERE platformAccountId = ? AND userId = ?`
  const results = await db.query(query, [platformAccountId, userId])
  return results ? { ...results[0] } : null
}

const getUserByVerifyRequestToken = async (verifyRequestToken: string): Promise<Partial<IUserModel> | null> => {
  const query = 'SELECT accountId, email, verifyToken FROM auth_users WHERE verifyRequestToken = ?'
  const results = await db.query(query, [verifyRequestToken])
  return results ? { ...results[0] } : null
}

const getUserByEmail = async (platformAccountId: string, email: IUserModel['email'], active: number = 1): Promise<IUserModel | null> => {
  const query = `SELECT userId, accountId, firstName, lastName, email, password, salt, address__streetAddress, address__streetAddressExt, address__locality,address__region,address__postalCode,address__country, active, verified, hasPassword, lastLoggedInAt
  FROM auth_users
  WHERE 
  platformAccountId =  ?
  AND email = ?
  AND active = ?`
  const result = await db.query(query, [platformAccountId, email, active])

  return result.length ? result[0] : null
}

const getUserByVerifyToken = async (platformAccountId: string, verifyToken: string): Promise<IUserModel | null> => {
  const query = `SELECT userId, accountId, firstName, lastName, email, address__streetAddress, address__streetAddressExt, address__locality,address__region,address__postalCode,address__country, active,  verified, lastLoggedInAt
               FROM auth_users
                WHERE 
                platformAccountId = ?
                AND verifyToken = ?`

  const result = await db.query(query, [platformAccountId, verifyToken])

  return result.length ? { ...result[0] } : null
}

const getUserByPasswordResetToken = async (resetToken: string): Promise<IUserModel | null> => {
  const result = await db.pool.query('SELECT userId, accountId, firstName, lastName, email, address__streetAddress, address__streetAddressExt, address__locality,address__region,address__postalCode,address__country, active,  verified, lastLoggedInAt FROM auth_users WHERE passResetToken = ?', [resetToken])

  return result.length ? { ...result[0] } : null
}

const setUserVerified = async (platformAccountId: string, userId: IUserModel['userId']): Promise<boolish> => {
  const query = 'UPDATE auth_users SET verified = 1 WHERE userId = ? AND platformAccountId = ?'
  const result = await db.query(query, [userId, platformAccountId])

  return result.affectedRows > 0
}

const getMultipleUsersByUserIds = async (accountId: IUserModel['accountId'], userIds: IUserModel['userId'][]): Promise<IUserModel[] | null> => {
  const result = await db.pool.query('SELECT DISTINCT * FROM auth_users WHERE accountId = ? AND userId in (?)', [accountId, userIds])

  return result.length ? result : null
}

const getMultipleUsersByEmails = async (accountId: string, emails): Promise<IUserModel[] | null> => {
  const result = await db.pool.query('SELECT DISTINCT * FROM auth_users WHERE accountId = ? AND email in (?)', [accountId, emails])

  return result.length ? result : null
}

const getUsersByAccountIds = async (accountId: string, emails: IUserModel['email'][]): Promise<IUserModel[] | null> => {
  const result = await db.pool.query('SELECT DISTINCT SELECT userId, accountId, firstName, lastName, email, address__streetAddress, address__streetAddressExt, address__locality,address__region,address__postalCode,address__country, verified, lastLoggedInAt FROM auth_users WHERE accountId = ? AND accountId in (?)', [accountId, emails])

  return result.length ? result : null
}

const deleteUsersByAccountId = async (accountId: IUserModel['accountId']): Promise<true | null> => {
  const query = 'DELETE FROM auth_users WHERE accountId = ?'
  const result = await db.query(query, [accountId])
  return result.affectedRows > 0 ? true : null
}

const deleteUserById = async (accountId: IUserModel['accountId'], userId: IUserModel['userId']): Promise<true | null> => {
  const query = 'DELETE FROM auth_users WHERE accountId = ? AND userId = ?'
  const result = await db.query(query, [accountId, userId])
  return result.affectedRows > 0 ? true : null
}

const getUsersByParentAccount = async (platformAccountId: string, offset: number = 0, limit: number = 25): Promise<IUserModel[] | null> => {
  const query = 'SELECT userId, accountId, firstName, lastName, email, address__streetAddress, address__streetAddressExt, address__locality, address__region, address__postalCode, address__country, active, verified, hasPassword, createdAt, lastLoggedInAt FROM auth_users WHERE platformAccountId = ? ORDER BY createdAt DESC LIMIT ?, ?'
  const results = await db.query(query, [platformAccountId, offset, limit])
  return results.length ? results : null
}

const countUsersByParentAccount = async (platformAccountId: string): Promise<number | null> => {
  const query = 'SELECT count(*) as count FROM auth_users WHERE platformAccountId = ? AND active = 1'
  const result = await db.query(query, [platformAccountId])
  return result.length ? result[0].count : null
}

const search = async (platformAccountId: string, queryString: string, offset: number = 0, limit: number = 25): Promise<IUserModel[] | []> => {
  const query = `SELECT userId, accountId, firstName, lastName, email, address__streetAddress, address__streetAddressExt, address__locality,address__region,address__postalCode,address__country, active, verified, hasPassword, createdAt, lastLoggedInAt
  FROM auth_users
  WHERE platformAccountId = ?
  AND (userId LIKE "%${queryString}%" OR email LIKE "%${queryString}%" OR firstName LIKE "%${queryString}%" OR lastName LIKE "%${queryString}%")
  order by createdAt ASC
  LIMIT ?, ?`
  const results = await db.query(query, [platformAccountId, offset, limit])
  return results.length ? results : []
}

const searchCount = async (platformAccountId: string, queryString: string): Promise<number | null> => {
  const query = `SELECT count(*) as count
  FROM auth_users
  WHERE platformAccountId = ?
  AND (userId LIKE "%${queryString}%" OR email LIKE "%${queryString}%" OR firstName LIKE "%${queryString}%" OR lastName LIKE "%${queryString}%")
  order by createdAt ASC`
  const result = await db.query(query, [platformAccountId])
  return result.length ? result[0].count : []
}

export default {
  countUsersByParentAccount,
  createUser,
  deleteUserById,
  deleteUsersByAccountId,
  getMultipleUsersByEmails,
  getMultipleUsersByUserIds,
  getUserByEmail,
  getUserById,
  getUserByPasswordResetToken,
  getUserByVerifyRequestToken,
  getUserByVerifyToken,
  getUsersByAccountIds,
  getUsersByParentAccount,
  search,
  searchCount,
  setUserVerified,
  updateUser,
}
