import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export interface Document {
  id: string
  title: string
  content: string
  url: string
  space_key: string
  embedding: number[]
  created_at: string
  updated_at: string
}

export interface SearchResult {
  id: string
  title: string
  content: string
  url: string
  similarity: number
}
