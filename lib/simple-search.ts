/**
 * Simple Text Search using TF-IDF
 * Fallback search when vector embeddings are not available
 */

import fallbackStore, { type StoredDocument } from './fallback-store'

export interface SimpleSearchResult {
  id: string
  title: string
  content: string
  url: string
  similarity: number
  snippet: string
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüÿæœç]/g, ' ') // Keep French characters
    .split(/\s+/)
    .filter((word) => word.length > 2) // Remove very short words
}

/**
 * Calculate term frequency
 */
function calculateTF(term: string, tokens: string[]): number {
  const count = tokens.filter((t) => t === term).length
  return count / tokens.length
}

/**
 * Calculate inverse document frequency
 */
function calculateIDF(term: string, documents: StoredDocument[]): number {
  const docsWithTerm = documents.filter((doc) =>
    tokenize(doc.content).includes(term)
  ).length

  if (docsWithTerm === 0) return 0

  return Math.log(documents.length / docsWithTerm)
}

/**
 * Calculate TF-IDF score for a document given a query
 */
function calculateTFIDF(
  query: string,
  document: StoredDocument,
  allDocuments: StoredDocument[]
): number {
  const queryTokens = tokenize(query)
  const docTokens = tokenize(document.content + ' ' + document.title)

  let score = 0

  for (const term of queryTokens) {
    const tf = calculateTF(term, docTokens)
    const idf = calculateIDF(term, allDocuments)
    score += tf * idf
  }

  // Boost score if query terms appear in title
  const titleTokens = tokenize(document.title)
  for (const term of queryTokens) {
    if (titleTokens.includes(term)) {
      score *= 1.5
    }
  }

  return score
}

/**
 * Extract relevant snippet from content based on query
 */
function extractSnippet(content: string, query: string, maxLength: number = 300): string {
  const queryTerms = tokenize(query)
  const sentences = content.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0)

  // Score sentences based on query term matches
  const scoredSentences = sentences.map((sentence) => {
    const sentenceTokens = tokenize(sentence)
    const score = queryTerms.reduce((acc, term) => {
      return acc + (sentenceTokens.includes(term) ? 1 : 0)
    }, 0)
    return { sentence, score }
  })

  // Get top sentences with matches
  const topSentences = scoredSentences
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((s) => s.sentence)

  let snippet = topSentences.join('. ')

  // Fallback to beginning if no matches
  if (snippet.length === 0) {
    snippet = sentences.slice(0, 2).join('. ')
  }

  // Trim to max length
  if (snippet.length > maxLength) {
    snippet = snippet.substring(0, maxLength) + '...'
  }

  return snippet || content.substring(0, maxLength) + '...'
}

/**
 * Search documents using TF-IDF
 */
export function searchDocuments(
  query: string,
  limit: number = 5,
  minScore: number = 0.01
): SimpleSearchResult[] {
  const allDocuments = fallbackStore.getAllDocuments()

  if (allDocuments.length === 0) {
    return []
  }

  // Calculate scores for all documents
  const scoredDocs = allDocuments.map((doc) => ({
    doc,
    score: calculateTFIDF(query, doc, allDocuments),
  }))

  // Sort by score and filter by minimum score
  const results = scoredDocs
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      id: item.doc.id,
      title: item.doc.title,
      content: item.doc.content,
      url: item.doc.url,
      similarity: Math.min(item.score * 10, 1), // Normalize to 0-1 range
      snippet: extractSnippet(item.doc.content, query),
    }))

  return results
}

/**
 * Generate a simple extractive answer from search results
 */
export function generateExtractiveAnswer(
  query: string,
  results: SimpleSearchResult[]
): string {
  if (results.length === 0) {
    return "Je n'ai pas trouvé d'information pertinente dans la documentation Confluence pour répondre à cette question."
  }

  // Build answer from top results
  const topResults = results.slice(0, 3)
  
  let answer = "D'après la documentation Confluence :\n\n"

  topResults.forEach((result, index) => {
    answer += `${result.snippet}\n\n`
  })

  answer += `\nCes informations proviennent de ${results.length} document(s) pertinent(s).`

  return answer
}
