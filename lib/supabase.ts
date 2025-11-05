import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create clients only if Supabase is configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Server-side client with service role key for admin operations
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(
      supabaseUrl!,
      supabaseServiceKey || supabaseAnonKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

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
