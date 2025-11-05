# Confluence Chatbot - RAG System

A production-ready Retrieval-Augmented Generation (RAG) chatbot for Confluence documentation, built with Next.js, Supabase, and OpenAI.

## 🚀 Features

- **RAG Architecture**: Semantic search with vector embeddings for accurate context retrieval
- **Confluence Integration**: Automated ingestion of Confluence pages and documentation
- **OpenAI Integration**: Uses OpenAI API for embeddings and chat completions
- **Vector Database**: Supabase with pgvector for efficient similarity search
- **Modern UI**: Clean, responsive interface built with Next.js and React
- **Real-time Streaming**: Streaming responses for better user experience
- **Vercel Ready**: Fully compatible with serverless deployment

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Confluence │─────▶│   Ingestion  │─────▶│  Supabase   │
│    Pages    │      │   Scripts    │      │  (pgvector) │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│    User     │─────▶│   Next.js    │─────▶│   OpenAI    │
│  Interface  │◀─────│     API      │◀─────│     API     │
└─────────────┘      └──────────────┘      └─────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account (free tier works)
- OpenAI API key
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
   - OpenAI API key
   - Confluence credentials (for ingestion)

4. **Set up Supabase database**
   ```bash
   npm run setup-db
   ```
   
   This creates the necessary tables and enables pgvector extension.

5. **Get OpenAI API Key**
   - Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file

## 📊 Data Ingestion

Ingest your Confluence documentation:

```bash
npm run ingest
```

This script:
- Fetches pages from your Confluence space
- Generates embeddings using OpenAI
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
│   │   ├── ai.ts         # OpenAI integration
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

### OpenAI Models

Supported models:
- `gpt-3.5-turbo` (default, fast and cost-effective)
- `gpt-4` (more accurate, higher cost)
- `gpt-4-turbo` (balanced performance)

Change model in `.env`:
```
OPENAI_MODEL=gpt-4
```

## 🎯 Usage

1. **Ask a question**: Type your question in the chat interface
2. **Get context-aware answers**: The system retrieves relevant Confluence pages
3. **View sources**: See which documents were used to generate the answer

## 🔒 Security

- Service role keys are only used server-side
- API routes validate requests
- Environment variables are never exposed to client
- OpenAI API key is only used server-side

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🐛 Troubleshooting

**OpenAI API issues:**
- Ensure your API key is valid
- Check that you have credits in your OpenAI account
- Verify the API key has the correct permissions

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

## 🚀 Deployment

For detailed deployment instructions to Vercel, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

Quick deploy:
1. Configure environment variables on Vercel
2. Deploy from GitHub
3. Your chatbot is live!

---

Built with ❤️ using Next.js, Supabase, and OpenAI
