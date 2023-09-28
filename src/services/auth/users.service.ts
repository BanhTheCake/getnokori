import UserRepository from '@/repositories/auth/users.repo'
import type { IUserModel } from '../../types/accounts/UsersModel.interface'

const formatUserLocation = (user: IUserModel) => {
  let address = ''

  if (user.address__locality) 
    address += user.address__locality
  
  if (user.address__locality && user.address__region) 
    address += ', '
  
  if (user.address__region) 
    address += user.address__region
  
  if (address && user.address__country) 
    address += ', '
  
  if (user.address__country) 
    address += user.address__country

  return address
}

const sanitizeUserForProfile = (user: IUserModel): Omit<IUserModel, 'password' | 'salt' | 'passResetToken' | 'verifyToken' | 'verifyRequestToken' | 'verified'> => {
  delete user.password
  delete user.salt

  // user.google_place = user.google_place ? JSON.parse(user.google_place) : null

  // user.display_name = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : ''

  // user.co_location = formatUserLocation(user)

  // let jobTitle = user.co_role ? user.co_role : ''
  // if (user.co_name) {
  //   if (jobTitle.length) 
  //     jobTitle += ' '
    
  //   jobTitle += `@ ${user.co_name}`
  // }

  // user.job_title = jobTitle

  return user
}

const getMultipleUsersByUserIds = async (accountId: IUserModel['accountId'], userIds: IUserModel['userId'][]) => {
  if (!userIds || userIds.length === 0) 
    return []

  const users = await UserRepository.getMultipleUsersByUserIds(accountId, userIds)

  if (!users) 
    return []

  const profiles = users.map(sanitizeUserForProfile)

  return profiles
}

const getMultipleUsersByEmails = async (accountId: IUserModel['accountId'], emails: IUserModel['email'][]) => {
  if (!emails || emails.length === 0) 
    return []

  const users = await UserRepository.getMultipleUsersByEmails(accountId, emails)

  if (!users) 
    return []

  const profiles = users.map(sanitizeUserForProfile)

  return profiles
}

const getUsersByAccountIds = async (accountId: IUserModel['accountId'], emails: IUserModel['email'][]) => {
  if (!emails || emails.length === 0) 
    return []

  const users = await UserRepository.getUsersByAccountIds(accountId, emails)

  if (!users) 
    return []

  const profiles = users.map(sanitizeUserForProfile)

  return profiles
}

const getUserById = async (accountId: IUserModel['accountId'], userId: IUserModel['userId']): Promise<any | null> => {
  return await UserRepository.getUserById(accountId, userId)
}

const getUserByEmail = async (platformAccountId: string, email: IUserModel['email'], active: number = 1): Promise<IUserModel | null> => {
  return await UserRepository.getUserByEmail(platformAccountId, email, active)
}

const updateUser = async (platformAccountId: IUserModel['platformAccountId'], userId: IUserModel['userId'], user: Partial<IUserModel>): Promise<boolish> => {
  return await UserRepository.updateUser(platformAccountId, userId, user)
}

const deleteUsersByAccountId = async (accountId: IUserModel['accountId']): Promise<true | null> => {
  return await UserRepository.deleteUsersByAccountId(accountId)
}

const deleteUserById = async (accountId: IUserModel['accountId'], userId: IUserModel['userId']): Promise<true | null> => {
  return await UserRepository.deleteUserById(accountId, userId)
}

const getUsersByParentAccount = async (platformAccountId: string, offset: number = 0, limit: number = 25): Promise<IUserModel[] | null> => {
  return await UserRepository.getUsersByParentAccount(platformAccountId, offset, limit)
}

const countUsersByParentAccount = async (platformAccountId: string): Promise<number | null> => {
  return await UserRepository.countUsersByParentAccount(platformAccountId)
}

const search = async (platformAccountId: string, queryString: string, offset: number = 0, limit: number = 25): Promise<IUserModel[] | []> => {
  return await UserRepository.search(platformAccountId, queryString, offset, limit)
}

const searchCount = async (platformAccountId: string, queryString: string): Promise<number | null> => {
  return await UserRepository.searchCount(platformAccountId, queryString)
}

export default {
  countUsersByParentAccount,
  deleteUserById,
  deleteUsersByAccountId,
  formatUserLocation,
  getMultipleUsersByEmails,
  getMultipleUsersByUserIds,
  getUserByEmail,
  getUserById,
  getUsersByAccountIds,
  getUsersByParentAccount,
  sanitizeUserForProfile,
  search,
  searchCount,
  updateUser,
}
