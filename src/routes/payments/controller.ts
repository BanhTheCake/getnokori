import APIResponse from '@/utils/apiResponse'
import type { NextFunction, Request, Response } from 'express'
import PaymentsService from '@/services/payments'
import { stripe } from '@/services/vendors/stripe.vendor.service'
import Slinky from '@/utils/slinky'
import { nanoid } from 'nanoid'
import PaymentSettings from '@/enums/billing/paymentSettings.enum'

export const handleSetupIntentCreate = async (req, res) => {
  
  // TODO Refactor this to service
  const setupIntent = await stripe.setupIntents.create({ usage: 'off_session' })
  if(setupIntent){
    const response = {
      type: 'setupIntent',
      intent: setupIntent,
    }
    return res.status(200).json(APIResponse.success(response))
  }

  res.status(500).json(APIResponse.failure('Unable to create setup intent'))
}

export const handlePaymentMethodCreate = async (req, res) => {
  if (!req.user || !req.user.platformAccountId) return res.json(APIResponse.failure('Must be logged in.'))
  if (!req.body.paymentMethodDetails) return res.json(APIResponse.failure('Payment info not provided.'))

  const { userId, platformAccountId } = req['user']
  const paymentInfo = req.body.paymentMethodDetails

  // Check to see if we already have an external customer id from our payment system.
  let payAccount = await PaymentsService.getExternalCustomerId(platformAccountId)

  // If no external customer id exists, lets create them one.
  if (!payAccount) {
    try {
      const customer = await stripe.customers.create({
        description: `${platformAccountId}`,
        email: paymentInfo.billing_details.email,
        metadata: { accountId: platformAccountId, userId },
      })
      if (customer.id) {
        await PaymentsService.createPaymentSetting(platformAccountId, PaymentSettings.STRIPE_CUSTOMER_ID, customer.id)
        payAccount = { settingValue: customer.id }
      }
    }
    catch (error) {
      logger.error(error)
      return res.status(500).json(APIResponse.failure('Error creating payment method.'))
    }
  }

  // Attach the new payment method to their customer account with our payments provider.
  try {
    await stripe.paymentMethods.attach(paymentInfo.id, { customer: payAccount.settingValue })
  }
  catch (error) {
    logger.error(error)
    return res.status(500).json(APIResponse.failure('Error attaching payment method.'))
  }

  // Lets check for existing payment methods so we can make a decision regarding default payment method or not.
  const hasExistingMethods = await PaymentsService.getAllPaymentMethodsForAccount(platformAccountId)
  if (!hasExistingMethods) 
    paymentInfo.isDefault = 1

  // Remove object properties we aren't going to save.
  delete paymentInfo.card.checks
  delete paymentInfo.card.networks
  delete paymentInfo.card.three_d_secure_usage
  delete paymentInfo.card.wallet

  // Remap object id to our internal object nomenclature.
  paymentInfo.providerMethodId = paymentInfo.id

  // Remove it so our db insertion doesn't blow up.
  delete paymentInfo.id

  // Create an internal id reference to this payment method
  paymentInfo.methodId = `lola.paym.${nanoid(16)}`

  // Attach account id
  paymentInfo.accountId = req.user.platformAccountId

  // In the future we will need to pass expiration month as '08' not '8'.
  const expMonthFix = `${ paymentInfo.card.exp_month}`
  paymentInfo.card.exp_month = expMonthFix.padStart(2, '0')

  // Flatten object for db representation/insertion.
  const dbObject = await Slinky.slink(paymentInfo, '__')

  try {
    // attempt to create our payment method and response with a success message.
    await PaymentsService.createPaymentMethod(platformAccountId, dbObject)
    return res.status(200).json(APIResponse.success({ result: 'success', providerMethodId: paymentInfo.vendorId }))
  }
  catch (error: any) {
    logger.error(error)
    if (error.errno === 1062) 
      return res.status(200).json(APIResponse.failure('Payment method already exists.'))
    
    else 
      return res.status(200).json(APIResponse.failure('An unknown error has occurred.'))
    
  }
}

export const handleDeletePaymentMethod = async (req, res) => {
  if (!req.user || !req.user.platformAccountId) return res.json(APIResponse.failure('Must be logged in.'))
  if (!req.params.methodId) return res.json(APIResponse.failure('Payment method id must be specified.'))

  const accountId = req.user.platformAccountId
  const paymentMethodId = req.params.methodId

  const deleteResponse = await PaymentsService.deletePaymentMethod(accountId, paymentMethodId)
  if (deleteResponse) 
    return res.json(APIResponse.success([]))

  return res.json(APIResponse.failure('Error deleting payment method.'))
}

export const handleListPaymentMethods = async (req, res) => {
  if(!req.user || !req.user.platformAccountId) return res.json(APIResponse.failure('Must be logged in.'))
  // if(!req.params.customerId) return res.json(APIResponse.failure('Must provide a customer ID.'))

  const accountId = req.user.platformAccountId

  const allPaymentMethods = await PaymentsService.getAllPaymentMethodsForAccount(accountId)
  if (allPaymentMethods) {
    const results = allPaymentMethods.map(item => Slinky.unslink(item, '__'))
    return res.status(200).json(APIResponse.success(results))
  }
  return res.status(200).json(APIResponse.success(null))
}

export const handleUpdatePaymentMethod = async (req, res) => {
  if(!req.user || !req.user.platformAccountId) return res.json(APIResponse.failure('Must be logged in.'))

  if (!req.body.methodId) return res.json(APIResponse.failure('methodId must be supplied'))
  if (!req.body.action) return res.json(APIResponse.failure('Action parameter must be specified'))

  const accountId = req.user.platformAccountId
  const methodId = req.body.methodId
  const action = req.body.action

  // TODO: replace with enum
  if (action === 'setDefault') {
    await PaymentsService.unsetDefaultsForAccountId(accountId)
    await PaymentsService.setDefaultPaymentMethodForAccountId(methodId, accountId)
  }

  return res.json(APIResponse.success([]))
}

export const handlePaymentSettingsUpdate = async (req, res) => {
  if (!req.user || !req.user.platformAccountId) return res.json(APIResponse.failure('Must be logged in.'))
  if (!req.body || req.body.length < 1) return res.json(APIResponse.failure('No settings updates found.'))
  if(!req.params.customerId) return res.json(APIResponse.failure('Must provide a customer ID.'))

  const accountId = req.params.customerId
  const settings = req.body

  for (const setting of settings) {
    const existingSetting = await PaymentsService.getPaymentSettingsByKey(setting.setting_key, accountId)

    if (existingSetting) 
      await PaymentsService.updatePaymentSettings(setting, accountId)
    
    else 
      await PaymentsService.createPaymentSetting(accountId, setting.setting_key, setting.setting_value)
    
  }
  return res.json(APIResponse.success([]))
}

export const handleGetPaymentsSetting = async (req, res) => {
  if (!req.user || !req.user.platformAccountId) return res.json(APIResponse.failure('Must be logged in.'))
  if(!req.params.customerId) return res.json(APIResponse.failure('Must provide a customer ID.'))

  const accountId = req.params.customerId

  if (!req.query.setting_key) return res.json(APIResponse.failure('No settings specified.'))

  const result = await PaymentsService.getPaymentSettingsByKey(req.query.setting_key, accountId)

  if (!result) {
    if (req.query.setting_key === 'TOPUP_THRESHOLD') {
      const value = '20.00'
      return res.json(APIResponse.success([{ key: req.query.setting_key, value: value }]))
    }

    if (req.query.setting_key === 'TOPUP_RECHARGE_AMT') {
      const value = '100.00'
      return res.json(APIResponse.success([{ key: req.query.setting_key, value: value }]))
    }

    return res.json(APIResponse.success([]))
  }

  return res.json(APIResponse.success({ key: result[0].setting_key, value: result[0].setting_value }))
}

export default {
  handleSetupIntentCreate,
  handlePaymentMethodCreate,
  handleDeletePaymentMethod,
  handleListPaymentMethods,
  handleUpdatePaymentMethod,
  handlePaymentSettingsUpdate,
  handleGetPaymentsSetting,
}
