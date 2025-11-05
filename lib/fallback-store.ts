/**
 * In-Memory Fallback Store
 * Simple document storage when Supabase is not available
 */

import type { ConfluencePage } from './confluence-client'

export interface StoredDocument {
  id: string
  title: string
  content: string
  url: string
  spaceKey: string
  createdAt: Date
}

class FallbackStore {
  private documents: Map<string, StoredDocument> = new Map()
  private isInitialized: boolean = false

  /**
   * Add a document to the store
   */
  addDocument(doc: ConfluencePage): void {
    this.documents.set(doc.id, {
      ...doc,
      createdAt: new Date(),
    })
  }

  /**
   * Add multiple documents
   */
  addDocuments(docs: ConfluencePage[]): void {
    docs.forEach((doc) => this.addDocument(doc))
    this.isInitialized = true
  }

  /**
   * Get a document by ID
   */
  getDocument(id: string): StoredDocument | undefined {
    return this.documents.get(id)
  }

  /**
   * Get all documents
   */
  getAllDocuments(): StoredDocument[] {
    return Array.from(this.documents.values())
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear()
    this.isInitialized = false
  }

  /**
   * Get document count
   */
  count(): number {
    return this.documents.size
  }

  /**
   * Check if store is initialized with data
   */
  isReady(): boolean {
    return this.isInitialized && this.documents.size > 0
  }

  /**
   * Mark as initialized even if empty
   */
  markInitialized(): void {
    this.isInitialized = true
  }
}

// Singleton instance
const fallbackStore = new FallbackStore()

export default fallbackStore
