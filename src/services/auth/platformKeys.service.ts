import PlatformKeysRepo from '@/repositories/auth/platformKeys.repo'
import type PlatformKeys from '@/types/auth/plaformKeys.interface'
import type Accounts from '@/repositories/accounts/accounts.interface'
import IDs from '@/utils/ids'

const findByAPIKey = async (
  apiKey: string,
): Promise<{platformAccountId: string} | null> => {
  return await PlatformKeysRepo.findByAPIKey(apiKey)
}

const createAPIKey = async (platformAccountId: string): Promise<{apiKey: string} | null> => {
  const APIKey = await IDs.apiKey()
  const didSetAPIKey = await PlatformKeysRepo.createAPIKey(platformAccountId, APIKey)
  if(!didSetAPIKey) return null

  return { apiKey: APIKey }
}

const deleteAPIKey = async (platformAccountId: PlatformKeys['platformAccountId']): Promise<boolish> => {
  return await PlatformKeysRepo.deleteAPIKey(platformAccountId)
}

const getAPIKey = async (platformAccountId: string): Promise<PlatformKeys['publicKey'] | null> => {
  return await PlatformKeysRepo.getAPIKey(platformAccountId)
}

const updateAPIKey = async (platformAccountId: string, apiKey: string): Promise<boolish> => {
  return await PlatformKeysRepo.updateAPIKey(platformAccountId, apiKey)
}

export default {
  createAPIKey,
  deleteAPIKey,
  getAPIKey,
  updateAPIKey,
  findByAPIKey,
}
