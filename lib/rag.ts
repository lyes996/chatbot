import { supabase } from './supabase'
import { generateEmbedding } from './ollama'
import type { SearchResult } from './supabase'

/**
 * Search for similar documents using vector similarity
 */
export async function searchSimilarDocuments(
  query: string,
  limit: number = 5,
  similarityThreshold: number = 0.7
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Search for similar documents using pgvector
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: similarityThreshold,
      match_count: limit,
    })

    if (error) {
      console.error('Error searching documents:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in searchSimilarDocuments:', error)
    throw new Error('Failed to search documents')
  }
}

/**
 * Build context from search results for RAG
 */
export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant documentation found.'
  }

  return results
    .map((result, index) => {
      return `
Document ${index + 1}: ${result.title}
URL: ${result.url}
Content: ${result.content.substring(0, 1000)}...
---`
    })
    .join('\n\n')
}

/**
 * Extract relevant snippets from content based on query
 */
export function extractRelevantSnippet(
  content: string,
  query: string,
  maxLength: number = 500
): string {
  const queryTerms = query.toLowerCase().split(' ')
  const sentences = content.split(/[.!?]+/)

  // Score sentences based on query term matches
  const scoredSentences = sentences.map((sentence) => {
    const lowerSentence = sentence.toLowerCase()
    const score = queryTerms.reduce((acc, term) => {
      return acc + (lowerSentence.includes(term) ? 1 : 0)
    }, 0)
    return { sentence: sentence.trim(), score }
  })

  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.sentence)

  let snippet = topSentences.join('. ')

  // Fallback to beginning if no matches
  if (snippet.length === 0) {
    snippet = content.substring(0, maxLength)
  }

  // Trim to max length
  if (snippet.length > maxLength) {
    snippet = snippet.substring(0, maxLength) + '...'
  }

  return snippet
}
