import type { Request, Response } from 'express'
import TriggersService from '@/services/triggers'
import { failure, success } from '@/utils/apiResponse'
import type { IBaseTrigger } from '@/interfaces/triggers/IBaseTrigger.interface'

const handleCreateTrigger = async (req: Request, res: Response) => {

  const triggerToCreate = {
    ...req.body,
    accountId: req.user.platformAccountId,
  } as IBaseTrigger

  const result = await TriggersService.createTrigger(triggerToCreate)
  if (!result) 
    return res.status(500).json(failure('Unable to create trigger'))

  return res.status(200).json(success(result))
}

const handleDeleteTrigger = async (req: Request, res: Response) => {

  const accountId = req.user.platformAccountId
  const triggerId = req?.params?.triggerId

  const didDeleteTrigger = await TriggersService.deleteTrigger(accountId, triggerId)
  if(!didDeleteTrigger)
    return res.status(500).json(failure('Unable to delete trigger'))

  return res.status(200).json(success({}))
}

export default {
  handleCreateTrigger,
  handleDeleteTrigger,
}
