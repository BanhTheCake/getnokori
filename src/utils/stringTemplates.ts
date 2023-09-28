interface AnyObject {
  [key: string]: any
}

function enrichString(template: string, context: AnyObject): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = context[key.trim()]
    return value !== undefined ? String(value) : `{{${key}}}`
  })
}

function enrichObject(template: AnyObject, context: AnyObject): AnyObject {
  const enrichedObject: AnyObject = {}

  for (const key in template) {
    const value = template[key]

    if (typeof value === 'string') 
      enrichedObject[key] = enrichString(value, context)
    
    else if (typeof value === 'object' && value !== null) 
      enrichedObject[key] = enrichObject(value, context)
    
    else 
      enrichedObject[key] = value
    
  }

  return enrichedObject
}

export function enrichTemplate<T extends string | AnyObject>(template: T, context: AnyObject): T {
  if (typeof template === 'string') 
    return enrichString(template, context) as T
  
  else 
    return enrichObject(template, context) as T
  
}
