import AuthTokenRepo from '@/repositories/auth/userVerify.repo'
import { emailVerifyId } from '@/utils/ids'

const generate = async (userId: string, platformAccountId: string): Promise<{token: string} | null> => {
  const token = emailVerifyId()
  const result = await AuthTokenRepo.upsertToken(userId, platformAccountId, token)
  if(result) 
    return { token }

  return null
}

const getActiveToken = async (token: string, platformAccountId: string): Promise<boolean> => {
  return await AuthTokenRepo.getActiveToken(token, platformAccountId)
}

const deleteToken = async (token: string, platformAccountId: string): Promise<boolean> => {
  return await AuthTokenRepo.deleteToken(token, platformAccountId)
}

const getUserByToken = async (token: string, platformAccountId: string): Promise<any | null> => {
  return await AuthTokenRepo.getUserByToken(token, platformAccountId)
}

const sendVerificationEmail = async (platformAccountId: string, userId: string, email: string): Promise<{result: string | boolean | null; error: string | null}> => {
  const token = await generate(userId, platformAccountId)
  if(!token)
    return { result: null, error: 'Failed to generate token' }

  console.log('sendVerificationEmail', token)

  // const emailService = new EmailService()
  // const result = await emailService.sendEmailVerification(email, token.token)
  // if(!result)
  //   return false

  return { result: true, error: null }
}

export default {
  generate,
  getActiveToken,
  getUserByToken,
  deleteToken,
  sendVerificationEmail,
}
