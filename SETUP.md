# Setup Guide - Confluence Chatbot

Complete step-by-step guide to set up and run the Confluence Chatbot RAG system.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Git** installed
- A **Supabase** account (free tier works fine)
- **Ollama** installed on your machine
- Access to a **Confluence** workspace (for data ingestion)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/lyes996/chatbot.git
cd chatbot

# Install dependencies
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details and wait for setup to complete

### 2.2 Get Your Credentials

1. Go to Project Settings → API
2. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` secret key (click "Reveal" to see it)

### 2.3 Enable pgvector Extension

1. Go to SQL Editor in your Supabase dashboard
2. Run this SQL command:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2.4 Create Database Schema

Run the setup script:

```bash
npm run setup-db
```

Or manually run the SQL from the script output in your Supabase SQL editor.

## Step 3: Install and Configure Ollama

### 3.1 Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai)

### 3.2 Pull a Model

```bash
# Pull the default model (llama2)
ollama pull llama2

# Or use a different model
ollama pull mistral
ollama pull mixtral
```

### 3.3 Start Ollama Server

```bash
ollama serve
```

Keep this running in a separate terminal.

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Confluence Configuration (for data ingestion)
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_USERNAME=your_email@example.com
CONFLUENCE_API_TOKEN=your_confluence_api_token
CONFLUENCE_SPACE_KEY=YOUR_SPACE_KEY
```

### Getting Confluence Credentials

1. **Base URL**: Your Confluence workspace URL
2. **Username**: Your Confluence email
3. **API Token**: 
   - Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Give it a name and copy the token
4. **Space Key**: 
   - Go to your Confluence space
   - Look at the URL: `https://domain.atlassian.net/wiki/spaces/SPACEKEY/...`
   - The space key is the part after `/spaces/`

## Step 5: Ingest Confluence Data

Run the ingestion script to import your Confluence documentation:

```bash
npm run ingest
```

This will:
- Fetch all pages from your specified Confluence space
- Generate embeddings using Ollama
- Store everything in Supabase

**Note:** This may take a while depending on the number of pages. The script processes one page per second to avoid rate limiting.

## Step 6: Run the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Mode

```bash
npm run build
npm start
```

## Troubleshooting

### Ollama Connection Issues

**Problem:** "Failed to connect to Ollama"

**Solutions:**
- Ensure Ollama is running: `ollama serve`
- Check the base URL in `.env` matches your Ollama server
- Try: `curl http://localhost:11434/api/tags` to verify Ollama is accessible

### Supabase Errors

**Problem:** "relation 'documents' does not exist"

**Solutions:**
- Run the database setup script again: `npm run setup-db`
- Manually run the SQL schema in Supabase SQL editor
- Check that pgvector extension is enabled

### Ingestion Failures

**Problem:** "Confluence API error: 401"

**Solutions:**
- Verify your Confluence credentials in `.env`
- Ensure API token is valid and not expired
- Check that your account has read access to the space

**Problem:** "Model not found in Ollama"

**Solutions:**
- Pull the model: `ollama pull llama2`
- Check available models: `ollama list`
- Update `OLLAMA_MODEL` in `.env` to match an available model

### Empty Search Results

**Problem:** Chatbot says "No relevant documentation found"

**Solutions:**
- Ensure ingestion completed successfully
- Check that documents exist in Supabase: Go to Table Editor → documents
- Try lowering the similarity threshold in `lib/rag.ts`
- Verify embeddings were generated (embedding column should not be null)

## Advanced Configuration

### Using Different Models

Edit `.env`:

```env
# Smaller, faster model
OLLAMA_MODEL=mistral

# Larger, more capable model
OLLAMA_MODEL=mixtral
```

### Adjusting Search Parameters

Edit `lib/rag.ts`:

```typescript
// Change number of results
export async function searchSimilarDocuments(
  query: string,
  limit: number = 10,  // Increase for more context
  similarityThreshold: number = 0.5  // Lower for more results
)
```

### Custom Confluence Spaces

To ingest multiple spaces, run the ingestion script multiple times with different `CONFLUENCE_SPACE_KEY` values in `.env`.

## Next Steps

- Customize the UI in `app/components/`
- Adjust the system prompt in `lib/ollama.ts`
- Add authentication if needed
- Deploy to Vercel or your preferred platform

## Support

For issues and questions:
- Check the [README.md](README.md)
- Open an issue on GitHub
- Review Supabase and Ollama documentation

---

Happy chatting! 🤖
