import { Ollama } from 'ollama'

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const ollamaModel = process.env.OLLAMA_MODEL || 'llama2'

export const ollama = new Ollama({ host: ollamaBaseUrl })

/**
 * Generate embeddings for a given text using Ollama
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ollama.embeddings({
      model: ollamaModel,
      prompt: text,
    })
    return response.embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate a chat completion using Ollama
 */
export async function generateChatCompletion(
  prompt: string,
  context: string
): Promise<AsyncIterable<string>> {
  try {
    const systemPrompt = `You are a helpful assistant that answers questions based on the provided context from Confluence documentation. 
If the context doesn't contain relevant information to answer the question, say so honestly.
Always be concise and accurate.

Context:
${context}
`

    const response = await ollama.chat({
      model: ollamaModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: true,
    })

    return (async function* () {
      for await (const part of response) {
        if (part.message?.content) {
          yield part.message.content
        }
      }
    })()
  } catch (error) {
    console.error('Error generating chat completion:', error)
    throw new Error('Failed to generate response')
  }
}

/**
 * Check if Ollama is available and the model is loaded
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const models = await ollama.list()
    return models.models.some((m) => m.name.includes(ollamaModel))
  } catch (error) {
    console.error('Ollama health check failed:', error)
    return false
  }
}
