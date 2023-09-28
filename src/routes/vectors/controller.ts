import APIResponse from '@/utils/apiResponse'
import type { NextFunction, Request, Response } from 'express'
import EmbeddingsService from '@/services/embeddings/Embeddings.service'
import { distance, similarity } from '@/services/vectors/Vectors.service'
import VectorDistanceMeasures from '@/enums/vectors/DistanceMeasures.enum'

const handleVectorDistance = async (req: Request, res: Response) => {
  if(!req.body.vectors) return res.status(400).json(APIResponse.failure('vectors is required'))

  if(req.body.vectors.length < 2) return res.status(400).json(APIResponse.failure('Multiple vectors are required.')) 

  const vectors = req.body.vectors
  const vec1 = vectors[0]
  const vec2 = vectors[1]
  const distanceMeasure = req.body.measure || VectorDistanceMeasures.COSINE

  if(!Object.values(VectorDistanceMeasures).includes(distanceMeasure))
    return res.status(400).json(APIResponse.failure(`Invalid distance measure. Must be one of ${Object.values(VectorDistanceMeasures)}`))
  
  const { value, error } = await distance(vec1, vec2, distanceMeasure)
  if(error)
    return res.status(400).json(APIResponse.failure(error))
  
  const response = {
    distance: value,
  }

  return res.status(200).json(APIResponse.success(response))
}

const handleVectorSimilarity = async (req: Request, res: Response) => {
  if(!req.body.vectors) return res.status(400).json(APIResponse.failure('vectors is required'))

  if(req.body.vectors.length < 2) return res.status(400).json(APIResponse.failure('Multiple vectors are required.')) 

  const vectors = req.body.vectors
  const vec1 = vectors[0]
  const vec2 = vectors[1]
  const similarityMeasure = req.body.measure || VectorDistanceMeasures.COSINE

  const { value, error } = await similarity(vec1, vec2, similarityMeasure)
  if(error)
    return res.status(400).json(APIResponse.failure(error))
  
  const response = {
    similarity: value,
  }

  return res.status(200).json(APIResponse.success(response))
}

const handleClosestVector = async (req: Request, res: Response) => {

}

export default {
  handleVectorDistance,
  handleVectorSimilarity,
  handleClosestVector,
}
