interface HubsRepo {
  hubId: string
  accountId: string
  label: string | null
  createdAt?: string
  updatedAt?: string
  archived?: boolean
}

export default HubsRepo
