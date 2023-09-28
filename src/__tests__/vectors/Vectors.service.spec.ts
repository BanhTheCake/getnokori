import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'
import VectorsService from '@/services/vectors/Vectors.service'

describe('Vectors - Service', () => {
  it('should calculate the average of two unsigned vectors', async () => {
    const vectors = [
      [1, 2, 3],
      [4, 5, 6],
    ]

    const result = await VectorsService.vectorAverage(vectors)
    expect(result).toEqual([2.5, 3.5, 4.5])
  })

  it('should calculate the average of two signed vectors', async () => {
    const vectors = [
      [-1, -2, -3],
      [4, -5, 6],
    ]

    const result = await VectorsService.vectorAverage(vectors)
    expect(result).toEqual([1.5, -3.5, 1.5])
  })

  it('should compute the rolling average of a sum vector and observation vector', async () => {
    const observation = [1, 2, 3]
    const sumVector = [4, 5, 6]
    const observations = 2

    const result = await VectorsService.rollingAverage(sumVector, observation, observations)

    expect(result).toBe( { sumVector: [5, 7, 9], current: [2.5, 3.5, 4.5] } )
  })
})
