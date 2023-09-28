export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) 
    throw new Error('Vectors have different dimensions')

  return a.reduce((sum, value, index) => sum + value * b[index], 0)
}

function magnitude(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) 
    throw new Error('Vectors have different dimensions')

  const dotProd = dotProduct(a, b)
  const magA = magnitude(a)
  const magB = magnitude(b)

  if (magA === 0 || magB === 0) 
    throw new Error('One or both of the vectors have zero magnitude')

  return dotProd / (magA * magB)
}
