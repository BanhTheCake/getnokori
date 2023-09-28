import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import request from 'supertest'
import app from '@/app'

const APIKey = 'lola_pk_test_TAKPkYzqUdhu3gg-weJe0P2hm8Jcg2RPXXkg'
let Token = ''

beforeAll(async () => {
  const response = await request(app)
    .post('/v1/auth/login')
    .set({ 'x-nokori-api-key': APIKey })
    .send({
      strategy: 'password',
      email: 'wes+2788@nokori.com',
      password: '9j4f19j3d3d9j3d9',
    })
  Token = response.body.data.session.accessToken
})

describe('Post Endpoints', () => {
  it('should get billing plans', async () => {
    const response = await request(app)
      .get('/v1/billing/plans')
      .set({
        'x-nokori-api-key': APIKey,
        'Authorization': `Bearer ${Token}`,
      })
      
    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeTruthy()
    expect(response.body.data instanceof Array).toBeTruthy()
    expect(response.body.data.length).toBeGreaterThan(1)
    
  })
  
})

// const res = await request(app)
//       .post('/v1/plans')
//       .send({
//         userId: 1,
//         title: 'test is cool',
//       })

/**
 const URL = `My Endpoint`;
const TOKEN = 'Secret';

const hook = (method = 'post') => (args) =>
  supertest(URL)
    [method](args)
    .set('Authorization', `Basic ${TOKEN}`);

const request = {
  post: hook('post'),
  get: hook('get'),
  put: hook('put'),
  delete: hook('delete'),
};

export default request;
 */
