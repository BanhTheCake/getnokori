import CacheDomainStatusProvider from './providers/MailDomainStatus.provider'

export interface SettingsProvider {
  get(accountId: string, settingKey: string): Promise<string | null>
}

export interface CacheItem {
  value: string | null
  expiry: number
}

class KVCache {
  private data: Record<string, CacheItem> = {}
  private readonly provider: SettingsProvider
  private readonly expiryTimeout: number

  constructor(provider: SettingsProvider, expiryTimeout: number) {

    this.provider = provider
    this.expiryTimeout = expiryTimeout
      
    // start the purge loop
    this.autoPurgeCallback()
  }

  async get(accountId: string, settingKey: string): Promise<CacheItem['value']> {
    const key = `${accountId}:${settingKey}`
    const cacheItem = this.data[key]

    if (cacheItem) {
      const now = Date.now()

      if (cacheItem.expiry > now) 
        return cacheItem.value

      delete this.data[key]
    }

    const value = await this.provider.get(accountId, settingKey)
    this.data[key] = {
      value: value,
      expiry: Date.now() + this.expiryTimeout,
    }
    console.log('setting', key)
    console.log(this.data)
    return value
  }

  purge(accountId: string, settingKey: string | null): void {
    const key = `${accountId}:${settingKey}`
    console.log('purging', key)
    delete this.data[key]
  }
  
  purgeExpired(): void {
    const now = Date.now()

    for (const key in this.data) {
      if (this.data[key].expiry <= now) 
        delete this.data[key]
          
    }
  }
  
  autoPurgeCallback(): void {
    this.purgeExpired()
    if (this.expiryTimeout) {
      const tid = setTimeout(() => this.autoPurgeCallback(), this.expiryTimeout)

      // Let the event loop exit if this is the only active timer.
      if (tid.unref) 
        tid.unref()
          
    }
  }
}

class CacheFactory {
  private static instances: Record<string, KVCache> = {}

  static getInstance(key: string, expiryTimeout: number): KVCache {
    if (!this.instances[key]) {
      const settingsProvider: SettingsProvider = CacheFactory.getProvider(key)
      this.instances[key] = new KVCache(settingsProvider, expiryTimeout)
    }

    return this.instances[key]
  }

  static getProvider(key: string): SettingsProvider {
    const providers: Record<string, SettingsProvider> = {
      domainStatus: CacheDomainStatusProvider,
    }

    return providers[key]
  }
}

export const domainStatusCacheService = CacheFactory.getInstance('domainStatus', 30000) // items expire after 30 seconds
