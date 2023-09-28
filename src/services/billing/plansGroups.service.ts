import PlansGroupsRepo from '@/repositories/billing/plansGroups.repo'

const createPlanGroup = async (args): Promise<true | null> => {
  return await PlansGroupsRepo.createPlanGroup(args)
}

const getPlanGroup = async (accountId, planGroupId): Promise<true | null> => {
  return await PlansGroupsRepo.getPlanGroup(accountId, planGroupId)
}

const getPlansInGroup = async (accountId, planGroupId, frequency): Promise<true | null> => {
  return await PlansGroupsRepo.getPlansInGroup(accountId, planGroupId, frequency)
}

export default {
  createPlanGroup,
  getPlanGroup,
  getPlansInGroup,
}
