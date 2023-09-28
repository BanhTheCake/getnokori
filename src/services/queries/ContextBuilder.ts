import Mustache from 'mustache'
import { reduceNested } from '@/utils/objects'
import type { INokoriDBQuery } from '@/types/queries/INokoriDBQuery.interface'

const mapContext = <T>(context: Array<T>): [] | {[key: string]: any} => {
  if(!context || context.length < 1) return []
  const result = reduceNested(context)
  return result
}

const renderContext = async (context: any, query: string): Promise<string | null> => {

  try {
    const rendered = await Mustache.render(query, context)
    return rendered
    
  }
  catch (error) {
    logger.error('Error rendering string query', {
      error: error,
      context: context,
      query: query,
    })
  }

  return null
}

const renderObject = async (context: any, query: object): Promise<INokoriDBQuery['config'] | null> => {
  try {
    const rendered = await Mustache.render(JSON.stringify(query), context)
    return JSON.parse(rendered)
  }
  catch (error) {
    logger.error('Error rendering object query', {
      error: error,
      context: context,
      query: query,
    })
  }

  return null
}

export default {
  mapContext,
  renderContext,
  renderObject,
}
