import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import request from 'supertest'
import app from '@/app'

import TriggersService from '@/services/triggers' 

const executeTriggerSpy = jest.spyOn(TriggersService, 'executeTrigger')

const APIKey = jestSettings.API_KEY

describe('Queries with triggers', () => { 
  it('Should trigger the executeQuery action once', async () => {
    const context = {
      productId: `prd.id.${ Math.floor(100000 + Math.random() * 600000)}`,
    }

    const result = await request(app)
      .post('/v1/queries/execute')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send({
        queryId: jestSettings.QUERY_SELECT_NOW,
        context,
      })

    expect(result.status).toBe(200)
    expect(executeTriggerSpy).toHaveBeenCalled()
  })
})
