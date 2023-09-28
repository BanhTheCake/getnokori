import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'

import request from 'supertest'
import app from '@/app'

const APIKey = jestSettings.API_KEY

import TriggersService from '@/services/triggers'
import type { IBaseTrigger } from '@/interfaces/triggers/IBaseTrigger.interface'
import { TriggerType } from '@/interfaces/triggers/IBaseTrigger.interface'

/**
 * This test covers creating and updating a trigger.
 */
describe('Triggers - CRUD', () => {

  let triggerId: string
  // API Routes
  it('should create a trigger', async () => {

    const triggerToCreate: IBaseTrigger = {
      accountId: jestSettings.ACCOUNT_ID,
      objectId: jestSettings.QUERY_SELECT_NOW,
      name: 'Fire another query',
      type: TriggerType.ON_QUERY_SUCCESS,
      actionId: 'lola.act.p8rBYtJQhP24n8hZWpD',
      config: JSON.stringify({
        queryId: jestSettings.TRIGGERED_QUERY_ID,
      }),
    }

    const response = await request(app)
      .post('/v1/triggers')
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send(triggerToCreate)
    
    expect(response.statusCode).toEqual(200)
    triggerId = response.body.data.triggerId
  })

  // Services
  it('should get a trigger by queryId', async () => {

    const trigger = await TriggersService.getTriggersByObjectId(jestSettings.ACCOUNT_ID, jestSettings.QUERY_SELECT_NOW)

    expect(trigger).toBeDefined()
    expect(trigger).toBeTruthy()
  })
  
  it('should delete a trigger', async () => {

    const response = await request(app)
      .delete(`/v1/triggers/${triggerId}`)
      .set({
        'x-nokori-api-key': APIKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
      .send()

    expect(response.statusCode).toEqual(200)

  })
})
