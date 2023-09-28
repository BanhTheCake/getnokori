
import APIResponse from '@/utils/apiResponse'
import PromptTemplates from '@/enums/prompts/PromptTemplates.enum'
import type { PromptGenerationAPIRequestDTO } from '@/types/prompts/PromptGeneration'
import type { NextFunction, Request, Response } from 'express'
import PromptGeneratorService from '@/services/prompts/PromptGenerator.service'
import { buildSummarizeGenerationMessages, getChatGeneration, getSummarizationGeneration } from '@/services/vendor/openai/OpenAI.service'
import { BaseMetrics, MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'
import FrequenciesService from '@/services/frequencies/index'
import { collapseArrayOfStrings } from '@/utils/strings'

const handleCreateSummarization = async (req: Request, res: Response) => {

  const { context }: PromptGenerationAPIRequestDTO = req.body
  const platformAccountId = req.user.platformAccountId

  if(!Array.isArray(context))
    return res.status(400).json(APIResponse.failure('Context must be an array.'))

  if(context.length < 1)
    return res.status(400).json(APIResponse.failure('Context must have at least one item.'))

  const mergedContext = collapseArrayOfStrings(context)
  
  const GeneratedPrompt = PromptGeneratorService.generate(null, mergedContext, PromptTemplates.GEN_SUMMARIZE)
  if(!GeneratedPrompt)
    return res.status(400).json(APIResponse.failure('Invalid prompt'))

  // const messages = buildSummarizeGenerationMessages(GeneratedPrompt)
  const chatGenerationResponse = await getSummarizationGeneration(GeneratedPrompt)
  if(!chatGenerationResponse?.content)
    return res.status(500).json(APIResponse.failure('Error generating response.'))

  const totalUnits = chatGenerationResponse.promptTokens + chatGenerationResponse.completionTokens

  res.status(200).json(APIResponse.success({
    generated: chatGenerationResponse.content,
    units: totalUnits,
  }))

  FrequenciesService.increment(platformAccountId, `${BaseMetrics.BILLING}.${MetricsLevel2.SUMMARIZE}.${MetricsLevel3.UNITS}`, totalUnits ?? 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.USAGE}.${MetricsLevel2.SUMMARIZE}.${MetricsLevel3.UNITS}`, totalUnits ?? 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.API}.${MetricsLevel2.SUMMARIZE}.${MetricsLevel3.PROMPT_TOKENS}`, chatGenerationResponse.promptTokens ?? 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.API}.${MetricsLevel2.SUMMARIZE}.${MetricsLevel3.COMPLETION_TOKENS}`, chatGenerationResponse.completionTokens ?? 1)
}

export default {
  handleCreateSummarization,
}
