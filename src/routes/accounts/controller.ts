import APIResponse from '@/utils/apiResponse'
import type { NextFunction, Request, Response } from 'express'

import AccountsService from '@/services/accounts/accounts.service'
import UserService from '@/services/accounts/users.service'
import ImageStorageService from '@/services/images/ImageStorage.service'
import type { IUserModel } from '@/types/accounts/UsersModel.interface'
import { isValidIUserModel } from '@/types/accounts/UsersModel.interface'
import { random } from '@/utils/ids'
import { slink, unslink } from '@/utils/slinky'

import CredentialsService from '@/services/auth/platformKeys.service'
import BillingService from '@/services/billing/plans.service'

import AccountSettingsService from '@/services/accounts/accountsSettings.service'
import AccountSettingsEnum from '@/enums/accounts/accountSettings.enum'

const handleGetUserProfile = async (req: Request, res: Response) => {
  const accountId = req.params.accountId
  const userId = req.params.userId

  const account = await UserService.getUserById(accountId, userId)
  if(!account)
    return res.status(500).json(APIResponse.failure('Failed to get account'))
  return res.status(200).json(APIResponse.success( unslink(account) ))
}

const handleImageUpload = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.params.accountId
  const userId = req.params.userId

  if (!Array.isArray(req.files) || req.files.length === 0) 
    return res.status(400).json(APIResponse.failure('Invalid image'))
  
  const file = req.files[0]
  const key = `images/accounts/${accountId}/users/${userId}/${file.fieldname}-${random(16)}.png`

  try {
    const imageUrl = await ImageStorageService.uploadFromBuffer(key, file)
    if(!imageUrl){
      res.status(500).json(APIResponse.failure('Failed to upload image'))
      return next()
    }
    
    // Update user profile
    const userUpdate: {avatarURI: IUserModel['avatarURI']} = {
      avatarURI: key, // only the URI so the hostname can be dynamically set
    }
    await UserService.updateUser(accountId, userId, userUpdate)
    res.status(200).json(APIResponse.success(userUpdate))
    return next()
  }
  catch (error) {
    logger.error('Error uploading image', { error })
  }

  res.status(500).json(APIResponse.failure('Failed to upload image'))
  return next()
}

const handleUpdateUserProfile = async (req: Request, res: Response) => {
  const accountId = req.params.accountId
  const userId = req.params.userId

  if(!req.body) return res.status(400).json(APIResponse.failure('Missing required params'))

  const userUpdate = req.body
  const isValidRequest = await isValidIUserModel(userUpdate)
  if(isValidRequest.errors)
    return res.status(400).json(APIResponse.failure('Invalid user update', { error: isValidRequest.errors }))

  // Just in case
  delete userUpdate.password
  delete userUpdate.salt

  const user = await UserService.updateUser(accountId, userId, slink(userUpdate))
  if(!user)
    return res.status(500).json(APIResponse.failure('Failed to update user'))

  return res.status(200).json(APIResponse.success(user))
}

const handleDeleteAccount = async (req: Request, res: Response) => {
  const accountId = req.params.accountId

  if(!accountId) return res.status(400).json(APIResponse.failure('Missing required params'))

  try {
    await CredentialsService.deleteAPIKey(accountId)
    await BillingService.deletePlans(accountId)
    await UserService.deleteUsersByAccountId(accountId)
    await AccountsService.deleteAccount(accountId)
  }
  catch (error) {
    logger.error('Error deleting account', { error })
  }
  return res.status(200).json(APIResponse.success('Account deleted'))
}

const handleGetAccountSettings = async (req: Request, res: Response) => {
  const accountId = req.params.accountId
  const setting = req.query.setting as string

  const accountSetting = await AccountSettingsService.getSettingByKey(accountId, setting)
  if(!accountSetting)
    return res.status(200).json(APIResponse.success({ value: null }))

  return res.status(200).json(APIResponse.success({ value: accountSetting }))
}

export default {
  handleDeleteAccount,
  handleGetUserProfile,
  handleImageUpload,
  handleUpdateUserProfile,
  handleGetAccountSettings,
}
