import AccountSettingsRepo from '@/repositories/accounts/accountsSettings.repo'
import type AccountSettings from '@/types/accounts/AccountSettings.interface'

export const getSettingByKey = async (accountId: string, key: string): Promise<AccountSettings['settingValue'] | null> => {
  const setting = await AccountSettingsRepo.getSettingByKey(accountId, key)
  if(!setting) return null

  return setting.settingValue
}

export const deleteSetting = async (accountId: string, key: string): Promise<boolean> => {
  return await AccountSettingsRepo.deleteSetting(accountId, key)
}

export const setSetting = async (accountId: string, key: string, value: string): Promise<boolean> => {
  return await AccountSettingsRepo.setSetting(accountId, key, value)
}

export default {
  getSettingByKey,
  deleteSetting,
  setSetting,
}
