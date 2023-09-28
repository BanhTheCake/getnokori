import { flushHandler } from '@/services/frequencies'

class FrequencyBuffer {
  /**
   * FrequencyBuffer manages the buffering, aggregating, and sending of metrics
   * to the server. It is a singleton class.
   */
  private static instance: any
  private defaultFlushIntervalSeconds: number = 5
  private flushIntervalSeconds: number = this.defaultFlushIntervalSeconds
  private buffer: Record<string, number> = {}

  constructor(){}

  public init(options: { flushIntervalSeconds?: number } = {}) {
    this.flushIntervalSeconds = options.flushIntervalSeconds || this.defaultFlushIntervalSeconds

    // Attempt graceful shutdown on SIGINT, SIGQUIT, and SIGTERM
    process.on('SIGINT', () => {
      this.flush()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      this.flush()
      process.exit(0)
    })

    // Spint up our automatic flusher
    const autoFlushCallback = async () => {
      await this.flush()
      // this.increment('lola.acct.dV2uPmQAnep8fcbSxVc', 'platform.APIRequests', Math.floor(Math.random() * 10000))
      // this.increment('lola.acct.Pqefa7WYQODgNItFr2A', 'platform.APIRequests', Math.floor(Math.random() * 10000))
      if (this.flushIntervalSeconds) {
        const interval = this.flushIntervalSeconds * 1000
        // setTimeout is non blocking! Yay!
        const tid = setTimeout(autoFlushCallback, interval)
        // Let the event loop exit if this is the only active timer.
        if (tid.unref) tid.unref()
      }
    }

    autoFlushCallback()
  }

  private async flush(): Promise<void> {
    // do some flushing
    if(!this.bufferHasProps(this.buffer)) return
    const intermediateBuffer: Record<string, number> = this.buffer
    this.buffer = {}
    await flushHandler(intermediateBuffer)
  }

  public static getInstance(): FrequencyBuffer {
    if (!FrequencyBuffer.instance)
      FrequencyBuffer.instance = new FrequencyBuffer()
    
    return FrequencyBuffer.instance
  }

  private bufferHasProps(object): boolean {
    for (const prop in object) 
      if (Object.prototype.hasOwnProperty.call(object, prop)) return true
    
    return false
  }

  public increment(accountId: string, key: any, value: number): void {
    const bufferKey = this.createKey(accountId, key)
    if(!this.buffer[bufferKey]) this.buffer[bufferKey] = 0
    this.buffer[bufferKey] = this.buffer[bufferKey] + Math.abs(value)
  }

  public decrement(accountId: string, key: any, value: number): void {
    const bufferKey = this.createKey(accountId, key)
    if(!this.buffer[bufferKey]) this.buffer[bufferKey] = 0
    this.buffer[bufferKey] -= Math.abs(value)
  }

  private createKey(accountId: string, key: any): string {
    return `${accountId}::${key}`
  }
  
}

export default FrequencyBuffer.getInstance()
