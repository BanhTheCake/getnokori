import { Router } from 'express'
import RequestHandlers from './controller'
import AuthMiddleware from '@/middleware/authorization'

const router = Router()

router.post('/', AuthMiddleware({ allowAnonymous: true }), RequestHandlers.handleReceiveFeedback)

export default router
