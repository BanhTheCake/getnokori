import { pbkdf2Sync, randomBytes } from 'crypto'
import AuthTimes from '@/enums/auth/times.enum'
import { SessionStrategies } from '@/types/auth/session.interface'
import type { Session } from '@/types/auth/session.interface'
import SessionRepo from '@/repositories/auth/session.repo'
import AuthTokenTypes from '@/enums/auth/tokenTypes.enum'
import type { IUserModel } from '@/types/accounts/UsersModel.interface'

const getSession = async (platformAccountId, sessionKey): Promise<Session | null> => {
  return await SessionRepo.getSession(platformAccountId, sessionKey)
}

const getSessionByUserId = async (platformAccountId, userId): Promise<Session | null> => {
  return await SessionRepo.getSessionByUserId(platformAccountId, userId)
}

const terminate = async (platformAccountId, sessionKey): Promise<boolish> => {
  return await SessionRepo.terminate(platformAccountId, sessionKey)
}

// Creates a user session
// TODO: Make 'strategy' a factory class. Maybe use passport.js?
const start = async (platformAccountId: string, user: Pick<IUserModel, 'platformAccountId' | 'accountId' | 'userId'>, strategy: SessionStrategies = SessionStrategies.PASSWORD): Promise<Partial<Session> | null> => {
  
  const existingSession = await getSessionByUserId(platformAccountId, user.userId)
  if(existingSession)
    await terminate(platformAccountId, existingSession.sessionKey)

  const session: Partial<Session> | null = await createSession(user, strategy)
  if(!session) return null

  session.platformAccountId = platformAccountId
  session.userId = user.userId
  session.accountId = user.accountId
  session.sessionKey = session.accessToken
  session.tokenType = AuthTokenTypes.ACCESS
  delete session.refreshToken

  const sessionUpdateResponse = await upsertSession(session)
  if(!sessionUpdateResponse) return null

  session.refreshToken = session.accessToken
  return session
}

/**
 * Save the session to the database
 */
async function upsertSession(session: Partial<Session>): Promise<true | null> {
  const didUpsertSession = await SessionRepo.upsertSession(session)
  if(!didUpsertSession) return null

  return true
}

const updateSession = async (platformAccountId, sessionKey, session: Partial<Session>): Promise<boolean> => {
  return await SessionRepo.updateSession(platformAccountId, sessionKey, session)
}

async function createSession(user: Pick<IUserModel, 'platformAccountId' | 'userId'>, strategy: SessionStrategies = SessionStrategies.PASSWORD): Promise<Partial<Session> | null> {
  const sessionToken = _createSessionToken(user.userId)
  const now = Math.floor(new Date().getTime() / 1000) // / 1000 to get seconds

  if(!sessionToken || !sessionToken.hash) return null

  const session: Partial<Session> = {
    strategy,
    accessToken: sessionToken.hash,
    refreshToken: sessionToken.hash, // TODO: Make this strategy specific
    issuedAt: now,
    /**
     * The number of seconds until the token expires (since it was issued). Returned when a login is confirmed.
     */
    expiresIn: Math.floor(AuthTimes.EXPIRY + AuthTimes.EXPIRY_MARGIN),
    /**
     * A timestamp of when the token will expire. Returned when a login is confirmed.
     */
    expiresAt: Math.floor(now + AuthTimes.EXPIRY + AuthTimes.EXPIRY_MARGIN),
  }

  return session
}

function _createSessionToken(key: string) {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(key, salt, 10000, 32, 'sha512').toString('hex')

  return { salt, hash }
}

const sanitizeSession = (session: Partial<Session>): Partial<Session> => {

  delete session.platformAccountId
  delete session.strategy
  delete session.sessionKey
  delete session.tokenType

  return session
}

const refreshSession = async (session: Partial<Session>): Promise<boolish> => {
  const now = Math.floor(new Date().getTime() / 1000) // / 1000 to get seconds
  const expires = session.expiresAt || 0

  // Don't extend if time to expire is more than 30 minutes?
  if ( now < expires && (expires - now) < (30 * 60) ) {
    const update = {
      expiresIn: Math.floor(AuthTimes.EXPIRY + AuthTimes.EXPIRY_MARGIN),
      expiresAt: Math.floor(now + AuthTimes.EXPIRY + AuthTimes.EXPIRY_MARGIN),
    }

    return await updateSession(session.platformAccountId, session.sessionKey, update)
  }

  return true
}

const terminateAll = async (platformAccountId: string): Promise<boolish> => {
  return await SessionRepo.terminateAll(platformAccountId)
}

const getAllActiveSessions = async (platformAccountId: string, offset: number = 0, limit: number = 10): Promise<Session[] | null> => {
  return await SessionRepo.getAllActiveSessions(platformAccountId, offset, limit)
}

const getSessions = async (platformAccountId): Promise<Session[]> => {
  return await SessionRepo.getSessions(platformAccountId)
}

export default {
  getAllActiveSessions,
  getSession,
  getSessionByUserId,
  getSessions,
  refreshSession,
  sanitizeSession,
  start,
  terminate,
  terminateAll,
  updateSession,
}
