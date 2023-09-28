import PaymentsSettingsRepo from '@/repositories/payments/settings.repo'
import PaymentsMethodsRepo from '@/repositories/payments/methods.repo'
//
// Payments Settings
//
// TODO - ADD PARENT ACCOUNT LOGIC

export const getExternalCustomerId = async (accountId) => {
  return await PaymentsSettingsRepo.getExternalCustomerId(accountId)
}

export const createPaymentSetting = async (accountId, key, value) => {
  return await PaymentsSettingsRepo.createPaymentSetting(accountId, key, value)
}

export const updatePaymentSettings = async (obj, accountId) => {
  return await PaymentsSettingsRepo.updatePaymentSettings(obj, accountId)
}

export const getPaymentSettings = async (accountId) => {
  return await PaymentsSettingsRepo.getPaymentSettings(accountId)
}

export const getPaymentSettingsByKey = async (key, accountId) => {
  return await PaymentsSettingsRepo.getPaymentSettingsByKey(key, accountId)
}

//
// Payment Methods
//

export const createPaymentMethod = async (obj) => {
  return await PaymentsMethodsRepo.createPaymentMethod(obj)
}

export const getDefaultPaymentMethod = async (accountId) => {
  return await PaymentsMethodsRepo.getDefaultPaymentMethod(accountId)
}

export const deletePaymentMethod = async (accountId, method_id) => {
  return await PaymentsMethodsRepo.deletePaymentMethod(accountId, method_id)
}

export const getAllPaymentMethodsForAccount = async (accountId) => {
  return await PaymentsMethodsRepo.getAllPaymentMethodsForAccount(accountId)
}

export const setDefaultPaymentMethodForAccountId = async (method_id, accountId) => {
  return await PaymentsMethodsRepo.setDefaultPaymentMethodForAccountId(method_id, accountId)
}

export const unsetDefaultsForAccountId = async (accountId) => {
  return await PaymentsMethodsRepo.unsetDefaultsForAccountId(accountId)
}

export const getPaymentMethodByExternalId = async (accountId, paymentMethodId) => {
  return await PaymentsMethodsRepo.getPaymentMethodByExternalId(accountId, paymentMethodId)
}

//
//
// Create a subscription
//
export default {
  getExternalCustomerId,
  createPaymentSetting,
  updatePaymentSettings,
  getPaymentSettings,
  getPaymentSettingsByKey,
  createPaymentMethod,
  getDefaultPaymentMethod,
  deletePaymentMethod,
  getAllPaymentMethodsForAccount,
  setDefaultPaymentMethodForAccountId,
  unsetDefaultsForAccountId,
  getPaymentMethodByExternalId,
}
