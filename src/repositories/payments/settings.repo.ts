import db from '@/models/mysql'

export const getExternalCustomerId = async (accountId) => {
  const query = 'SELECT * FROM payments_settings WHERE accountId = ? LIMIT 1'
  const results = await db.query(query, [accountId])
  return results ? results[0] : null
}

export const createPaymentSetting = async (accountId, key, value) => {
  const query = 'INSERT INTO payments_settings SET accountId = ?, settingKey = ?, settingValue = ?'
  return await db.query(query, [accountId, key, value])
}

export const updatePaymentSettings = async (obj, accountId) => {
  const query = 'UPDATE payments_settings SET ? WHERE accountId = ? AND settingKey = ?'
  return await db.query(query, [obj, accountId, obj.settingKey])
}

export const getPaymentSettings = async (accountId) => {
  const query = 'SELECT * FROM payments_settings WHERE accountId = ?'
  return await db.query(query, [accountId])
}

export const getPaymentSettingsByKey = async (key, accountId) => {
  const query = 'SELECT * FROM payments_settings WHERE settingKey = ? AND accountId = ?'
  const result = await db.query(query, [key, accountId])
  return result ? result[0] : null
}

export default {
  getExternalCustomerId,
  createPaymentSetting,
  updatePaymentSettings,
  getPaymentSettings,
  getPaymentSettingsByKey,
}
