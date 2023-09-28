interface Param {
  key: string
  value: string
}

function parseUri(uri: string): { pathParams: Param[]; queryParams: Param[] } {
  const urlParts = new URL(uri, 'https://dummy.example.com')
  const pathParams = urlParts.pathname.match(/{{(.*?)}}/g) || []
  const queryParams = new URLSearchParams(urlParts.search)

  const parsedPathParams: Param[] = pathParams.map(param => ({
    key: param.slice(2, -2),
    value: `{{${param.slice(2, -2)}}}`,
  }))

  const parsedQueryParams: Param[] = []
  queryParams.forEach((value, key) => {
    parsedQueryParams.push({ key, value })
  })

  return {
    pathParams: parsedPathParams,
    queryParams: parsedQueryParams,
  }
}

function buildUri(baseUri: string, { pathParams, queryParams }: { pathParams: Param[]; queryParams: Param[] }): string {
  let uri = baseUri

  pathParams.forEach((param) => {
    uri = uri.replace(`{{${param.key}}}`, param.value)
  })

  const queryString = queryParams
    .map(param => `${param.key}=${param.value}`)
    .join('&')

  if (queryString) 
    uri += `?${ queryString}`

  return uri
}
