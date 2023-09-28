import type { CacheItem, SettingsProvider } from '@/services/_cache/KVCache.service'
import { getDomainStatus } from '@/repositories/mail/MailDomains.repo'

export default class CacheDomainStatusProvider implements SettingsProvider {
  static async get(accountId: string, settingKey: string): Promise<CacheItem['value']> {
    // implement logic to get data from database
    return await getDomainStatus(accountId, settingKey)
  }

  async get(accountId: string, settingKey: string): Promise<CacheItem['value']> {
    return CacheDomainStatusProvider.get(accountId, settingKey)
  }
}
