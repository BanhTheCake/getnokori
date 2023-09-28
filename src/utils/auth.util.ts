const parseBearerToken = (bearerToken: string): string => {
  const [, token] = bearerToken.split(' ')
  return token
}

export default {
  parseBearerToken,
}
