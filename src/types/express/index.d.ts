// src/types/express/index.d.ts

import type { RequestUser } from '@/types/api/requestUser.interface'
import type { Request } from 'express'

// to make the file a module and avoid the TypeScript error
export {}

declare global {
  namespace Express {
    export interface Request {
      user: RequestUser
    }
  }
}
