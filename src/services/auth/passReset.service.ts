import PassResetRepo from '@/repositories/auth/passReset.repo'
import { passResetId } from '@/utils/ids'

const generate = async (userId: string, platformAccountId: string): Promise<{token: string} | null> => {
  const token = passResetId()
  const result = await PassResetRepo.upsertToken(userId, platformAccountId, token)
  if(result) 
    return { token }

  return null
}

const getActiveToken = async (token: string, platformAccountId: string): Promise<boolean> => {
  return await PassResetRepo.getActiveToken(token, platformAccountId)
}

const deleteToken = async (token: string, platformAccountId: string): Promise<boolean> => {
  return await PassResetRepo.deleteToken(token, platformAccountId)
}

const getUserByToken = async (token: string, platformAccountId: string): Promise<any | null> => {
  return await PassResetRepo.getUserByToken(token, platformAccountId)
}

export default {
  generate,
  getActiveToken,
  getUserByToken,
  deleteToken,
}
