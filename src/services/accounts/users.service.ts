import type { IUserModel } from '@/types/accounts/UsersModel.interface'
import UserProfileRepo from '@/repositories/auth/users.repo'

const createUser = async (args: IUserModel): Promise<true | null> => {
  return await UserProfileRepo.createUser(args)
}

const updateUser = async (accountId: IUserModel['accountId'], userId: IUserModel['userId'], user: Partial<IUserModel>): Promise<boolish> => {
  return await UserProfileRepo.updateUser(accountId, userId, user)
}

const getUserById = async (accountId: IUserModel['accountId'], userId: IUserModel['userId']): Promise<IUserModel | null> => {
  return await UserProfileRepo.getUserById(accountId, userId)
}

const getUserByEmail = async (platformAccountId: string, email: IUserModel['email'], active: number = 1): Promise<IUserModel | null> => {
  return await UserProfileRepo.getUserByEmail(platformAccountId, email, active)
}

const setUserVerified = async (platformAccountId: string, userId: IUserModel['userId']): Promise<boolish> => {
  return await UserProfileRepo.setUserVerified(platformAccountId, userId)
}

const getMultipleUsersByUserIds = async (accountId: IUserModel['accountId'], userIds: IUserModel['userId'][]): Promise<IUserModel[] | null> => {
  return await UserProfileRepo.getMultipleUsersByUserIds(accountId, userIds)
}

const getMultipleUsersByEmails = async (accountId: IUserModel['accountId'], emails: IUserModel['email'][]): Promise<IUserModel[] | null> => {
  return await UserProfileRepo.getMultipleUsersByEmails(accountId, emails)
}

const getUsersByAccountIds = async (accountId: IUserModel['accountId'], emails: IUserModel['email'][]): Promise<IUserModel[] | null> => {
  return await UserProfileRepo.getUsersByAccountIds(accountId, emails)
}

const deleteUsersByAccountId = async (accountId: IUserModel['accountId']): Promise<true | null> => {
  return await UserProfileRepo.deleteUsersByAccountId(accountId)
}

const deleteUserById = async (accountId: IUserModel['accountId'], userId: IUserModel['userId']): Promise<true | null> => {
  return await UserProfileRepo.deleteUserById(accountId, userId)
}

export default {
  createUser,
  getMultipleUsersByEmails,
  getMultipleUsersByUserIds,
  getUserByEmail,
  getUserById,
  getUsersByAccountIds,
  setUserVerified,
  updateUser,
  deleteUsersByAccountId,
  deleteUserById,
}
