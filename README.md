# Confluence Chatbot - RAG System

A production-ready Retrieval-Augmented Generation (RAG) chatbot for Confluence documentation, built with Next.js, Supabase, and Ollama.

## 🚀 Features

- **RAG Architecture**: Semantic search with vector embeddings for accurate context retrieval
- **Confluence Integration**: Automated ingestion of Confluence pages and documentation
- **Local LLM**: Uses Ollama for privacy-focused, on-premise AI inference
- **Vector Database**: Supabase with pgvector for efficient similarity search
- **Modern UI**: Clean, responsive interface built with Next.js and React
- **Real-time Streaming**: Streaming responses for better user experience

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Confluence │─────▶│   Ingestion  │─────▶│  Supabase   │
│    Pages    │      │   Scripts    │      │  (pgvector) │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│    User     │─────▶│   Next.js    │─────▶│   Ollama    │
│  Interface  │◀─────│     API      │◀─────│    (LLM)    │
└─────────────┘      └──────────────┘      └─────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account (free tier works)
- Ollama installed locally
- Confluence access (for data ingestion)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lyes996/chatbot.git
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - Supabase URL and keys
   - Ollama configuration
   - Confluence credentials (for ingestion)

4. **Set up Supabase database**
   ```bash
   npm run setup-db
   ```
   
   This creates the necessary tables and enables pgvector extension.

5. **Install and start Ollama**
   ```bash
   # Install Ollama from https://ollama.ai
   ollama pull llama2
   ollama serve
   ```

## 📊 Data Ingestion

Ingest your Confluence documentation:

```bash
npm run ingest
```

This script:
- Fetches pages from your Confluence space
- Generates embeddings using Ollama
- Stores content and vectors in Supabase

## 🚀 Running the Application

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

Visit `http://localhost:3000` to use the chatbot.

## 📁 Project Structure

```
confluence-chatbot/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint
│   │   └── search/       # Search endpoint
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   │   ├── supabase.ts   # Supabase client
│   │   ├── ollama.ts     # Ollama integration
│   │   └── rag.ts        # RAG logic
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── scripts/               # Utility scripts
│   ├── ingest-confluence.js
│   └── setup-database.js
├── public/               # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable the pgvector extension in SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the setup script to create tables

### Ollama Models

Supported models:
- `llama2` (default, 7B)
- `mistral` (7B)
- `mixtral` (8x7B)
- `llama3` (8B)

Change model in `.env`:
```
OLLAMA_MODEL=mistral
```

## 🎯 Usage

1. **Ask a question**: Type your question in the chat interface
2. **Get context-aware answers**: The system retrieves relevant Confluence pages
3. **View sources**: See which documents were used to generate the answer

## 🔒 Security

- Service role keys are only used server-side
- API routes validate requests
- Environment variables are never exposed to client
- Ollama runs locally for data privacy

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🐛 Troubleshooting

**Ollama connection issues:**
- Ensure Ollama is running: `ollama serve`
- Check the base URL in `.env`

**Supabase errors:**
- Verify your credentials
- Check that pgvector extension is enabled
- Ensure tables are created with setup script

**Ingestion failures:**
- Verify Confluence credentials
- Check space key is correct
- Ensure API token has read permissions

## 📧 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Next.js, Supabase, and Ollama
