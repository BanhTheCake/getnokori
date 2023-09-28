import { getEmbedding } from '@/services/vendor/openai/OpenAI.service'
import http from 'axios'
import EmbeddingsProviders from '@/enums/embeddings/Providers.enum'

export const createEmbedding = async (text: string, provider: EmbeddingsProviders = EmbeddingsProviders.NOKORI): Promise<number[] | null> => {
  switch(provider) {
    case EmbeddingsProviders.OPEN_AI:
      return await getEmbedding(text)
    case EmbeddingsProviders.NOKORI:
      return await createSentenceEmbedding(text)
    default:
      return null
  }
}

async function createSentenceEmbedding(text: string): Promise<number[] | null> {

  const response = await http.post(`http://${process.env.NOKORI_EMBED_URL!}`, {
    text: text,
  })

  if(response?.data && response?.data?.embedding)
    return response.data.embedding
  
  return null
}

export default {
  createEmbedding,
}
