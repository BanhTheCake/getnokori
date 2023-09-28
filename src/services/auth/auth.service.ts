import { pbkdf2Sync, randomBytes } from 'crypto'
// import jwt from 'jsonwebtoken'
import AccountCredentialsService from '@/services/auth/platformKeys.service'
import AccountsService from '@/services/accounts/accounts.service'
import type Accounts from '@/repositories/accounts/accounts.interface'
import UserRepository from '@/repositories/auth/users.repo'
import type { IUserModel } from '@/types/accounts/UsersModel.interface'
import MailService from '@/services/email'
import IDs from '@/utils/ids'
import { slink } from '@/utils/slinky'

import SessionService from './session.service'

// TODO: Abstract to auth provider class factory
// export const verifyJWT = (token: string, authToken: string) => {
//   return jwt.verify(token, authToken)
// }

const _setPassword = (password) => {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

  return { salt, hash }
}

const generatePasswordResetToken = async (accountId: IUserModel['accountId'], userId: IUserModel['userId']) => {
  const resetToken: string = IDs.random(26)
  
  const update: Partial<IUserModel> = {}

  const updated = await UserRepository.updateUser(accountId, userId, update)

  return updated ? resetToken : false
}

const _generateUID = () => {
  return IDs.userId()
}

const setUserVerified = async (platformAccountId: string, userId: IUserModel['userId']): Promise<boolish> => {
  const success = await UserRepository.setUserVerified(platformAccountId, userId)
  return success
}

const validatePassword = (password: string, salt: string, hash: string) => {
  const vHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return vHash === hash
}

interface Payload { userId: string; accountId: string } // TODO: Abstract to types defs
// const generateToken = (payload: Payload) => {
//   return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
//     expiresIn: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
//   }) 
// }

const saveNewPassword = async (platformAccountId: IUserModel['platformAccountId'], user: IUserModel, password: string) => {
  const pass = _setPassword(password)
  const success = await UserRepository.updateUser(platformAccountId, user.userId, {
    password: pass.hash,
    salt: pass.salt,
    hasPassword: true,
  })

  // we trust the user is verified because we just sent them an email to reset their password
  if (!user.verified) {
    try {
      setUserVerified(platformAccountId, user.userId)
    }
    catch (error) {
      logger.error('Error verifying user during password reset', error)
    }
  }

  return success
}

const userAuthorized = async (platformAccountId: string, accessToken: string) => {
  const session = await SessionService.getSession(platformAccountId, accessToken)

  if(!session)
    return null

  try { 
    await SessionService.refreshSession(session)
    
    const now = Math.floor(new Date().getTime() / 1000) // / 1000 to get seconds

    const currentSession = await SessionService.getSession(platformAccountId, accessToken)
    if(currentSession && currentSession.expiresAt! > now) return currentSession

    return null
  }
  catch (error) {
    logger.error('error', error)
    return null
  }

}

const getUserByEmail = async (platformAccountId: string, email: string): Promise<IUserModel | null> => {
  const _email = email.toLowerCase()
  const user: IUserModel | null = await UserRepository.getUserByEmail(platformAccountId, _email)
  return user
}

const getUserById = async (platformAccountId: IUserModel['platformAccountId'], userId: IUserModel['userId']) => {
  const user = await UserRepository.getUserById(platformAccountId, userId)
  return user
}

/**
 * @description Deprecated
 */
const getUserByVerifyToken = async (platformAccountId: string, verifyToken: string): Promise<IUserModel | null> => {
  const user = await UserRepository.getUserByVerifyToken(platformAccountId, verifyToken)
  return user
}

/**
 * @description Deprecated
 */
const getUserByVerifyRequestToken = async (verifyRequestToken: string) => {
  return await UserRepository.getUserByVerifyRequestToken(verifyRequestToken)
}

const getUserByPasswordResetToken = async (token: string) => {
  const user = await UserRepository.getUserByPasswordResetToken(token)
  return user
}

interface IArgs extends Partial<IUserModel> {
  autoVerify: boolean
}
const createUser = async (platformAccountId, args: IArgs) => {
  if(!platformAccountId || !args.email) return null
  
  const { email, autoVerify, ...restUser } = args

  const _email = args.email.toLowerCase()
  const user: Partial<IUserModel> = {
    email: _email,
    platformAccountId,
    ...restUser,
  }

  if(autoVerify && user.password)
    user.verified = true
  
  let accountId = ''
  const userExists = await UserRepository.getUserByEmail(platformAccountId, _email)

  if (userExists) 
    return false

  accountId = IDs.accountId()
  try {
    await AccountsService.createAccount(platformAccountId, accountId) 
  }
  catch (error) {
    logger.error('Error creating account', error)
    return null
  }

  const masterPlatformAccountIds = ['lola.acct.Ng2kvR5c1WKBHLJfbvekW1', 'lola.acct.fj02Txhpcpqfj3ovCxW']
  if(masterPlatformAccountIds.includes(platformAccountId)) 
    await AccountCredentialsService.createAPIKey(accountId)
  
  user.platformAccountId = platformAccountId
  user.accountId = accountId
  
  let passParts
  
  if(user.password) 
    passParts = _setPassword(user.password)

  user.userId = _generateUID()
  user.password = passParts ? passParts.hash : null
  user.salt = passParts ? passParts.salt : null
  user.hasPassword = passParts ? true : false

  user.verified = args.autoVerify ? true : false

  const userRecord = slink(user)
 
  const createSuccess = await UserRepository.createUser(userRecord as IUserModel)
  if (createSuccess) {
    const createdUser = await UserRepository.getUserByEmail(platformAccountId, _email)
    return createdUser
  }

  return false
}

const updateUser = async (accountId: string, userId: string, user) => {
  if (user.displayName) {
    const [firstName, ...lastName] = user.displayName.split(' ')

    user.firstName = firstName
    user.lastName = lastName.join(' ')
  }

  if (user.name) {
    const [firstName, ...lastName] = user.name.split(' ')

    user.firstName = firstName
    user.lastName = lastName.join(' ')
  }

  delete user.displayName
  delete user.name

  const updated = await UserRepository.updateUser(accountId, userId, {
    ...user,
  })

  return updated
}

const sendVerificationEmail = async (user) => {
  const verifyUrl = `${process.env.APP_URL}/sign-up/verify?token=${user.verifyToken}&accountId=${user.accountId}`

  const text = `Hi there!

  Please verify your nokori account by clicking the following link.

  ${verifyUrl}
  `
  
  // TODO: Should subjects be configurable? I guess they'll have to be.
  // 
  const sent = await MailService.send({
    to: user.email,
    subject: 'Please verify your email',
    template: 'confirm_account_creation',
    variables: {
      verify_url: verifyUrl,
    },
    text,
  })

  logger.info('Verification email sent', { user: user.user_id, status: sent })

  return sent
}

const sendPasswordResetEmail = async (accountId: string, user) => {
  const resetToken = await generatePasswordResetToken(accountId, user.userId)

  const firstName = user.firstName || 'there'
  const link = `${process.env.APP_URL}/password-reset?token=${resetToken}`

  const text = `Hi ${firstName}!

  You recently requested to reset your nokori account password. Please click this link to reset your password.
  
  ${link}
  
  f you ignore this message, your password will not be changed. If you didn't request a password reset, please let us know.`

  // send email
  const sent = await MailService.send({
    to: user.email,
    subject: 'Reset your password',
    template: 'auth_reset_password',
    variables: {
      first_name: firstName,
      link,
    },
    text,
  })

  logger.info('Password reset email sent', { user, status: sent })

  return { sent, resetToken }
}

/**
 * A function that takes object user of type IUserModel and returns
 * only the userId and accountId properties as an object.
 */
const sanitizeUserForToken = (user: IUserModel): 
{ 
  userId: IUserModel['userId']
  accountId: IUserModel['accountId']
  platformAccountId: IUserModel['platformAccountId'] 
} => {

  const { userId, accountId, platformAccountId } = user
  return { userId, accountId, platformAccountId }
}

export default {
  // verifyJWT,
  createUser,
  // generateToken,
  getUserByEmail,
  getUserById,
  getUserByPasswordResetToken,
  getUserByVerifyToken,
  getUserByVerifyRequestToken,
  sanitizeUserForToken,
  saveNewPassword,
  sendPasswordResetEmail,
  sendVerificationEmail,
  setUserVerified,
  updateUser,
  userAuthorized,
  validatePassword,
}
