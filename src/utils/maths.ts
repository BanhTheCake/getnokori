export function round(n: number, p: number) {
  const n1 = n * Math.pow(10, p + 1)
  const n2 = Math.floor(n1 / 10)
  if (n1 >= (n2 * 10 + 5)) 
    return (n2 + 1) / Math.pow(10, p)
  
  return n2 / Math.pow(10, p)
}

export default {
  round,
}
