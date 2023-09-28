import { Router } from 'express'

import accountRoutes from './accounts'
import authRoutes from './auth'
import billingRoutes from './billing'
import classifiersRoutes from './classifiers'
import dashboardRoutes from './dashboard'
import embeddings from './embeddings'
import feedbackRoutes from './feedback'
import frequenciesRoutes from './frequencies'
import generateRoutes from './ai/generate'
import hubsRoutes from './hubs'
import mailRoutes from './mail'
import paymentsRoutes from './payments'
import queriesRoutes from './queries'
import sourcesRoutes from './sources'
import summarizeRoutes from './ai/summarize'
import triggersRoutes from './triggers'
import vectorRoutes from './vectors'

const router = Router()

router.use('/v1/accounts', accountRoutes)
router.use('/v1/auth', authRoutes)
router.use('/v1/billing', billingRoutes)
router.use('/v1/classifiers', classifiersRoutes)
router.use('/v1/dashboard', dashboardRoutes)
router.use('/v1/embeddings', embeddings)
router.use('/v1/feedback', feedbackRoutes)
router.use('/v1/frequencies', frequenciesRoutes)
router.use('/v1/hubs', hubsRoutes)
router.use('/v1/mail', mailRoutes)
router.use('/v1/payments', paymentsRoutes)
router.use('/v1/queries', queriesRoutes)
router.use('/v1/sources', sourcesRoutes)
router.use('/v1/triggers', triggersRoutes)
router.use('/v1/vectors', vectorRoutes)
router.use('/v1/ai/generate', generateRoutes)
router.use('/v1/ai/summarize', summarizeRoutes)

export default router
