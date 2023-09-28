import TriggersRepo from '@/repositories/triggers'
import type IBaseTrigger from '@/interfaces/triggers/IBaseTrigger.interface'
import { actionId, triggerId } from '@/utils/ids'
import ActionService from '@/services/actions'
import FrequenciesService from '@/services/frequencies'
import { BaseMetrics, MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'

export const createTrigger = async (trigger: IBaseTrigger): Promise<Pick<IBaseTrigger, 'triggerId'> | null> => {
  const newTriggerId = triggerId()
  const triggerToCreate = {
    ...trigger,
    triggerId: newTriggerId,
  }
  
  const result = await TriggersRepo.createTrigger(triggerToCreate)
  if(result){
    return {
      triggerId: newTriggerId,
    }
  }
  return null
}

const deleteTrigger = async (accountId: string, triggerId: IBaseTrigger['triggerId']): Promise<boolish> => {
  return await TriggersRepo.deleteTrigger(accountId, triggerId)
}

const getTriggersByObjectId = async (accountId: string, objectId: string): Promise<IBaseTrigger[] | null> => {
  return await TriggersRepo.getTriggersByObjectId(accountId, objectId)
}

const executeTrigger = async (context: object, trigger: IBaseTrigger): Promise<void> => {
  const actionParams = {
    trigger,
    context,
  }

  try {
    FrequenciesService.increment(trigger.accountId, `${BaseMetrics.API}.${MetricsLevel2.HUBS}.${MetricsLevel3.TRIGGERS}`, 1 )
  }
  catch (error) {
    logger.error('ERROR INCREMENTING TRIGGER METRIC', error)
  }

  await ActionService.run(trigger.actionId, actionParams)
}

export default {
  getTriggersByObjectId,
  createTrigger,
  deleteTrigger,
  executeTrigger,
}
