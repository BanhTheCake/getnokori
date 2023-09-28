export interface ClassifierRow {
  classifierId: string
  accountId?: string
  name?: string | null
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ClassifierClassContext {
  sumVector: number[]
  centroid: number[]
}

export interface ClassifierClassRow {
  classId: string
  classifierId: ClassifierRow['classifierId']
  accountId: string
  label: any
  observations: number
  context: string | ClassifierClassContext
  createdAt?: string
  updatedAt?: string
}

export interface ClassifierHistoryRow{
  accountId: string
  classifierId: ClassifierRow['classifierId']
  content: string
  createdAt?: string
  updatedAt?: string
}
