import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const embeddingModel = 'text-embedding-3-small'
const chatModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

/**
 * Generate embeddings for a given text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Generate a chat completion using OpenAI with streaming
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

    const stream = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: true,
    })

    return (async function* () {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    })()
  } catch (error) {
    console.error('Error generating chat completion:', error)
    throw new Error('Failed to generate response')
  }
}

/**
 * Check if OpenAI API is available
 */
export async function checkAIHealth(): Promise<boolean> {
  try {
    await openai.models.list()
    return true
  } catch (error) {
    console.error('OpenAI health check failed:', error)
    return false
  }
}
