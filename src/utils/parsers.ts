
export const parseSQLEnums = (sql: string) => {

  const enumRegex = /enum\((.*?)\)/g
  const matches = sql.match(enumRegex)
  if(!matches) return []
  
  const output: string[] = []
  for(const match of matches){
    const enumValues: string[] = match.replace(/enum\(|\)/g, '').replace(/\'|\"/g, '').split(',')
    output.push(...enumValues)
  }

  return output.length > 0 ? output : []
}

export default {
  parseSQLEnums,
}
