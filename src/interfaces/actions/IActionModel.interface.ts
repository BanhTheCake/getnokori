enum ActionType {
  SYSTEM = 'system',
  USER = 'user'
}

interface IActionModel {
  actionId?: string
  name?: string
  type: ActionType
  path: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export default IActionModel
export { IActionModel, ActionType }
