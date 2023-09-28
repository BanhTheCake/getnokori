import ActionFactory from '@/services/actions/Factory.action'
import ExecuteQuery from '@/services/actions/queries/ExecuteQuery.action'

const ExecuteQueryRunMock = jest
  .spyOn(ExecuteQuery.prototype, 'run')

describe('Actions - Factory', () => {

  it('should create an action', async () => {
    const path = 'queries/ExecuteQuery'
    const params = { foo: 'bar' }
  
    const result = await ActionFactory.create(path, params)
    expect(result).toBeTruthy()
  })

  it('should run an action', async () => {
    const path = 'queries/ExecuteQuery'
    const params = { foo: 'bar' }
  
    const action = await ActionFactory.create(path, params)
    action.run()
    expect(ExecuteQueryRunMock).toHaveBeenCalledTimes(1)
  })
  
})
