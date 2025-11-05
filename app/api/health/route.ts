import { NextResponse } from 'next/server'
import { checkOllamaHealth } from '@/lib/ollama'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check Ollama
    const ollamaHealthy = await checkOllamaHealth()

    // Check Supabase
    const { error: supabaseError } = await supabase
      .from('documents')
      .select('count')
      .limit(1)

    const supabaseHealthy = !supabaseError

    const healthy = ollamaHealthy && supabaseHealthy

    return NextResponse.json({
      status: healthy ? 'healthy' : 'unhealthy',
      services: {
        ollama: ollamaHealthy ? 'up' : 'down',
        supabase: supabaseHealthy ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}
