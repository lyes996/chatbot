import { NextRequest, NextResponse } from 'next/server'
import { searchSimilarDocuments } from '@/lib/rag'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5 } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const results = await searchSimilarDocuments(query, limit)

    return NextResponse.json({
      results,
      count: results.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    )
  }
}
