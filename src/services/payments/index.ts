import { stripe } from '@/services/vendors/stripe.vendor.service'

import PaymentsSettingsRepo from '@/repositories/payments/settings.repo'
import PaymentSettings from '@/enums/billing/paymentSettings.enum'
import PaymentsMethodsRepo from '@/repositories/payments/methods.repo'

import AccountsSettingsService from '../accounts/accountsSettings.service'
import AccountSettingsEnum from '@/enums/accounts/accountSettings.enum'

//
// Payments Settings
//
export const getExternalCustomerId = async (accountId: string) => {
  return await PaymentsSettingsRepo.getExternalCustomerId( accountId)
}

export const createPaymentSetting = async (accountId: string, key: string, value: any) => {
  return await PaymentsSettingsRepo.createPaymentSetting( accountId, key, value)
}

export const updatePaymentSettings = async (obj: any, accountId: string) => {
  return await PaymentsSettingsRepo.updatePaymentSettings(obj, accountId)
}

export const getPaymentSettings = async (accountId: string) => {
  return await PaymentsSettingsRepo.getPaymentSettings( accountId)
}

export const getPaymentSettingsByKey = async (key: string, accountId: string) => {
  return await PaymentsSettingsRepo.getPaymentSettingsByKey(key, accountId)
}

//
// Payment Methods
//

export const createPaymentMethod = async (accountId, obj: any) => {
  try {
    await AccountsSettingsService.deleteSetting(accountId, AccountSettingsEnum.ACCOUNT_HAS_FAILED_BILLING)
  }
  catch (error) {
    logger.error('Error deleting setting', error)
  }
  
  return await PaymentsMethodsRepo.createPaymentMethod(obj)
}

export const getDefaultPaymentMethod = async (accountId: string) => {
  return await PaymentsMethodsRepo.getDefaultPaymentMethod( accountId)
}

export const deletePaymentMethod = async (accountId: string, methodId: string) => {
  return await PaymentsMethodsRepo.deletePaymentMethod( accountId, methodId)
}

export const getAllPaymentMethodsForAccount = async (accountId: string) => {
  return await PaymentsMethodsRepo.getAllPaymentMethodsForAccount( accountId)
}

export const setDefaultPaymentMethodForAccountId = async (methodId: string, accountId: string) => {
  return await PaymentsMethodsRepo.setDefaultPaymentMethodForAccountId(methodId, accountId)
}

export const unsetDefaultsForAccountId = async (accountId: string) => {
  return await PaymentsMethodsRepo.unsetDefaultsForAccountId( accountId)
}

export const getPaymentMethodByExternalId = async (accountId: string, paymentMethodId: string) => {
  return await PaymentsMethodsRepo.getPaymentMethodByExternalId(accountId, paymentMethodId)
}

//
// Create payment with payment method via Payment Intents
//
export const createOffSessionPaymentIntent = async (accountId: string, amount: number) => {
  const stripeCustomerId = await PaymentsSettingsRepo.getPaymentSettingsByKey(PaymentSettings.STRIPE_CUSTOMER_ID, accountId)
  const paymentMethod = await PaymentsMethodsRepo.getDefaultPaymentMethod(accountId)

  const paymentAmount = (Math.round(amount * 100) / 100).toFixed(2)
  const formattedAmount = paymentAmount.replace('.', '')
  logger.info(stripeCustomerId, paymentMethod, paymentAmount, formattedAmount)
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: +formattedAmount,
      currency: 'usd',
      customer: stripeCustomerId.settingValue,
      payment_method: paymentMethod.providerMethodId,
      off_session: true,
      confirm: true,
    })
    logger.info(paymentIntent)

    return true
  }
  catch (err: any) {
    // Error code will be authentication_required if authentication is needed
    logger.info('Error code is: ', err.code)
    const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id)
    logger.info('PI retrieved: ', paymentIntentRetrieved.id)
    err.paymentIntentRetrieved = paymentIntentRetrieved.id
    logger.error(err)
  }

  return null
}

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
  createOffSessionPaymentIntent,
}
