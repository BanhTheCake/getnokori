import APIResponse from '@/utils/apiResponse'
import type { Request, Response } from 'express'
import PlansService from '@/services/billing/plans.service'
import PlansGroupsService from '@/services/billing/plansGroups.service'
import Slack from '@/services/vendors/slack.vendor.service'
import AccountsService from '@/services/accounts/accounts.service'

export const createPlan = async (req: Request, res: Response) => {
  const accountId = req.user.accountId
  if(!accountId){
    logger.error('No account id found when creating plan.')
    return res.status(500).json(APIResponse.failure('Missing required fields.'))
  }
  const { name, amount, frequency } = req.body

  if(!name || !amount || !frequency) return res.json(APIResponse.failure('Missing required fields.'))

  try {
    const createdPlan = await PlansService.createPlan(accountId, { name, amount, frequency } )
    if(createdPlan)
      return res.json(APIResponse.success(createdPlan))

    return res.json(APIResponse.failure('Failed to create plan.'))
  }
  catch (error) {
    logger.error(error)
    return res.status(200).json(APIResponse.failure('Error creating plan.'))
  }
    
}

export const getPlans = async (req: Request, res: Response) => {
  const accountId = req.user.platformAccountId
  if(!accountId){
    logger.error('No parent account id found during get plans.')
    return res.status(500).json(APIResponse.failure('Missing required fields.'))
  }

  const freq: any | null = req.query.freq || null
  const groupId: any | null = req.query.groupId || null

  if(!groupId){
    const plans = await PlansService.getPlans(accountId, freq)
    return res.status(200).json(APIResponse.success(plans))
  }

  const plans = await PlansGroupsService.getPlansInGroup(accountId, groupId, freq)
  return res.status(200).json(APIResponse.success(plans))
}

export const subscribeAccountToPlan = async (req: Request, res: Response) => {
  const accountId = req.user.accountId
  const platformAccountId = req.user.platformAccountId

  const request = req.body
  const planId = request.planId || null

  if(!planId || !accountId) return res.json(APIResponse.failure('Missing required fields.'))

  const isAccountActive = await AccountsService.verifyAccount(accountId)
  if(!isAccountActive) return res.status(400).json(APIResponse.failure('Account is not active.'))

  try {
    await PlansService.removeSubscription(accountId)
  }
  catch (error) {
    logger.error(error)
    return res.status(500).json(APIResponse.failure('Error subscribing user to plan.'))
  }

  const Plan = await PlansService.getPlanById(platformAccountId, planId)
  
  if (!Plan) {
    logger.error(`Registration failed using planId ${planId}`)
    return res.json(APIResponse.failure('Plan Id not found.'))
  }

  // const freePlans = [
  //   'loladb.bpln.jnSl9waW8ZtwL4T2Uh9',
  //   'loladb.bpln.tcYnOKUrDROAYqKof_Z',
  // ]

  // if(!freePlans.includes(planId)){
  //   const ChargeAmount = await PlansService.calculateCharge(Plan.amount, Plan.frequency)
  //   if(!ChargeAmount) return res.json(APIResponse.failure('Failed to calculate charge amount.'))
  //   if (ChargeAmount < 1) return res.json(APIResponse.failure('Error subscribing user to plan.'))
  // }
  
  // try {
  //   // createOffSessionPaymentIntent
  //   // TODO: add support for payment methods
  //   await PaymentsService.createOffSessionPaymentIntent(accountId, ChargeAmount)
  // }
  // catch (error: any) {
      
  //   logger.error('Error creating off session payment intent', { error })
  //   return res.json(APIResponse.failure('Error subscribing user to plan.'))
  // }

  try {
    await PlansService.addSubscription(accountId, planId)
  }
  catch (error) {
    
    logger.error(error)
    return res.json(APIResponse.failure('Error subscribing user to plan.'))
  }

  // try {
  //   // SLACK_AUD_CAMPAIGNS
  //   await Slack.sendMessage(process.env.SLACK_AUD_CAMPAIGNS, {
  //     text: `${req.user.userId} of ${req.user.accountId} subscribed to ${planId} for ${ChargeAmount} calculated from ${Plan.amount} per ${Plan.frequency}`,
  //   })
  // }
  // catch (error) {
  //   logger.error(error)
  // }

  return res.json(APIResponse.success({ subscribed: true }))
}

const getAccountSubscriptions = async (req: Request, res: Response) => {
  if(!req.user.accountId) return res.json(APIResponse.failure('Account id not provided.'))
  const accountId = req.user.accountId

  const subscriptions = await PlansService.getAccountPlan(accountId)
  if(!subscriptions) return res.status(404).json(APIResponse.failure('No active subscription found.'))

  return res.status(200).json(APIResponse.success(subscriptions))
}

export default {
  createPlan,
  getAccountSubscriptions,
  getPlans,
  subscribeAccountToPlan,
}
