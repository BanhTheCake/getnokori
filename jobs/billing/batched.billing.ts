/**
 * Job: Batched Billing
 * 
 * Purpose: To run the billing process for all accounts that have a balance exceeding their billing threshold.
 */

import ServerEnvironments from '../../src/enums/ServerEnvs.enum'

process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import 'dotenv/config'

import AccountsService from '../../src/services/accounts/accounts.service'
import TransactionsService, { addMoney } from '../../src/services/billing/transactions.service'
import AccountSettingsService from '../../src/services/accounts/accountsSettings.service'
import AccountSettingsEnum from '../../src/enums/accounts/accountSettings.enum'
import StripeService from '../../src/services/vendors/stripe.vendor.service'
import initLogger from '../../src/utils/logger'

(async () => {

  const globalVars: any = global
  /** Init global logger */
  globalVars.logger = initLogger()

  console.log('Job started')

  const activeAccounts = await AccountsService.getActiveAccounts()
  if(!activeAccounts)
    return

  for(const account of activeAccounts){
    const balance = await TransactionsService.getBalance(account.accountId)
    if(!balance) continue

    let threshold = 10.00
    if(balance < 0){
      const billingThreshold = await AccountSettingsService.getSettingByKey(account.accountId, AccountSettingsEnum.BILLING_THRESHOLD)
      if(billingThreshold)
        threshold = parseFloat(billingThreshold)

      if(Math.abs(balance) > threshold){
        const hasFailedBillingAttempt = await AccountSettingsService.getSettingByKey(account.accountId, AccountSettingsEnum.ACCOUNT_HAS_FAILED_BILLING)
        if(hasFailedBillingAttempt)
          continue

        const transaction = await StripeService.createOffSessionPaymentIntent(account.accountId, Math.abs(balance))
        /**
         * If true.. credit their account
         * If false.. block their account
         */
        if(transaction?.transactionId){
          await addMoney({
            accountId: account.accountId,
            productId: 'payment',
            amount: Math.abs(balance),
            description: `Payment for balance. Transaction: ${transaction.transactionId}`,
          })
           
          // Remove any block that might be present
          await AccountSettingsService.deleteSetting(account.accountId, AccountSettingsEnum.ACCOUNT_BLOCKED)
          await AccountSettingsService.deleteSetting(account.accountId, AccountSettingsEnum.ACCOUNT_HAS_FAILED_BILLING)
          continue
        }

        if(!transaction){
          // Block their account
          await AccountSettingsService.setSetting(account.accountId, AccountSettingsEnum.ACCOUNT_BLOCKED, 'true')
          await AccountSettingsService.setSetting(account.accountId, AccountSettingsEnum.ACCOUNT_HAS_FAILED_BILLING, 'true')
          continue
        }
      }
      
    }
  }

  process.exit(0)

})()
