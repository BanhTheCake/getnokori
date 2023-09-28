export enum SessionStrategies{
  PASSWORD = 'password',
}

export interface Session {
  sessionKey?: string
  platformAccountId: string
  accountId: string
  userId: string
  strategy?: SessionStrategies
  providerToken?: string | null
  accessToken: string
  issuedAt: number
  /**
   * The number of seconds until the token expires (since it was issued). Returned when a login is confirmed.
   */
  expiresIn?: number
  /**
   * A timestamp of when the token will expire. Returned when a login is confirmed.
   */
  expiresAt?: number
  tokenType?: string
  refreshToken?: string
  // user: User | null
}

export default Session
