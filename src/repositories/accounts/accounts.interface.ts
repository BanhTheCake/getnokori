interface Accounts {
  accountId: string
  platformAccountId: string
  accountName: string
  createdAt: string
  updatedAt: string
  updatedBy?: string
  active: number
  confirmed: number
}

export default Accounts
