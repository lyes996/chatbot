# Architecture Documentation

## System Overview

The Confluence Chatbot is a Retrieval-Augmented Generation (RAG) system that combines semantic search with large language models to provide accurate, context-aware answers from Confluence documentation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (Next.js)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat Input   │  │  Messages    │  │   Sources    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/chat    │  │ /api/search  │  │ /api/health  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────┬───────────────────┬─────────────────────────────────┘
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────────────────────┐
│   RAG Engine    │  │      Supabase (PostgreSQL)      │
│  ┌───────────┐  │  │  ┌──────────────────────────┐  │
│  │  Search   │──┼──┼─▶│  documents table         │  │
│  │  Similar  │  │  │  │  - id, title, content    │  │
│  │  Docs     │  │  │  │  - url, space_key        │  │
│  └───────────┘  │  │  │  - embedding (vector)    │  │
│  ┌───────────┐  │  │  └──────────────────────────┘  │
│  │  Build    │  │  │  ┌──────────────────────────┐  │
│  │  Context  │  │  │  │  match_documents()       │  │
│  └───────────┘  │  │  │  (pgvector function)     │  │
└────────┬────────┘  │  └──────────────────────────┘  │
         │           └─────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ollama (Local LLM)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Embeddings  │  │  Chat Model  │  │   Streaming  │      │
│  │  Generation  │  │  (llama2)    │  │   Response   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         ▲
         │
┌────────┴────────────────────────────────────────────────────┐
│              Data Ingestion (Scripts)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Confluence  │─▶│  Embedding   │─▶│   Supabase   │      │
│  │    Fetch     │  │  Generation  │  │    Storage   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (Next.js App Router)

**Location:** `app/`

**Components:**
- `page.tsx`: Main chat interface with state management
- `components/Header.tsx`: Application header with health status
- `components/ChatMessage.tsx`: Individual message rendering with markdown support
- `components/ChatInput.tsx`: User input with keyboard shortcuts
- `components/SourcesList.tsx`: Display of relevant source documents

**Key Features:**
- Real-time streaming responses
- Markdown rendering for formatted answers
- Source attribution with similarity scores
- Responsive design

### 2. API Layer

**Location:** `app/api/`

#### `/api/chat` (POST)
- Receives user questions
- Performs semantic search for relevant documents
- Streams LLM responses with context
- Returns sources used for answer generation

**Flow:**
1. Accept user message
2. Generate embedding for query
3. Search similar documents in Supabase
4. Build context from top results
5. Stream LLM response with context
6. Return sources metadata

#### `/api/search` (POST)
- Direct semantic search endpoint
- Returns ranked documents by similarity
- Used for testing and debugging

#### `/api/health` (GET)
- System health check
- Verifies Ollama and Supabase connectivity
- Returns service status

### 3. RAG Engine

**Location:** `lib/`

#### `lib/rag.ts`
**Functions:**
- `searchSimilarDocuments()`: Vector similarity search
- `buildContext()`: Formats search results for LLM
- `extractRelevantSnippet()`: Extracts key content portions

**Algorithm:**
1. Convert query to embedding vector
2. Use pgvector cosine similarity search
3. Filter by similarity threshold (default: 0.7)
4. Return top N results (default: 5)
5. Format as context for LLM

#### `lib/ollama.ts`
**Functions:**
- `generateEmbedding()`: Creates vector embeddings
- `generateChatCompletion()`: Streams LLM responses
- `checkOllamaHealth()`: Verifies Ollama availability

**Configuration:**
- Model: Configurable (llama2, mistral, mixtral, etc.)
- Streaming: Enabled for real-time responses
- Context window: Managed by model limits

#### `lib/supabase.ts`
**Functions:**
- Client initialization (public and admin)
- Type definitions for documents and search results
- Database interface

### 4. Vector Database (Supabase + pgvector)

**Schema:**

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL,
  space_key TEXT,
  embedding vector(4096),  -- Ollama embedding dimension
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX documents_space_key_idx ON documents(space_key);
```

**Search Function:**

```sql
CREATE FUNCTION match_documents(
  query_embedding vector(4096),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  url text,
  similarity float
)
```

**Performance:**
- IVFFlat index for fast approximate nearest neighbor search
- Cosine similarity for semantic matching
- Configurable threshold and result count

### 5. LLM Integration (Ollama)

**Models Supported:**
- llama2 (7B) - Default, balanced performance
- mistral (7B) - Fast, efficient
- mixtral (8x7B) - High quality, slower
- llama3 (8B) - Latest, improved

**Embedding Dimensions:**
- llama2: 4096
- mistral: 4096
- mixtral: 4096

**Features:**
- Local inference (privacy-focused)
- Streaming responses
- Configurable system prompts
- Context-aware generation

### 6. Data Ingestion Pipeline

**Location:** `scripts/`

#### `scripts/ingest-confluence.js`

**Process:**
1. Authenticate with Confluence API
2. Fetch pages from specified space
3. Clean HTML content to plain text
4. Generate embeddings via Ollama
5. Store in Supabase with metadata

**Features:**
- Batch processing with rate limiting
- Error handling and retry logic
- Progress tracking
- Duplicate detection (upsert by URL)

**Rate Limiting:**
- 1 second delay between pages
- Prevents API throttling
- Configurable batch size

## Data Flow

### Query Processing Flow

```
User Query
    ↓
Generate Query Embedding (Ollama)
    ↓
Vector Similarity Search (Supabase + pgvector)
    ↓
Retrieve Top K Documents (K=5)
    ↓
Build Context String
    ↓
Generate Response with Context (Ollama)
    ↓
Stream to User Interface
```

### Ingestion Flow

```
Confluence API
    ↓
Fetch Pages (with pagination)
    ↓
Clean HTML → Plain Text
    ↓
Generate Embeddings (Ollama)
    ↓
Store in Supabase
    ↓
Create Vector Index
```

## Performance Considerations

### Embedding Generation
- **Time:** ~1-2 seconds per document
- **Optimization:** Batch processing, caching
- **Bottleneck:** Ollama inference speed

### Vector Search
- **Time:** ~50-200ms for 1000s of documents
- **Optimization:** IVFFlat index, appropriate list count
- **Scalability:** Sub-linear with index

### LLM Response
- **Time:** 2-10 seconds (streaming)
- **Optimization:** Smaller models, context pruning
- **User Experience:** Streaming improves perceived speed

## Security

### API Keys
- Service role key: Server-side only
- Anon key: Client-side, row-level security ready
- Environment variables: Never exposed to client

### Data Privacy
- Ollama runs locally (no external API calls)
- Confluence credentials: Ingestion only
- User queries: Not logged by default

### Best Practices
- Use environment variables for all secrets
- Enable RLS (Row Level Security) in Supabase if multi-tenant
- Validate and sanitize user inputs
- Rate limit API endpoints

## Scalability

### Current Limits
- Documents: ~10,000 (with good performance)
- Concurrent users: ~100 (depends on Ollama hardware)
- Response time: 2-10 seconds

### Scaling Strategies
1. **Horizontal:** Multiple Ollama instances with load balancing
2. **Vertical:** GPU acceleration for Ollama
3. **Database:** Supabase auto-scales, consider read replicas
4. **Caching:** Redis for frequent queries
5. **CDN:** Static assets and API responses

## Monitoring

### Health Checks
- `/api/health`: System status
- Ollama connectivity
- Supabase connectivity

### Metrics to Track
- Query latency
- Embedding generation time
- Search accuracy (similarity scores)
- User satisfaction (feedback)

### Logging
- API request/response times
- Error rates and types
- Search result quality

## Future Enhancements

### Planned Features
1. Multi-space support
2. User authentication
3. Query history
4. Feedback mechanism
5. Advanced filtering (by date, author, etc.)
6. Hybrid search (keyword + semantic)
7. Document summarization
8. Multi-language support

### Technical Improvements
1. Caching layer (Redis)
2. Background job queue for ingestion
3. Incremental updates (webhooks)
4. A/B testing framework
5. Analytics dashboard

---

This architecture provides a solid foundation for a production-ready RAG system with room for growth and optimization.
