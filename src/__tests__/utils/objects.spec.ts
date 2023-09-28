import Objects from '@/utils/objects'
describe('Objects - Reduce', () => {
  it('should return an object', () => {
    const result = Objects.reduce([{ key: 'a', value: 1 }, { key: 'b', value: 2 }, { key: 'c', value: 3 }])
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should throw an error if the argument is not an array', () => {
    expect(() => Objects.reduce({})).toThrowError(TypeError)
  })
})

describe('Objects - Reduce - Recursively', () => {

  it('should correctly map an array of key:value pairs to object', () => {
    const array = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
      { key: 'c', value: 3 },
    ]

    const result = Objects.reduceNested(array)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should correctly map a nested array of key:value pairs to object', () => {
    const array = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
      { key: 'c', value: 3 },
      { key: 'd', value: [
        { key: 'e', value: 4 },
        { key: 'f', value: 5 },
        { key: 'g', value: 6 },
      ] },
    ]

    const result = Objects.reduceNested(array)
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: { e: 4, f: 5, g: 6 } })
  })

  it('should correctly map a deeply nested array of key:value pairs to object', () => {
    const array = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
      { key: 'c', value: 3 },
      { key: 'd', value: [
        { key: 'e', value: 4 },
        { key: 'f', value: 5 },
        { key: 'g', value: 6 },
        { key: 'h', value: [
          { key: 'i', value: 7 },
          { key: 'j', value: 8 },
          { key: 'k', value: 9 },
        ] },
      ] },
    ]

    const result = Objects.reduceNested(array)
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: { e: 4, f: 5, g: 6, h: { i: 7, j: 8, k: 9 } } })
  })

  it('should throw an error when a non-array is passed', () => {

    expect(
      () => Objects.reduceNested('foo'),
    ).toThrow(TypeError)

    expect(
      () => Objects.reduceNested({ foo: 'bar' }),
    ).toThrow(TypeError)

    expect(
      () => Objects.reduceNested(123456),
    ).toThrow(TypeError)

  })
})
