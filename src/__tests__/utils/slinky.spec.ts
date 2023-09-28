import Slinky from '@/utils/slinky'

describe('Slinky', () => {

  it('Should flatten an object', () => {
    const object = {
      a: 1,
      b: {
        c: 2,
      },
    }
    const flattened = Slinky.slink(object)
    expect(flattened).toEqual({ a: 1, b__c: 2 })
  })

  it('Should unflatten an object', () => {
    const object = {
      a: 1,
      b__c: 2,
    }
    const unflattened = Slinky.unslink(object)
    expect(unflattened).toEqual({ a: 1, b: { c: 2 } })
  })

})
