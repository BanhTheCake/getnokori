/**
{
  id: '',
  type: 'query_executed', 
  requiredParams: [],
  firesOn: 'all', // or 'all' or 'some'
  action: '{{actionId}}', // enum 
  actionType: 'system | user'
}

// possible actions
- Run Query
- Post message to Flux
- Run 
 */

enum TriggerType {
  ALL = 'all',
  ON_QUERY_SUCCESS = 'onQuerySuccess',
  ON_QUERY_FAILURE = 'onQueryFailure',
}

interface IBaseTrigger {
  triggerId?: string
  accountId: string
  objectId: string
  name: string
  type: TriggerType
  actionId: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
  config: string // eventually typed for each action type?
}

export default IBaseTrigger
export { TriggerType, IBaseTrigger }
