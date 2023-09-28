import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'UTC'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV

import 'dotenv/config'

import FrequencyBuffer from '@/services/frequencies/FrequencyBuffer.class'
FrequencyBuffer.init({ flushIntervalSeconds: 5 })

import 'reflect-metadata'
import Authorizer from '@/middleware/authorization'
import clientIp from '@/middleware/clientIp'
import initLogger from './utils/logger'
import type { NextFunction, Request, Response } from 'express'
import { failure } from '@/utils/apiResponse'
import os from 'os'
import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import router from './routes/index'
import compression from 'compression'
import FrequenciesMiddleware from '@/middleware/frequencies'

process.env.NODE_HOSTNAME = os.hostname()

const app = express()
const globalVars: any = global

globalVars.logger = initLogger()

logger.info('Starting...')

app.disable('x-powered-by')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(clientIp)

app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

app.get('/ping', (req, res, next) => {
  res.status(200).send('pong')
  next()
})

app.use(Authorizer())

// Set property JSON headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'Application/JSON')
  next()
})

// setup simple request logger for dev
// if (process.env.NODE_ENV === ServerEnvironments.DEV) {
//   app.use(function (req, res, next) {
//     logger.info(`${req.method} => ${req.path}`)
//     next()
//   })
// }

app.use(function (req, res, next) {
  logger.info(`${req.method} => ${req.path}`)
  next()
})

app.use(compression())
  
app.use(router)

app.use((err, req, res, next) => {
  logger.error('API Request Error', { error: err })
  res.status(500).json(failure('API Request Error', { ...err }))
  next()
})

export default app
