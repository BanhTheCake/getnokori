declare module 'cosine_similarity_module' {
  export function cosineSimilarity(vec1: number[], vec2: number[]): number
  export function findClosestVector(target: number[], vectors: number[][]): { index: number; score: number }
}
