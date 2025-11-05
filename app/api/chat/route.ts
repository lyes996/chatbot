import { NextRequest, NextResponse } from 'next/server'
import { searchSimilarDocuments, buildContext } from '@/lib/rag'
import { generateChatCompletion } from '@/lib/ollama'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Search for relevant documents
    const searchResults = await searchSimilarDocuments(message, 5, 0.6)

    // Build context from search results
    const context = buildContext(searchResults)

    // Generate streaming response
    const stream = await generateChatCompletion(message, context)

    // Create a readable stream for the response
    const encoder = new TextEncoder()
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
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
