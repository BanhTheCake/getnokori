import UserMetaRepo from '@/repositories/auth/userMeta.repo'
import type IUserMetaModel from '@/types/auth/userMeta.interface'

const upsertUserMeta = async (userMeta: IUserMetaModel[]): Promise<true | null> => {
  const formattedUserMeta = userMeta.map((meta) => {
    return [
      meta.platformAccountId,
      meta.userId,
      meta.metaKey,
      meta.metaValue,
    ]
  })
  return await UserMetaRepo.upsertUserMeta(formattedUserMeta)
}

const getAll = async (platformAccountId: string, userId: string): Promise<IUserMetaModel[]> => {
  return await UserMetaRepo.getAll(platformAccountId, userId)
}

const getByKey = async (platformAccountId: string, userId: string, key: string): Promise<IUserMetaModel | null> => {
  return await UserMetaRepo.getByKey(platformAccountId, userId, key)
}

const deleteByKey = async (platformAccountId: string, userId: string, key: string): Promise<boolean> => {
  return await UserMetaRepo.deleteByKey(platformAccountId, userId, key)
}

export default {
  upsertUserMeta,
  getAll,
  getByKey,
  deleteByKey,
}
