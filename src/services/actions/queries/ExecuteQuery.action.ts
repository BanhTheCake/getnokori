import type IAction from '@/interfaces/actions/IAction.interface'
import QueryService from '@/services/queries'

class ExecuteQuery implements IAction {
  private params: any
  private query: any // TODO: Fix Type

  constructor(params: any = null){
    this.params = params
  }

  private async loadQuery(): Promise<boolean> {
    this.query = await QueryService.getQueryById(
      this.params.params.trigger.accountId, 
      this.params.params.trigger.config.queryId,
    )
    
    if(this.query)
      this.query.config.context = this.params.params.context
    
    return !!this.query
  }

  async run(): Promise<void> {
    await this.loadQuery()
    const didExecute = await QueryService.execute(this.params.params.trigger.accountId, this.query.config)
  }

}

export default ExecuteQuery
