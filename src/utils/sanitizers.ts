interface Header {
  key: string
  value: string
}

type HeaderArray = Header[]
type HeaderObject = Record<string, string>

function isSensitiveHeader(headerKey: string): boolean {
  const sensitiveHeaders = ['authorization', 'proxy-authorization', 'proxy-authenticate', 'api-key', 'x-auth-token', 'x-api-key', 'jwt', 'token']
  return sensitiveHeaders.includes(headerKey.toLowerCase())
}

function maskValue(value: string): string {
  const revealStart = 2
  const revealEnd = 4
  const masked = value.slice(revealStart, -revealEnd).replace(/./g, '*')
  return value.slice(0, revealStart) + masked + value.slice(-revealEnd)
}

export function sanitizeHeaders(headers: HeaderArray | HeaderObject): HeaderArray | HeaderObject {
  if (Array.isArray(headers)) {
    return headers.map((header) => {
      if (isSensitiveHeader(header.key)) 
        return { ...header, value: maskValue(header.value) }
      
      return header
    })
  }
  else {
    const sanitizedHeaders: HeaderObject = {}
    for (const key in headers) {
      if (isSensitiveHeader(key)) 
        sanitizedHeaders[key] = maskValue(headers[key])
      
      else 
        sanitizedHeaders[key] = headers[key]
      
    }
    return sanitizedHeaders
  }
}
