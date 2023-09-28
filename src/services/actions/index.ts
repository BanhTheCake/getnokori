import ActionsRepo from '@/repositories/actions'
import type IActionModel from '@/interfaces/actions/IActionModel.interface'
import { actionId } from '@/utils/ids' 
import ActionsFactory from './Factory.action'

/**
 * TODO: Extend to support user actions. This really doesn't provide value. Right now, we're going to manually create most of these. This would just create an ID, which I guess is useful.
 */
const create = async (action: Pick<IActionModel, 'type' | 'path'>): Promise<boolish> => {
  const actionID = await actionId()
  const actionToCreate = { ...action, actionId: actionID }
  const result = await ActionsRepo.create(actionToCreate)
  return result ? true : null
}

const getActionById = async (actionId: IActionModel['actionId']): 
Promise<IActionModel | null> => {
  return await ActionsRepo.getActionById(actionId)
}

// TODO: params types need to be specific to possible actions.
const run = async (actionId: IActionModel['actionId'], params: any): Promise<void> => {
  const action = await getActionById(actionId)
  if (!action) return

  const ActionsRunnerInstance = await ActionsFactory.create(action.path, params)
  ActionsRunnerInstance.run()
}

export default {
  create,
  getActionById,
  run,
}
