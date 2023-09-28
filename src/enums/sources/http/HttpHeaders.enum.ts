export enum HttpHeaders {
  ContentType = 'Content-Type',
  Accept = 'Accept',
  Authorization = 'Authorization',
  UserAgent = 'User-Agent',
  CacheControl = 'Cache-Control',
  Pragma = 'Pragma',
  IfModifiedSince = 'If-Modified-Since',
  IfNoneMatch = 'If-None-Match',
  IfMatch = 'If-Match',
  IfUnmodifiedSince = 'If-Unmodified-Since',
  ETag = 'ETag',
  LastModified = 'Last-Modified',
  Expires = 'Expires',
  XRequestedWith = 'X-Requested-With',
  XForwardedFor = 'X-Forwarded-For',
  XForwardedHost = 'X-Forwarded-Host',
  XForwardedProto = 'X-Forwarded-Proto',
  XHttpMethodOverride = 'X-Http-Method-Override',
  XRealIp = 'X-Real-Ip',
  XCsrfToken = 'X-Csrf-Token',
  // Add more standard header keys as needed
}

export default HttpHeaders
