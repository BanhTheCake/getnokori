import AccountsRepo from '@/repositories/accounts/accounts.repo'

const createAccount = async (platformAccountId: string, accountId: string) => {
  return await AccountsRepo.createAccount(platformAccountId, accountId)
}

const deleteAccount = async (accountId: string) => {
  return await AccountsRepo.deleteAccount(accountId)
}

const getAccountByInviteToken = async (inviteToken) => {
  return await AccountsRepo.getAccountByInviteToken(inviteToken)
}

const verifyAccount = async (accountId) => {
  return await AccountsRepo.verifyAccount(accountId)
}

const getActiveAccounts = async () => {
  return await AccountsRepo.getActiveAccounts()
}

export default {
  createAccount,
  deleteAccount,
  getAccountByInviteToken,
  verifyAccount,
  getActiveAccounts,
}
