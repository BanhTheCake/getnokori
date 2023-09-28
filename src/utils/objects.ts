/**
 * Returns a map from an array of objects.
 * Object keys must be `id`.
 *
 * @param   {[type]}  array  [{id: 2, name: 'file2', parent: 1}, ...]
 *
 * @return  {[type]}         {2: {id: 2, name: 'file2', parent: 1}, ...}
 */
function _mapFromArrayOfObjects(array) {
  const map = {}
  array.forEach((item) => {
    map[item.nodeId] = item
  })
  return map
}

/**
 * Converts an array of objects with parentId indicators to a tree structure.
 * Originally seen here: https://repl.it/@chris_pauley/Tree-Structure-from-Array-of-Objects
 * 
 * @param   {[type]}  contents  [contents description]
 *
 * @return  {[type]}            [return description]
 */
export const treeFromObjects = (contents) => {
  const objects = (Array.isArray(contents) ? contents : [contents])
  const map = _mapFromArrayOfObjects(objects)
  const result: any[] = []
  contents.forEach((content) => {
    const parent = map[content.parentNodeId]
    if(!content.nodeSubType) delete content.nodeSubType
    if(!content.engine) delete content.engine
    if(content.nodeType && content.nodeType !== 'query') delete content.command
    delete content.sortPriority
    if (parent) 
      (parent.children || (parent.children = [])).push(content)
    
    else 
      result.push(content)
    
  })
  return result
}

export const reduce = (array) => {
  if(!Array.isArray(array)) 
    throw new TypeError(`Expected an array, received ${typeof array}`)
  
  const result = {}
  for(let i = 0; i < array.length; i++) 
    result[array[i].key] = array[i].value

  return result
}

/**
 * Recurses through an array of key:value pairs and returns an object.
 * 
 * `[ { key: 'a', value: 1 }, { key: 'b', value: 2 }, { key: 'c', value: 3 } ]`
 * 
 * becomes
 * 
 * `{ a: 1, b: 2, c: 3 }`
 * 
 * Nested arrays are also supported.
 *
 * @param   {[type]}  array  [array description]
 *
 * @return  {[type]}         [return description]
 */
export const reduceNested = (array) => {
  if(!Array.isArray(array)) 
    throw new TypeError(`Expected an array, received ${typeof array}`)

  const result = {}
  for(let i = 0; i < array.length; i++) {
    if(typeof array[i].value === 'object') 
      result[array[i].key] = reduceNested(array[i].value)
    
    else 
      result[array[i].key] = array[i].value
    
  }

  return result
}

type AnyObject = Record<string, any>

export function removeNullishProperties(obj: AnyObject): AnyObject {
  const cleanedObject: AnyObject = {}

  for (const key in obj) {
    const value = obj[key]

    if (value === null || value === undefined || value === '') continue

    if (typeof value === 'object' && !Array.isArray(value)) 
      cleanedObject[key] = removeNullishProperties(value)
    
    else 
      cleanedObject[key] = value
    
  }

  return cleanedObject
}

export default {
  reduce,
  reduceNested,
  treeFromObjects,
  removeNullishProperties,
}
