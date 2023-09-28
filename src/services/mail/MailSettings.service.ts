import MailSettingsRepo from '@/repositories/mail/MailSettings.repo'
import type MailSettings from '@/types/mail/MailSettings.interface'

export const getSettingByKey = async (accountId: string, key: string): Promise<MailSettings['settingValue'] | null> => {
  const setting = await MailSettingsRepo.getSettingByKey(accountId, key)
  if(!setting) return null

  return setting.settingValue
}

export const deleteSetting = async (accountId: string, key: string): Promise<boolean> => {
  return await MailSettingsRepo.deleteSetting(accountId, key)
}

export const setSetting = async (accountId: string, key: string, value: string): Promise<boolean> => {
  return await MailSettingsRepo.setSetting(accountId, key, value)
}

export default {
  getSettingByKey,
  deleteSetting,
  setSetting,
}
