import os from 'os'
import type { Express } from 'express'
import winston from 'winston'
import chalk from 'chalk'
import dateformat from 'dateformat'
import ServerEnvironments from '../enums/ServerEnvs.enum'

const hostname = os.hostname()
const release = `v${process.env.npm_package_version}`

export default () => {
  /**
   * Instantiates a new Winston logger with the following configs:
   */
  const Logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    defaultMeta: { service: process.env.APP_NAME, hostname, release },
    exitOnError: false, // do not exit on handled exceptions
    transports: [],
  })

  /**
   * Only add the sentry logger in qa and prod
   */
  if (process.env.NODE_ENV !== ServerEnvironments.DEV) {
    /**
     * Add File Transport
     */
    const fileTransportOptions = { filename: '/var/log/api.nokori.com.log' }
    Logger.add(new winston.transports.File(fileTransportOptions))
  }

  /**
   * Dev only config
   */
  if (process.env.NODE_ENV === ServerEnvironments.DEV || process.env.NODE_ENV === ServerEnvironments.TEST) {
    Logger.add(
      new winston.transports.Console({
        level: 'info',
      }),
    )
  }

  return Logger
}
