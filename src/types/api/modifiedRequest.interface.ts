import type { Request } from 'express'

type ModifiedRequest = Request & { user: { userId: string; accountId: string }}

export default ModifiedRequest
