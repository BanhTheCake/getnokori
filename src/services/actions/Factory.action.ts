import ActionRunner from './Runner.action'
import { stat } from 'fs'
class ActionFactory {

  constructor(){}

  // TODO: update decision service to pass an object to create. Then pass onward to action.default
  // It should include the outcome of the decision.
  static async create(path: string, params: object) {
    const filepath = `./${path}.action.ts`
    const action = await import(filepath)
    const runner = new ActionRunner(new action.default({ params }))
    return runner
  }
}

export default ActionFactory
