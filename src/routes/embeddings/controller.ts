import APIResponse from '@/utils/apiResponse'
import type { NextFunction, Request, Response } from 'express'
import EmbeddingsService from '@/services/embeddings/Embeddings.service'
import { BaseMetrics, MetricsLevel2, MetricsLevel3 } from '@/enums/frequencies/FrequencyMetrics.enums'
import FrequenciesService from '@/services/frequencies/index'

const handleGetEmbedding = async (req: Request, res: Response) => {

  const text = req.body.text
  const platformAccountId = req.user.platformAccountId
  
  const embedding = await EmbeddingsService.createEmbedding(text)
  if(!embedding)
    return res.status(500).json(APIResponse.failure('Error creating embedding'))

  const response = {
    units: text.split(' ').length,
    embedding: embedding,
  }
  
  res.status(200).json(APIResponse.success(response))

  FrequenciesService.increment(platformAccountId, `${BaseMetrics.USAGE}.${MetricsLevel2.EMBEDDINGS}.${MetricsLevel3.UNITS}`, text.split(' ').length || 1)
  FrequenciesService.increment(platformAccountId, `${BaseMetrics.USAGE}.${MetricsLevel2.EMBEDDINGS}.${MetricsLevel3.REQUESTS}`, text.split(' ').length || 1)
}

export default {
  handleGetEmbedding,
}
