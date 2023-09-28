/**
Copyright 2019 Wes Melton

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */

export const slink = (obj, delimiter = '__') => {
  const toReturn = {}

  for (const i in obj) {
    if (!({}).hasOwnProperty.call(obj, i)) continue

    if (typeof obj[i] === 'object' && obj[i] !== null) {
      const flatObject = slink(obj[i], delimiter)
      for (const x in flatObject) {
        if (!({}).hasOwnProperty.call(flatObject, x)) continue

        toReturn[i + delimiter + x] = flatObject[x]
      }
    }
    else {
      toReturn[i] = obj[i]
    }
  }
  return toReturn
}

export const unslink = (data, delimiter = '__') => {
  const result = {}
  for (const i in data) {
    const keys = i.split(delimiter)
    keys.reduce(function (r, e, j) {
      return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 === j ? data[i] : {}) : [])
    }, result)
  }
  return result
}

export default {
  slink,
  unslink,
}
