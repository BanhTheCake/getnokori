import APIResponse from '@/utils/apiResponse'
import PromptTemplates from '@/enums/prompts/PromptTemplates.enum'
import type { PromptGenerationAPIRequestDTO } from '@/types/prompts/PromptGeneration'
import type { NextFunction, Request, Response } from 'express'
import PromptGeneratorService from '@/services/prompts/PromptGenerator.service'
import { buildChatGenerationMessages, getChatGeneration } from '@/services/vendor/openai/OpenAI.service'
import { BaseMetrics, MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'
import FrequenciesService from '@/services/frequencies/index'
import { getBalance } from '@/services/billing/transactions.service'
import AccountSettingsService from '@/services/accounts/accountsSettings.service'
import AccountSettingsEnum from '@/enums/accounts/accountSettings.enum'
import { collapseArrayOfStrings } from '@/utils/strings'

const handleCreateGeneration = async (req: Request, res: Response) => {

  const { prompt, context }: PromptGenerationAPIRequestDTO = req.body
  const platformAccountId = req.user.platformAccountId

  const currentBalance = await getBalance(platformAccountId)
  console.log(currentBalance)
  if(currentBalance){
    let threshold = -10
    const billingThreshold = await AccountSettingsService.getSettingByKey(platformAccountId, AccountSettingsEnum.BILLING_THRESHOLD)
    if(billingThreshold)
      threshold = parseFloat(billingThreshold)

    if(currentBalance <= threshold)
      return res.status(402).json(APIResponse.failure('Insufficient funds', null, 402))
  }

  if(!Array.isArray(context))
    return res.status(400).json(APIResponse.failure('Context must be an array.'))

  if(context.length < 1)
    return res.status(400).json(APIResponse.failure('Context must have at least one item.'))

  const mergedContext = collapseArrayOfStrings(context)
  
  const GeneratedPrompt = PromptGeneratorService.generate(prompt, mergedContext, PromptTemplates.GEN_PROMPT_CONTEXT)
  if(!GeneratedPrompt)
    return res.status(400).json(APIResponse.failure('Invalid prompt'))

  const messages = buildChatGenerationMessages(GeneratedPrompt)
  const chatGenerationResponse = await getChatGeneration(messages)
  if(!chatGenerationResponse?.content)
    return res.status(500).json(APIResponse.failure('Error generating chat'))

  const totalUnits = chatGenerationResponse.promptTokens + chatGenerationResponse.completionTokens

  const cleanedText = `${chatGenerationResponse.content}`.replace(/^[`'"]+|[`'"]+$/g, '')

  res.status(200).json(APIResponse.success({
    generated: cleanedText,
    units: totalUnits,
  }))

  FrequenciesService.increment(platformAccountId, `${BaseMetrics.BILLING}.${MetricsLevel2.GENERATION}.${MetricsLevel3.UNITS}`, totalUnits ?? 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.USAGE}.${MetricsLevel2.GENERATION}.${MetricsLevel3.UNITS}`, totalUnits ?? 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.NK_ANALYTICS}.${MetricsLevel2.GENERATION}.${MetricsLevel3.PROMPT_TOKENS}`, chatGenerationResponse.promptTokens ?? 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.NK_ANALYTICS}.${MetricsLevel2.GENERATION}.${MetricsLevel3.COMPLETION_TOKENS}`, chatGenerationResponse.completionTokens ?? 1)
}

export default {
  handleCreateGeneration,
}
