import http from 'axios'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const baseURL = 'https://api.openai.com/v1'

export const getEmbedding = async (text: string): Promise<number[] | null> => {
  const url = `${baseURL}/embeddings`
  const request = {
    input: text,
    model: getEmbeddingModel(),
  }

  try {
    const response = await _request(url, request)
    console.log(response.data)
    if(response?.data?.data){
      const responseObject = response.data.data.shift()
      return responseObject.embedding
    }

    return null
  }
  catch(error: any){
    logger.error('Error getting embedding', { error })
    return null
  }

  return null
}

interface getChatGenerationResponse {promptTokens: number; completionTokens: number; content: string}
export const getChatGeneration = async (messages): Promise<getChatGenerationResponse | null> => {
  const completion = await openai.createChatCompletion({
    model: 'gpt-4-0314', // gpt-3.5-turbo-0301
    messages,
    temperature: 0.2,
  })

  console.log(completion.data.choices[0].message.content)
  const response = {
    promptTokens: completion?.data?.usage?.prompt_tokens ?? 0,
    completionTokens: completion?.data?.usage?.completion_tokens ?? 0,
    content: completion.data.choices[0].message.content,
  }
  return response
  process.exit(0)

  if(completion?.data?.choices[0]?.message?.content){
    const modelResponse = JSON.parse(completion.data.choices[0].message.content)
    const response = {
      promptTokens: completion?.data?.usage?.prompt_tokens ?? 0,
      completionTokens: completion?.data?.usage?.completion_tokens ?? 0,
      content: modelResponse.response,
    }

    return response
  }
 
  return null
}

interface getSummarizationGenerationResponse {promptTokens: number; completionTokens: number; content: string}
export const getSummarizationGeneration = async (prompt: string): Promise<getSummarizationGenerationResponse | null> => {
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    top_p: 1,
    presence_penalty: 0.6,
    best_of: 1,
    temperature: 0.5,
    stop: ['Response:'],
    max_tokens: 2048,
  })

  if(completion?.data?.choices[0]?.text){
    const response = {
      promptTokens: completion?.data?.usage?.prompt_tokens ?? 0,
      completionTokens: completion?.data?.usage?.completion_tokens ?? 0,
      content: completion.data.choices[0].text.trim(),
    }

    return response
  }
 
  return null
}

export const buildChatGenerationMessages = (prompt: string): {role: string; content: string}[] => {
  const messages: {role: string; content: string}[] = []
  messages.push({
    role: 'system',
    content: 'You are a helpful and terse assistant that generates human-like answers from a given prompt and provided context. You prefer brevity and exclude details that are not explicitly salient to the question or prompt.',
  })

  messages.push({
    role: 'user',
    content: prompt,
  })

  return messages

}

export const buildSummarizeGenerationMessages = (prompt: string): {role: string; content: string}[] => {
  const messages: {role: string; content: string}[] = []
  messages.push({
    role: 'system',
    content: 'You are a useful assistant that generates useful, human-like, concise summaries from single or multiple provided contexts. Your responses are always parsable by python\'s json.dumps() and is in the format { response: <<model response>>}',
  })

  messages.push({
    role: 'user',
    content: prompt,
  })

  return messages
}

function getEmbeddingModel(): string {
  return 'text-embedding-ada-002'
}

function getChatModel(): string {
  return 'gpt-4-0314'
}

function _request(url: string, data: any) {
  return http.post(url, data, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })
}

export default {}
