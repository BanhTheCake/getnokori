import Stripe from 'stripe'
import type CardCreateParams from 'stripe'
import PaymentsMethodsRepo from '@/repositories/payments/methods.repo'
import PaymentsSettingsRepo from '@/repositories/payments/settings.repo'
import PaymentSettings from '@/enums/billing/paymentSettings.enum'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

const createAccount = async (account) => {
  const createdAccount = await stripe.accounts.create(account)

  return createdAccount
}

const updateAccount = async (stripeAccountId, account) => {
  const updatedAccount = await stripe.accounts.update(stripeAccountId, account)

  return updatedAccount
}

const getAccounts = async (limit = 100) => {
  const accounts = await stripe.accounts.list({
    limit,
  })

  return accounts
}

const createPerson = async (stripeAccountId, person) => {
  const createdPerson = await stripe.accounts.createPerson(stripeAccountId, person)

  return createdPerson
}

const updatePerson = async (stripeAccountId, personId, person) => {
  const params = {
    ...person,
  }

  const updatedAccount = await stripe.accounts.updatePerson(stripeAccountId, personId, params)

  return updatedAccount
}

const createCardholder = async (stripeAccountId, cardholder) => {
  const params = {
    ...cardholder,
  }

  const createdCardHolder = await stripe.issuing.cardholders.create(params, {
    stripeAccount: stripeAccountId,
  })

  return createdCardHolder
}

const updateCardHolder = async (stripeAccountId, cardholderId, cardholder) => {
  const params = {
    ...cardholder,
  }

  const updatedCardholder = await stripe.issuing.cardholders.update(cardholderId, params, {
    stripeAccount: stripeAccountId,
  })

  return updatedCardholder
}

const getCardholders = async (stripeAccountId) => {
  const cardholders = await stripe.issuing.cardholders.list(
    {},
    {
      stripeAccount: stripeAccountId,
    },
  )

  return cardholders.data
}

const getTransactions = async (stripeAccountId) => {
  const params = {
    // created: {
    //   gte: 1601510400000,
    // },
    // card: '',
    // cardholder: '',
  }

  const response = await stripe.issuing.transactions.list(params, {
    stripeAccount: stripeAccountId,
  })

  return response
}

const getTransactionById = async (stripeAccountId, transactionId) => {
  const transaction = await stripe.issuing.transactions.retrieve(transactionId, {
    stripeAccount: stripeAccountId,
  })

  return transaction
}

const getAuthorizations = async (stripeAccountId) => {
  const params = {}

  const response = await stripe.issuing.authorizations.list(params, {
    stripeAccount: stripeAccountId,
  })

  return response
}

const getAuthorizationById = async (stripeAccountId, authorizationId) => {
  const authorization = await stripe.issuing.authorizations.retrieve(authorizationId, {
    stripeAccount: stripeAccountId,
  })

  return authorization
}

// const createCard = async (stripeAccountId, cardholderId, type) => {
//   const params: CardCreateParams = {
//     currency: 'USD',
//     type,
//     cardholder: cardholderId,
//     status: 'active',
//   }

//   const card = await stripe.issuing.cards.create(params, {
//     stripeAccount: stripeAccountId,
//   })

//   return card
// }

const createOffSessionPaymentIntent = async (accountId, amount) => {
  const stripeCustomerId = await PaymentsSettingsRepo.getPaymentSettingsByKey(PaymentSettings.STRIPE_CUSTOMER_ID, accountId)
  const paymentMethod = await PaymentsMethodsRepo.getDefaultPaymentMethod(accountId)

  const paymentAmount = (Math.round(amount * 100) / 100).toFixed(2)
  const formattedAmount = paymentAmount.replace('.', '')
  console.log(stripeCustomerId, paymentMethod, paymentAmount, formattedAmount)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: +formattedAmount,
      currency: 'usd',
      customer: stripeCustomerId.settingValue,
      payment_method: paymentMethod.providerMethodId,
      off_session: true,
      confirm: true,
    })

    return { transactionId: paymentIntent.id, details: paymentIntent }
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

const getCards = async (stripeAccountId, cardholderId) => {
  const params = {
    cardholder: cardholderId,
  }

  const cards = await stripe.issuing.cards.list(params, {
    stripeAccount: stripeAccountId,
  })

  return cards.data
}

const getCardById = async (stripeAccountId, cardId) => {
  const card = await stripe.issuing.cards.retrieve(
    cardId,
    {
      expand: ['number', 'cvc'],
    },
    {
      stripeAccount: stripeAccountId,
    },
  )

  return card
}

const getIssuingBalance = async (stripeAccountId) => {
  const params = {}
  const balance = await stripe.balance.retrieve(params, {
    stripeAccount: stripeAccountId,
  })

  return balance.issuing
}

const getTopUps = async (stripeAccountId) => {
  const topups = await stripe.topups.list(
    {
      limit: 100,
    },
    {
      stripeAccount: stripeAccountId,
    },
  )

  return topups.data
}

const createTopUp = async (stripeAccountId, source, amount) => {
  const params = {
    currency: 'USD',
    amount,
    source,
    destination_balance: 'issuing',
  }

  const card = await stripe.topups.create(params, {
    stripeAccount: stripeAccountId,
  })

  return card
}

const createBankAccountFromToken = async (stripeAccountId, bankAccountToken) => {
  const bankAccount = await stripe.accounts.createExternalAccount(stripeAccountId, {
    external_account: bankAccountToken,
  })

  return bankAccount
}

const getBankAccounts = async (stripeAccountId) => {
  const params = { limit: 100 }

  const bankAccounts = await stripe.accounts.listExternalAccounts(stripeAccountId, params)

  return bankAccounts.data
}

const getBankAccountById = async (stripeAccountId, bankAccountId) => {
  const bankAccount = await stripe.accounts.retrieveExternalAccount(stripeAccountId, bankAccountId)

  return bankAccount
}

const deleteBankAccount = async (stripeAccountId, bankAccountId) => {
  const bankAccount = await stripe.accounts.deleteExternalAccount(stripeAccountId, bankAccountId)

  return bankAccount
}

const makeDefaultBankAccount = async (stripeAccountId, bankAccountId) => {
  const params = {
    default_for_currency: true,
  }

  const bankAccount = await stripe.accounts.updateExternalAccount(stripeAccountId, bankAccountId, params)

  return bankAccount
}

const uploadFile = async (file, fileName, purpose = 'identity_document') => {
  const params = {
    purpose,
    file: {
      data: file,
      name: fileName,
      type: 'application/octet-stream',
    },
  }

  const uploadedFile = await stripe.files.create(params)

  return uploadedFile
}

export default {
  createAccount,
  createBankAccountFromToken,
  // createCard,
  createCardholder,
  createOffSessionPaymentIntent,
  createPerson,
  createTopUp,
  deleteBankAccount,
  getAccounts,
  getAuthorizationById,
  getAuthorizations,
  getBankAccountById,
  getBankAccounts,
  getCardById,
  getCardholders,
  getCards,
  getIssuingBalance,
  getTopUps,
  getTransactionById,
  getTransactions,
  makeDefaultBankAccount,
  updateAccount,
  updateCardHolder,
  updatePerson,
  uploadFile,
}
