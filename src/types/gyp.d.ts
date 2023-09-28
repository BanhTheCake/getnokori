declare module '*.cjs' {
  const addon: {
    cosineSimilarity(vec1: number[], vec2: number[]): number
  }
  export default addon
}
