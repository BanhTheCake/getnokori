import PromptTemplates from '@/enums/prompts/PromptTemplates.enum'

const GenerationPromptWithContext = (prompt: string | null, context: any): string => {
  if(!prompt)
    throw new Error('Prompt is required for GenerationPromptWithContext')
  
  let mappedContext = context
  if(typeof context === 'object') 
    mappedContext = JSON.stringify(context)
  
  const FinalPrompt = `Prompt: ${prompt}\nContext: ${mappedContext} \n\nResponse:`

  return FinalPrompt
}

const SummarizationPrompt = (context: any): string => {
  let mappedContext = context
  if(typeof context === 'object') 
    mappedContext = JSON.stringify(context)
  
  const FinalPrompt = `You are a helpful and terse assistant. Kindly produce a comprehensive and succinct summary for the provided text, capturing its main ideas, themes, and key points. Pay careful attention to all relevant details and arguments within the content. The summary should maintain the essence of the original material, but rephrase it in a manner that's more concise and easier to comprehend. Please ensure your summary is well-structured, coherent, and free from any unnecessary jargon or overly complex vocabulary. \n\nContext: ${mappedContext} \n\nResponse:`

  return FinalPrompt
}

export const generate = (prompt: string | null, context: any, template: PromptTemplates): string | null => {
  switch(template) {
    case PromptTemplates.GEN_PROMPT_CONTEXT:
      return GenerationPromptWithContext(prompt, context)
    case PromptTemplates.GEN_SUMMARIZE:
      return SummarizationPrompt(context)
    default:
      return null
  }
}

export default {
  generate,
}
