import addon from '@/bindings/vectors/cosine_similarity.cjs'
import type { RollingAverageResult } from '@/types/vectors/VectorService.types'
import VectorDistanceMeasures from '@/enums/vectors/DistanceMeasures.enum'
import VectorSimilarityMeasures from '@/enums/vectors/SimilarityMeasures.enum'

export const cosineSimilarity = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    const result: number = await addon.cosineSimilarity(vec1, vec2)
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
  
}

const cosineDistance = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    const similarity: number = await addon.cosineSimilarity(vec1, vec2)
    const result = 1 - similarity
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

const euclideanDistance = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    let sum = 0
    for (let i = 0; i < vec1.length; i++) {
      const diff = vec1[i] - vec2[i]
      sum += diff * diff
    }

    const result = Math.sqrt(sum)
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

const manhattanDistance = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    let sum = 0
    for (let i = 0; i < vec1.length; i++) 
      sum += Math.abs(vec1[i] - vec2[i])

    const result = sum
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

const chebyshevDistance = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    let maxDiff = 0
    for (let i = 0; i < vec1.length; i++) {
      const diff = Math.abs(vec1[i] - vec2[i])
      if (diff > maxDiff) 
        maxDiff = diff
      
    }

    const result = maxDiff
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

const hammingDistance = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    let count = 0
    for (let i = 0; i < vec1.length; i++) {
      if (vec1[i] !== vec2[i]) 
        count++
          
    }
  
    const result = count
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

export const distance = async (vec1: number[], vec2: number[], measure: VectorDistanceMeasures = VectorDistanceMeasures.COSINE): Promise<{value: number | null; error: string | null}> => {
  if (vec1.length !== vec2.length) 
    throw new Error('Vectors must be of the same length')

  switch (measure) {
    case VectorDistanceMeasures.COSINE:
      return cosineDistance(vec1, vec2)
    case VectorDistanceMeasures.EUCLIDEAN:
      return euclideanDistance(vec1, vec2)
    case VectorDistanceMeasures.MANHATTAN:
      return manhattanDistance(vec1, vec2)
    case VectorDistanceMeasures.CHEBYSHEV:
      return chebyshevDistance(vec1, vec2)
    case VectorDistanceMeasures.HAMMING:
      return hammingDistance(vec1, vec2)
    default:
      return cosineDistance(vec1, vec2)
  }
}

const hammingSimilarity = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    const distance = await hammingDistance(vec1, vec2)
    if(distance.error)
      return { value: null, error: distance.error }
    
    if(!distance.value)
      throw new Error('Hamming Distance could not be computed')

    const result = 1 - (distance.value / vec1.length)
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

const euclideanSimilarity = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    const distance = await euclideanDistance(vec1, vec2)
    if(distance.error)
      return { value: null, error: distance.error }
    
    if(!distance.value)
      throw new Error('Euclidean Distance could not be computed')

    const result = 1 / (1 + distance.value)
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

const jaccardSimilarity = async (vec1: any[], vec2: any[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    const intersection = vec1.filter(value => vec2.includes(value))
    const union = [...new Set([...vec1, ...vec2])]
    const result = intersection.length / union.length
    return { value: result, error: null }
  }
  catch (error) {
    logger.error('Vectors must be of the same length')
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

const mean = (vec: number[]): number => {
  return vec.reduce((sum, val) => sum + val, 0) / vec.length
}

const pearsonCorrelationCoefficient = async (vec1: number[], vec2: number[]): Promise<{value: number | null; error: string | null}> => {
  try {
    if (vec1.length !== vec2.length) 
      throw new Error('Vectors must be of the same length')

    const meanVec1 = mean(vec1)
    const meanVec2 = mean(vec2)
  
    let numerator = 0
    let denominator1 = 0
    let denominator2 = 0
  
    for (let i = 0; i < vec1.length; i++) {
      const term1 = vec1[i] - meanVec1
      const term2 = vec2[i] - meanVec2
  
      numerator += term1 * term2
      denominator1 += term1 * term1
      denominator2 += term2 * term2
    }
  
    if (denominator1 === 0 || denominator2 === 0) 
      throw new Error('Denominator is zero, correlation is undefined')
  
    const result = numerator / (Math.sqrt(denominator1) * Math.sqrt(denominator2))
    return { value: result, error: null }
  }
  catch (error) {
    logger.error(error)
    return { value: null, error: 'Vectors must be of the same length' }
  }
}

export const similarity = async (vec1: number[], vec2: number[], measure: VectorSimilarityMeasures = VectorSimilarityMeasures.COSINE): Promise<{value: number | null; error: string | null}> => {
  switch (measure) {
    case VectorSimilarityMeasures.COSINE:
      return cosineSimilarity(vec1, vec2)
    case VectorSimilarityMeasures.JACCARD:
      return jaccardSimilarity(vec1, vec2)
    case VectorSimilarityMeasures.PEARSON:
      return pearsonCorrelationCoefficient(vec1, vec2)
    case VectorSimilarityMeasures.HAMMING:
      return hammingSimilarity(vec1, vec2)
    case VectorSimilarityMeasures.EUCLIDEAN:
      return euclideanSimilarity(vec1, vec2)
    default:
      return cosineSimilarity(vec1, vec2)
  }
}

export const vectorSum = async (vectors: number[][]): Promise<number[] | null> => {
  if (vectors.length === 0) 
    return null
  
  const vectorLength = vectors[0].length
  for (const vector of vectors) {
    if (vector.length !== vectorLength) 
      return null
    
  }

  const sums = new Array(vectorLength).fill(0)
  
  for (const vector of vectors) {
    for (let i = 0; i < vectorLength; i++) 
      sums[i] += vector[i]
    
  }

  return sums
}

export const vectorAverage = async (vectors: number[][]): Promise<number[] | null> => {
  if (vectors.length === 0) 
    return null
  
  const vectorLength = vectors[0].length
  for (const vector of vectors) {
    if (vector.length !== vectorLength) 
      return null
    
  }

  const sums = await vectorSum(vectors)
  if (!sums)
    return null

  const averages = sums.map(sum => sum / vectors.length)
  return averages
}

export const rollingAverage = async (sumVector: number[], newVector: number[], observations: number): Promise<RollingAverageResult | null> => {
  if(sumVector.length !== newVector.length)
    throw new Error('Vectors must be of the same length')

  if(observations < 1 ) 
    throw new Error('Events must be greater than 0')

  const vectorSum = sumVector.map((sum, i) => (sum + newVector[i]))
  const average = vectorSum.map(sum => sum / observations)

  return {
    sumVector: vectorSum,
    centroid: average,
  }
}

export interface MyObject {
  [key: string]: number[]
}

export const findMostSimilarObject = async (
  embedding: number[],
  arr: any,
  propName: string,
): Promise<{ object: any | null; similarity?: number; error: string | null }> => {
  let maxSimilarity = -Infinity
  let mostSimilarObject: MyObject | null = null

  for (const obj of arr) {
    const vec = obj[propName]
    if (!Array.isArray(vec)) 
      return { object: null, error: 'Invalid object property. Must be an array of numbers.' }

    const { value, error } = await cosineSimilarity(embedding, vec)
    if (error) 
      return { object: null, error }

    if (value !== null && value > maxSimilarity) {
      maxSimilarity = value
      mostSimilarObject = obj
    }
  }

  return { object: mostSimilarObject, similarity: maxSimilarity, error: null }
}

export const orderObjectsBySimilarity = async (
  embedding: number[],
  arr: any,
  propName: string,
): Promise<{ objects: any[] | null; error: string | null }> => {
  const objectSimilarities: { queryId: any; label: string; confidence: number }[] = []

  for (const obj of arr) {
    const vec = obj[propName]
    if (!Array.isArray(vec)) 
      return { objects: null, error: 'Invalid object property. Must be an array of numbers.' }

    const { value, error } = await cosineSimilarity(embedding, vec)
    if (error) 
      return { objects: null, error }

    if (value !== null) 
      objectSimilarities.push({ queryId: obj.queryId, label: obj.label, confidence: +value.toFixed(2) })
    
  }
    
  objectSimilarities.sort((a, b) => b.confidence - a.confidence)
  return { objects: objectSimilarities, error: null }
}

export default {
  cosineSimilarity,
  vectorAverage,
  rollingAverage,
}
