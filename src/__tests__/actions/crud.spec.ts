import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import request from 'supertest'
import app from '@/app'

import ActionsService from '@/services/actions'
import { ActionType } from '@/interfaces/actions/IActionModel.interface'
import type{ IActionModel } from '@/interfaces/actions/IActionModel.interface'

const APIKey = 'lola_pk_test_TAKPkYzqUdhu3gg-weJe0P2hm8Jcg2RPXXkg'
let Token: string

/**
 * NOTE: this is purely a utility route for us. It's not part of the API. 
 * Its a way for us to create an action with a globally unique ID.
 */

beforeAll(async () => {
  const response = await request(app)
    .post('/v1/auth/login')
    .set({ 'x-nokori-api-key': APIKey })
    .send({
      strategy: 'password',
      email: 'wes+test1@nokori.com',
      password: 'ardvark123',
    })
  Token = response.body.data.session.accessToken
})

describe('Actions - CRUD', () => {
  it('should create an action', async () => {
    const action: IActionModel = {
      name: 'execute query',
      type: ActionType.SYSTEM,
      path: 'queries/ExecuteQuery',
    }
    const result = await ActionsService.create(action)
    expect(result).toBeTruthy()
  })
})
