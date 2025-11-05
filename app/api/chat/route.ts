import { NextRequest, NextResponse } from 'next/server'
import { searchSimilarDocuments, buildContext } from '@/lib/rag'
import { generateChatCompletion } from '@/lib/ai'
import { isSupabaseConfigured } from '@/lib/supabase'
import { searchDocuments, generateExtractiveAnswer } from '@/lib/simple-search'
import fallbackStore from '@/lib/fallback-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Check if OpenAI is configured
const isOpenAIConfigured = !!process.env.OPENAI_API_KEY

// Determine which mode to use
const useFullRAG = isSupabaseConfigured && isOpenAIConfigured

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if fallback store is ready
    if (!useFullRAG && !fallbackStore.isReady()) {
      return NextResponse.json(
        { 
          error: 'Le système n\'est pas encore initialisé. Veuillez appeler /api/ingest d\'abord.',
          needsIngestion: true 
        },
        { status: 503 }
      )
    }

    const encoder = new TextEncoder()

    // MODE 1: Full RAG with Supabase + OpenAI
    if (useFullRAG) {
      try {
        // Search for relevant documents
        const searchResults = await searchSimilarDocuments(message, 5, 0.6)

        // Build context from search results
        const context = buildContext(searchResults)

        // Generate streaming response
        const stream = await generateChatCompletion(message, context)

        // Create a readable stream for the response
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              // Send sources first
              const sourcesData = {
                type: 'sources',
                sources: searchResults.map((r) => ({
                  title: r.title,
                  url: r.url,
                  similarity: r.similarity,
                })),
              }
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(sourcesData)}\n\n`)
              )

              // Stream the response
              for await (const chunk of stream) {
                const data = {
                  type: 'content',
                  content: chunk,
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
              }

              // Send done signal
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            } catch (error) {
              console.error('Streaming error:', error)
              controller.error(error)
            }
          },
        })

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      } catch (error) {
        console.error('Full RAG error, falling back to simple search:', error)
        // Fall through to fallback mode
      }
    }

    // MODE 2: Fallback with simple text search
    const searchResults = searchDocuments(message, 5, 0.01)
    const answer = generateExtractiveAnswer(message, searchResults)

    // Create a readable stream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send sources first
          const sourcesData = {
            type: 'sources',
            sources: searchResults.map((r) => ({
              title: r.title,
              url: r.url,
              similarity: r.similarity,
            })),
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(sourcesData)}\n\n`)
          )

          // Stream the answer (simulate streaming by splitting into words)
          const words = answer.split(' ')
          for (let i = 0; i < words.length; i++) {
            const chunk = i === 0 ? words[i] : ' ' + words[i]
            const data = {
              type: 'content',
              content: chunk,
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
            
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 20))
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
