import type { Logger } from 'winston'

declare global {
  let logger: Logger
  type boolish = boolean | null
}

export default logger
