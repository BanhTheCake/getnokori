import { inject, injectable } from 'inversify'

import type IAction from '@/interfaces/actions/IAction.interface'

// @injectable()
class ActionsRunner {
  private action: IAction

  constructor(action: IAction) {
    this.action = action
  }

  public run(params: any = null) {
    this.action.run(params)
  }
}

export default ActionsRunner
