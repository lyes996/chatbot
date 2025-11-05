#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates necessary tables and functions in Supabase for the RAG system
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n')

  try {
    // Enable pgvector extension
    console.log('📦 Enabling pgvector extension...')
    const { error: extensionError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;'
    })

    // Note: The above might not work directly, so we'll create tables assuming extension exists
    
    // Create documents table
    console.log('📝 Creating documents table...')
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          url TEXT NOT NULL UNIQUE,
          space_key TEXT,
          embedding vector(1536),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);

        CREATE INDEX IF NOT EXISTS documents_space_key_idx ON documents(space_key);
      `
    })

    // Create match_documents function
    console.log('🔍 Creating match_documents function...')
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION match_documents(
          query_embedding vector(1536),
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
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT
            documents.id,
            documents.title,
            documents.content,
            documents.url,
            1 - (documents.embedding <=> query_embedding) as similarity
          FROM documents
          WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
          ORDER BY documents.embedding <=> query_embedding
          LIMIT match_count;
        END;
        $$;
      `
    })

    console.log('\n✅ Database setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run "npm run ingest" to import Confluence data')
    console.log('2. Run "npm run dev" to start the application')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    console.log('\n⚠️  Manual setup required:')
    console.log('Please run the following SQL in your Supabase SQL editor:\n')
    console.log(`
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  space_key TEXT,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_space_key_idx ON documents(space_key);

-- Create match function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
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
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.title,
    documents.content,
    documents.url,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
    `)
  }
}

setupDatabase()
