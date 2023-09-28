export const generateKeyedOR = (array: any[], key: string) => {
  let query = ''
  for (const item of array) {
    if (query) query += ' OR '
    query += `${key} = "${item}"`
  }
  return query
}
