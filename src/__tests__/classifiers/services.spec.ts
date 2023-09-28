import ServerEnvironments from '@/enums/ServerEnvs.enum'
process.env.TZ = process.env.TZ || 'America/Chicago'
process.env.NODE_ENV = process.env.NODE_ENV || ServerEnvironments.DEV
import jestSettings from '@/__tests__/jest.settings.json'
import { classifierClassId, classifierId } from '@/utils/ids'

describe('Classifiers - Services', () => {
  it('should create a classifier Id', async () => {
    const id = classifierId()

    expect(id.length).toBe(27)
    expect(id).toMatch(/nk.clfr.[A-Za-z0-9-]{19}/)
  })

  it('should create a class Id', async () => {
    const id = classifierClassId()

    expect(id.length).toBe(27)
    expect(id).toMatch(/nk.clfc.[A-Za-z0-9-]{19}/)
  })

})
