import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import 'dotenv/config'
import request from 'supertest'
import app from '@/app'

import AuthService from '@/services/auth/auth.service'
import nkHTTPHeaders from '@/enums/http/headers.enum'

const APIKey = 'lola_pk_test_TAKPkYzqUdhu3gg-weJe0P2hm8Jcg2RPXXkg'
const int = Math.floor(Math.random() * 10000)
const email = `testuser+${int}@nokori.com`
let verifyRequestToken = ''
let sessionToken = ''

describe('POST /auth/signup', () => {
  it('should successfully register a new user', async () => {
    const res = await request(app)
      .post('/v1/auth/signup')
      .set({ 'x-nokori-api-key': APIKey })
      .send({
        email,
        password: 'testpassword',
        firstName: 'Test',
        lastName: 'User',
      })

    expect(res.body.data).toHaveProperty('created')
    expect(res.body.data.created).toBe(true)
    
    expect(res.body.data).toHaveProperty('verifyRequestToken')
    expect(res.body.data.verifyRequestToken).toBeTruthy()

    verifyRequestToken = res.body.data.verifyRequestToken
  })

  // it('should successfully find a new user with their verifyRequestToken', async () => {
  //   expect.assertions(1)
  //   const user = await AuthService.getUserByVerifyRequestToken(verifyRequestToken)
  //   if(!user || ! user.verifyToken) throw new Error('user.verifyToken is undefined')

  //   expect(user).toBeTruthy()

  //   verifyToken = user.verifyToken
  // })

  // it('should successfully verify a new user', async () => {
  //   const res = await request(app)
  //     .get(`/v1/auth/verify/${verifyToken}`)
  //     .set({ 'x-nokori-api-key': APIKey })

  //   expect(res.statusCode).toBe(200)
  // })

  it('should successfully login a new user', async () => {
    const response = await request(app)
      .post('/v1/auth/login')
      .set({ 'x-nokori-api-key': APIKey })
      .send({
        strategy: 'password',
        email: email,
        password: 'testpassword',
      })

    sessionToken = response.body.data.session.accessToken
  })

  it('should successfully get a new user api key', async () => {
    const res = await request(app)
      .get('/v1/auth/api-keys')
      .set({ 'x-nokori-api-key': APIKey,
        'Authorization': `Bearer ${sessionToken}` })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('publicKey')
    expect(res.body.data.publicKey).toBeTruthy()
  })
})
