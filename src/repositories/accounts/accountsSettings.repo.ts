import db from '@/models/mysql'

const getSettingByKey = async (accountId: string, key: string): Promise<any | null> => {
  const query = 'SELECT settingValue from account_settings WHERE accountId = ? AND settingKey = ?'
  const result = await db.query(query, [accountId, key])
  return result.length > 0 ? result[0] : null
}

const deleteSetting = async (accountId: string, key: string): Promise<boolean> => {
  const query = 'DELETE FROM account_settings WHERE accountId = ? AND settingKey = ?'
  const result = await db.query(query, [accountId, key])
  return result.affectedRows > 0
}

const setSetting = async (accountId: string, key: string, value: string): Promise<boolean> => {
  const query = `INSERT INTO account_settings (accountId, settingKey, settingValue) VALUES (?, ?, ?) 
                  ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue)`
  const result = await db.query(query, [accountId, key, value])
  return result.affectedRows > 0
}

export default {
  getSettingByKey,
  deleteSetting,
  setSetting,
}
