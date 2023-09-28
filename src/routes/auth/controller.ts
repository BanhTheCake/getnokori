import { slink, unslink } from '@/utils/slinky'
import APIResponse from '@/utils/apiResponse'
import AuthEvents from '@/enums/auth/events.enum'
import AuthEventsService from '@/services/auth/authEvents.service'
import AuthService from '@/services/auth/auth.service'
import AuthStatuses from '@/enums/auth/authStatuses.enum'
import AuthTokenService from '@/services/auth/userVerify.service'
import CredentialsService from '@/services/auth/platformKeys.service'
import PassResetService from '@/services/auth/passReset.service'
import PaymentsService from '@/services/billing/paymentMethods.service'
import PlansService from '@/services/billing/plans.service'
import SessionService from '@/services/auth/session.service'
import type { AuthZFailure }from '@/types/auth/apiResponses.interface'
import type { IUserModel } from '@/types/accounts/UsersModel.interface'
import type { Request, Response } from 'express'
import type IUserMetaModel from '@/types/auth/userMeta.interface'
import UserMetaService from '@/services/auth/userMeta.service'
import UserService from '@/services/auth/users.service'
import UserVerifyService from '@/services/auth/userVerify.service'
import { subtractDays } from '@/utils/dates'
import type Session from '@/types/auth/session.interface'

/**
 * Performs user login auth check
 */
const login = async (req: Request, res: Response) => {
  const ctx = req.body
  const platformAccountId = req.user.platformAccountId
  
  const user: IUserModel | null = await AuthService.getUserByEmail(platformAccountId, ctx.email)
  if (!user) 
    return res.status(403).json(APIResponse.failure('Email does not exist.'))

  if(!user.active){
    logger.error('User is not active', user)
    return res.status(403).json(APIResponse.failure('Incorrect email or password.'))
  }

  if(!user.salt || !user.password){
    logger.error('User has no salt or password', user)
    return res.status(403).json(APIResponse.failure('Incorrect email or password.'))
  } 

  const valid = AuthService.validatePassword(ctx.password, user.salt, user.password)
  if (!valid) 
    return res.status(403).json(APIResponse.failure('Incorrect email or password.'))

  const userId = user.userId
  const strategy = req.body.strategy || 'password'

  try {
    await AuthService.updateUser(platformAccountId, userId, {
      lastLoggedInAt: new Date(),
    })
  }
  catch (error) {
    logger.error('Error updating lastLoggedInAt', error)
  }

  // TODO: abstract this to an auth provider class that is centralized
  // and can be injected at runtime in to the auth service.
  const cleanUser: Pick<IUserModel, 'platformAccountId' | 'accountId' | 'userId'> = AuthService.sanitizeUserForToken(user)

  const session = await SessionService.start(platformAccountId, cleanUser, strategy) // What account id is this? Is it needed?

  if(!session) return res.status(403).json(APIResponse.failure('Failure creating account'))

  const responseSession = SessionService.sanitizeSession(session)

  const response = {
    status: AuthStatuses.AUTHORIZED,
    session: responseSession, 
    redirectTo: '/',
    meta: {
      verified: !!user.verified,
    },
  }

  res.status(200).json(APIResponse.success(response))

  try {
    AuthEventsService.createEvent(userId, platformAccountId, AuthEvents.LOGGED_IN)
  }
  catch (error) {
    logger.error('Failed to create user event', { error })
  }
}

const handleGetSessions = async function (req: Request, res: Response) {
  const platformAccountId = req.user.platformAccountId
  const sessions = await SessionService.getSessions(platformAccountId)

  if(!sessions) return res.status(404).json(APIResponse.failure('No sessions found'))

  const response = sessions.map((session: Session) => SessionService.sanitizeSession(session))

  res.status(200).json(APIResponse.success(response))
}

const handleGetSessionByKey = async function (req: Request, res: Response) {
  const platformAccountId = req.user.platformAccountId
  const sessionKey = req.params.sessionKey

  const session = await SessionService.getSession(platformAccountId, sessionKey)
  if(!session) return res.status(404).json(APIResponse.failure('No session found'))

  const response = SessionService.sanitizeSession(session)

  res.status(200).json(APIResponse.success(response))
}

const handleTerminateSession = async function (req: Request, res: Response) {
  const platformAccountId = req.user.platformAccountId
  const sessionKey = req.params.sessionKey

  const session = await SessionService.getSession(platformAccountId, sessionKey)
  if(!session) return res.status(404).json(APIResponse.failure('No session found'))

  await SessionService.terminate(platformAccountId, sessionKey)

  res.status(200).json(APIResponse.success({ status: 'Session terminated' }))
}

const refreshSession = async function (req: Request, res: Response) {

  const refreshToken = req.query.token || null
  if(!refreshToken) return res.status(401).json(APIResponse.failure('No refresh token provided'))

  const platformAccountId = req.user.platformAccountId

  const session = await SessionService.getSession(platformAccountId, refreshToken)
  if(!session){
    const response: AuthZFailure = {
      status: AuthStatuses.UNAUTHORIZED,
      redirectTo: '/login', // TODO: Make this dynamic
    }
    return res.status(401).json(APIResponse.success(response))
  }
  try {
    await SessionService.refreshSession(session)  
    const refreshedSession = await SessionService.getSession(platformAccountId, session.sessionKey)
    if(refreshedSession){
      const responseSession = SessionService.sanitizeSession(refreshedSession)
      responseSession.refreshToken = refreshedSession.accessToken

      return res.status(200).json(APIResponse.success({ status: AuthStatuses.AUTHORIZED, session: responseSession }))
    }
  }
  catch (error) {
    logger.error('Error refreshing session', error)
  }

  return res.status(401).json(APIResponse.failure('Failed to refresh session'))
  
}

const logout = async function (req: Request, res: Response) {
  if(!req.query.token) return res.status(401).json(APIResponse.failure('No refresh token provided'))
  if(!req.user.accountId) return res.status(401).json(APIResponse.failure('No account provided'))

  const platformAccountId = req.user.platformAccountId
  const session = await SessionService.getSession(platformAccountId, req.query.token)

  if(!session) return res.status(401).json(APIResponse.failure('No session found'))

  try {
    await SessionService.terminate(platformAccountId, session.sessionKey)
  }
  catch (error) {
    logger.error('Error ending session', error)
  }

  res.status(200).json(APIResponse.success({ status: 'logged out', redirectTo: '/login' }))
}

/**
 * Creates a new user and sends verification email
 * TODO: Add invite code support to do account id matching
 */
const signUp = async function (req: Request, res: Response) {
  const platformAccountId = req.user.platformAccountId
  try {
    const { email, password = null, firstName, lastName, autoVerify = false } = req.body
    
    if(email.includes('protonmail.com') || 
    email.includes('shroud.email') || 
    email.includes('proton.me') || 
    email.includes('email1.io') ||
    email.includes('qq.com')
    ){
      logger.info('Sign up blocked by email', email)
      return res.status(400).json(APIResponse.failure('Invalid email address.'))
    }

    const user = await AuthService.createUser(platformAccountId, { email, password, firstName, autoVerify, lastName, ipAddress: req['clientIp'] })
    if (!user) {
      return res
        .status(400)
        .json(APIResponse.failure('User already exists with this email address.'))
    }

    try{
      AuthEventsService.createEvent(user.userId, platformAccountId, AuthEvents.USER_CREATED)
    }
    catch(error: any){
      logger.error('Failed to create user event', { error })
    }

    const createResult = {
      created: true,
      userId: user.userId,
    }
 
    return res.status(200).json(APIResponse.success(createResult, 'User created successfully.'))
  }
  catch (error: any) {
    logger.error('Failed to create user', { error })
  }

  return res.status(500).json(APIResponse.failure('Failed to create user'))
  
}

/**
 * Verifies a user
 */
const handleVerifyUser = async function (req: Request, res: Response) {
  const token = req.params.token as string
  const platformAccountId = req.user.platformAccountId

  const verifyTokenResponse = await UserVerifyService.getUserByToken(token, platformAccountId)
  if(!verifyTokenResponse) 
    return res.status(400).json(APIResponse.failure('Verification link has expired.'))

  if(verifyTokenResponse.token !== token){
    logger.error('Token mismatch', { token, verifyTokenResponse })
    return res.status(400).json(APIResponse.failure('Token mismatch.'))
  }

  await AuthService.setUserVerified(platformAccountId, verifyTokenResponse.userId)

  res.status(200).json(APIResponse.success())
}

const handleResetPassword = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  // TODO: validate body
  const { password } = req.body
  if(!password)
    return res.status(400).json(APIResponse.failure('password body parameter is required'))

  const token = req.query.token as string || null
  if(!token)
    return res.status(400).json(APIResponse.failure('token query parameter is required'))

  const user = await PassResetService.getUserByToken(token, platformAccountId)
  if (!user) 
    return res.status(404).json(APIResponse.failure('Password reset link has expired.'))

  // save new password for the user
  const updated = await AuthService.saveNewPassword(platformAccountId, user, password)
  if (!updated) 
    return res.status(400).json(APIResponse.failure('Error updating password. Please try again'))

  return res.status(200).json(APIResponse.success({ status: 'success', redirectTo: '/login' }))
}

const handleSetPassword = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const { password } = req.body
  if(!password)
    return res.status(400).json(APIResponse.failure('Invalid request'))

  const userId = req.params.userId
  
  if(!userId) return res.status(400).json(APIResponse.failure('UserId is required'))

  const user: IUserModel | null = await AuthService.getUserById(platformAccountId, userId)
  if(!user) return res.status(400).json(APIResponse.failure('User not found'))
  // save new password for the user
  if(!user.password){
    const updated = await AuthService.saveNewPassword(platformAccountId, user, password)
    if (!updated) 
      return res.status(400).json(APIResponse.failure('Error updating password. Please try again'))
  }
  else{
    return res.status(400).json(APIResponse.failure('User already has a password'))
  }

  return res.status(200).json(APIResponse.success({ status: 'success', redirectTo: '/login' }))
}

const handleGetUserById = async (req: Request, res: Response) => {
  const userId = req.params.userId || null
  const platformAccountId = req.user.platformAccountId

  if(!userId) return res.status(400).json(APIResponse.failure('Invalid user id'))

  const user = await AuthService.getUserById(platformAccountId, userId)
  if(!user) return res.status(404).json(APIResponse.failure('User not found'))

  const meta = await UserMetaService.getAll(platformAccountId, userId)  
  user['meta'] = meta

  const minifiedUser = unslink(user, '__')
  return res.status(200).json(APIResponse.success({ ...minifiedUser }))
}

const handleGetUserActivity = async (req: Request, res: Response) => {
  const userId = req.params.userId || null
  const platformAccountId = req.user.platformAccountId

  if(!userId) return res.status(400).json(APIResponse.failure('Invalid user id'))

  let limit = req.query.limit as string || 10
  if(+limit > 10) limit = 10

  const events = await AuthEventsService.getEventsByUserId(platformAccountId, userId, +limit)
  if(!events) return res.status(200).json(APIResponse.success([]))

  return res.status(200).json(APIResponse.success( events ))
}

const handleUpdateUser = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const userId = req.params.userId || null

  if(!userId) return res.status(400).json(APIResponse.failure('User Id is required'))

  const user = await AuthService.getUserById(platformAccountId, userId)
  if(!user) return res.status(404).json(APIResponse.failure('User not found'))

  const userUpdate = req.body
  if(!userUpdate) return res.status(400).json(APIResponse.failure('Request body cannot be empty'))

  delete userUpdate.meta

  try {
    const record = slink(userUpdate, '__')
    const updated = await AuthService.updateUser(platformAccountId, userId, record)
    if(!updated) return res.status(400).json(APIResponse.failure('Failed to update user'))
  }
  catch (error: any) {
    logger.error('Error updating user', { error })
    if(error.errno === 1062)
      return res.status(400).json(APIResponse.failure('User already exists with that email.'))

    return res.status(500).json(APIResponse.failure('An unknown error has occurred.'))
  }

  return res.status(200).json(APIResponse.success({ updated: true }))
}

const handleGetApiKey = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const apiKey = await CredentialsService.getAPIKey(platformAccountId)
  if(!apiKey) return res.status(404).json(APIResponse.failure('API Key not found'))

  return res.status(200).json(APIResponse.success(apiKey))

}

const handleRefreshAPIKey = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const userId = req.user.userId || null

  const account = await UserService.getUserById(platformAccountId, userId)
  if(!account) return res.status(404).json(APIResponse.failure('Account not found'))

  await CredentialsService.deleteAPIKey(platformAccountId)
  const apiKey = await CredentialsService.createAPIKey(platformAccountId)
  if(!apiKey) return res.status(404).json(APIResponse.failure('Error generating new API key.'))

  await SessionService.terminateAll(platformAccountId)

  return res.status(200).json(APIResponse.success( apiKey ))
}

const handleCreateUser = async (req: Request, res: Response) => {

  const platformAccountId = req.user.platformAccountId

  const requestBody = req.body
  if(!requestBody.email) return res.status(400).json(APIResponse.failure('Email is required'))

  const user = await AuthService.getUserByEmail(platformAccountId, requestBody.email)
  if(user) return res.status(400).json(APIResponse.failure('User already exists with this email address. Please use a different email address or login.'))

  const newUser = await AuthService.createUser(platformAccountId, requestBody)
  if(!newUser) return res.status(400).json(APIResponse.failure('Error creating user'))

  const createResult = {
    created: true,
    userId: newUser.userId,
  }

  try{
    AuthEventsService.createEvent(newUser.userId, platformAccountId, AuthEvents.USER_CREATED)
  }
  catch(error: any){
    logger.error('Failed to create user event', { error })
  }

  return res.status(200).json(APIResponse.success(createResult, 'User created successfully.'))

}

const handleGetUsers = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 25
  const queryString = req.query.q ? req.query.q as string : null

  const response = {
    offset,
    limit,
    count: 0,
    users: [] as IUserModel[],
  }

  let users
  if(queryString)
    users = await UserService.search(platformAccountId, queryString, offset, limit)
  
  else
    users = await UserService.getUsersByParentAccount(platformAccountId, offset, limit)
  
  if(!users) return res.status(200).json(APIResponse.success(response))

  let count
  if(queryString)
    count = await UserService.searchCount(platformAccountId, queryString)
  
  else
    count = await UserService.countUsersByParentAccount(platformAccountId)
  
  response.count = count ? count : 0

  const finalUsers = users.map(user => unslink(user, '__'))
  response.users = finalUsers as IUserModel[]

  return res.status(200).json(APIResponse.success(response))
}

const handleGetUserMeta = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const userId = req.params.userId || null
  if(!userId) return res.status(400).json(APIResponse.failure('UserId is required'))

  const meta = await UserMetaService.getAll(platformAccountId, userId)
  if(!meta) res.status(200).json(APIResponse.success([]))

  return res.status(200).json(APIResponse.success(meta))
}

const handleGetUserMetaByKey = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const userId = req.user.userId || null
  const key = req.params.key || null
  if(!key) return res.status(400).json(APIResponse.failure('Key is required'))

  const meta = await UserMetaService.getByKey(platformAccountId, userId, key)
  if(!meta) return res.status(404).json(APIResponse.failure('User meta not found for key'))

  return res.status(200).json(APIResponse.success(meta))
}

const handleUpsertUserMeta = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const userId = req.params.userId || null
  if(!userId ) return res.status(400).json(APIResponse.failure('User ID is required'))

  const userMeta = req.body || null
  if(!Array.isArray(userMeta)) return res.status(400).json(APIResponse.failure('Request body must be an array. [ { key: "key", value: "value" } ]'))

  try {
    const entries: IUserMetaModel[] = userMeta.map((meta: any) => {
      if(!meta.key || !meta.value) throw new Error('Invalid user meta entry')
  
      return {
        platformAccountId,
        userId: userId,
        metaKey: meta.key,
        metaValue: meta.value,
      }
    })
  
    const meta = await UserMetaService.upsertUserMeta(entries)
    if(!meta) return res.status(500).json(APIResponse.failure('Error upserting user meta'))
  }
  catch (error) {
    logger.error('Error updating user meta', error)
    return res.status(500).json(APIResponse.failure('Error upserting user meta'))
  }

  return res.status(200).json(APIResponse.success({ }))
}

const handleDeleteUserMeta = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId
  const userId = req.params.userId || null
  const { key } = req.body || null
  if(!userId || !key) return res.status(400).json(APIResponse.failure('Invalid request'))

  const meta = await UserMetaService.deleteByKey(platformAccountId, userId, key)
  if(!meta) return res.status(404).json(APIResponse.failure('User meta not found for key'))

  return res.status(200).json(APIResponse.success(meta))
}

const handleGetUserStats = async (req: Request, res: Response) => {
  const platformAccountId = req.user.platformAccountId

  const currentDate = new Date().toISOString().split('T')[0]
  const from = ( req.query.from || subtractDays(currentDate, 30) ) as string
  const to = ( req.query.to || subtractDays(currentDate, 1) ) as string

  const statType = req.query.type as 'trend' | 'count' || 'trend'

  if(statType === 'trend'){
    const authEvent = req.query.event as AuthEvents || null
    if(!authEvent) return res.status(400).json(APIResponse.failure('Auth event must be specified.'))
  
    const stats = await AuthEventsService.getEventsBetweenDates(platformAccountId, authEvent, from, to)
    return res.status(200).json(APIResponse.success(stats))
  }

  if(statType === 'count'){
    const figure = req.query.figure || 'dau'
    const from = ( req.query.from || subtractDays(currentDate, 30) ) as string
    const to = ( req.query.to || subtractDays(currentDate, 1) ) as string
    
    if(figure === 'dau'){
      const stat = await AuthEventsService.getAvgDailyActiveUsers(platformAccountId, from, to)
      return res.status(200).json(APIResponse.success({ figure: stat }))
    }

    if(figure === 'mau'){
      const stat = await AuthEventsService.getAvgMonthlyActiveUsers(platformAccountId, from, to)
      return res.status(200).json(APIResponse.success({ figure: stat }))
    }

    if(figure === 'tau'){
      const stat = await AuthEventsService.getTotalActiveUsers(platformAccountId)
      return res.status(200).json(APIResponse.success({ figure: stat }))
    }
  }

  return res.status(400).json(APIResponse.failure('Invalid request'))

}

export default {
  handleCreateUser,
  handleDeleteUserMeta,
  handleGetApiKey,
  handleGetSessionByKey,
  handleGetSessions,
  handleGetUserActivity,
  handleGetUserById,
  handleGetUserMeta,
  handleGetUserMetaByKey,
  handleGetUsers,
  handleGetUserStats,
  handleRefreshAPIKey,
  handleResetPassword,
  handleSetPassword,
  handleTerminateSession,
  handleUpdateUser,
  handleUpsertUserMeta,
  handleVerifyUser,
  login,
  logout,
  refreshSession,
  signUp,
}
