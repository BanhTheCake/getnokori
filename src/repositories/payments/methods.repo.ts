import db from '@/models/mysql'
import type { IPaymentMethods } from '@/types/billing/paymentMethods.type'

// TODO - ADD PARENT ACCOUNT LOGIC

export const createPaymentMethod = async (obj) => {
  const query = 'INSERT INTO payments_methods SET ?'
  return await db.query(query, [obj])
}

export const deletePaymentMethod = async (accountId: IPaymentMethods['accountId'], methodId: IPaymentMethods['methodId']) => {
  const query = 'DELETE FROM payments_methods WHERE accountId = ? AND methodId = ?'
  const result = await db.pool.query(query, [accountId, methodId])
  return result.affectedRows > 0 ? true : null
}

export const getDefaultPaymentMethod = async (accountId: IPaymentMethods['accountId']) => {
  const query = 'SELECT * FROM payments_methods WHERE accountId = ? AND isDefault = 1 AND expired = 0'
  const result = await db.query(query, [accountId])
  return result ? result[0] : null
}

export const getPaymentMethodByExternalId = async (accountId: IPaymentMethods['accountId'], paymentMethodId: IPaymentMethods['methodId']) => {
  const query = 'SELECT * FROM payments_methods WHERE accountId = ? AND methodId = ?'
  return await db.query(query, [accountId, paymentMethodId])
}

export const getAllPaymentMethodsForAccount = async (accountId: IPaymentMethods['accountId']) => {
  const query = 'SELECT * FROM payments_methods WHERE accountId = ? ORDER BY isDefault DESC'
  const results = await db.query(query, [accountId])
  return results.length > 0 ? results : null
}

export const unsetDefaultsForAccountId = async (accountId: IPaymentMethods['accountId']) => {
  const query = 'UPDATE payments_methods SET isDefault = 0 WHERE accountId = ?'
  return await db.query(query, [accountId])
}

export const setDefaultPaymentMethodForAccountId = async (methodId: IPaymentMethods['methodId'], accountId: IPaymentMethods['accountId']) => {
  const query = 'UPDATE payments_methods SET isDefault = 1 WHERE methodId = ? AND accountId = ? '
  return await db.query(query, [methodId, accountId])
}

export default {
  createPaymentMethod,
  deletePaymentMethod,
  getDefaultPaymentMethod,
  getPaymentMethodByExternalId,
  getAllPaymentMethodsForAccount,
  unsetDefaultsForAccountId,
  setDefaultPaymentMethodForAccountId,
}
