#!/usr/bin/env node

/**
 * Confluence Ingestion Script
 * Fetches pages from Confluence and stores them in Supabase with embeddings
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { Ollama } = require('ollama')

// Configuration
const CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL
const CONFLUENCE_USERNAME = process.env.CONFLUENCE_USERNAME
const CONFLUENCE_API_TOKEN = process.env.CONFLUENCE_API_TOKEN
const CONFLUENCE_SPACE_KEY = process.env.CONFLUENCE_SPACE_KEY

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2'

// Validate configuration
if (!CONFLUENCE_BASE_URL || !CONFLUENCE_USERNAME || !CONFLUENCE_API_TOKEN || !CONFLUENCE_SPACE_KEY) {
  console.error('❌ Missing Confluence configuration in .env file')
  console.log('Required variables: CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN, CONFLUENCE_SPACE_KEY')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration in .env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const ollama = new Ollama({ host: OLLAMA_BASE_URL })

/**
 * Fetch pages from Confluence space
 */
async function fetchConfluencePages() {
  console.log(`📚 Fetching pages from Confluence space: ${CONFLUENCE_SPACE_KEY}`)
  
  const auth = Buffer.from(`${CONFLUENCE_USERNAME}:${CONFLUENCE_API_TOKEN}`).toString('base64')
  const pages = []
  let start = 0
  const limit = 25

  try {
    while (true) {
      const url = `${CONFLUENCE_BASE_URL}/rest/api/content?spaceKey=${CONFLUENCE_SPACE_KEY}&limit=${limit}&start=${start}&expand=body.storage,version`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Confluence API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      pages.push(...data.results)

      console.log(`  Fetched ${pages.length} pages...`)

      if (data.results.length < limit) {
        break
      }

      start += limit
    }

    console.log(`✅ Fetched ${pages.length} pages from Confluence\n`)
    return pages
  } catch (error) {
    console.error('❌ Error fetching Confluence pages:', error.message)
    throw error
  }
}

/**
 * Clean HTML content to plain text
 */
function cleanHtmlContent(html) {
  if (!html) return ''
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ')
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

/**
 * Generate embedding for text using Ollama
 */
async function generateEmbedding(text) {
  try {
    const response = await ollama.embeddings({
      model: OLLAMA_MODEL,
      prompt: text,
    })
    return response.embedding
  } catch (error) {
    console.error('❌ Error generating embedding:', error.message)
    throw error
  }
}

/**
 * Process and store a single page
 */
async function processPage(page, index, total) {
  const title = page.title
  const content = cleanHtmlContent(page.body?.storage?.value || '')
  const url = `${CONFLUENCE_BASE_URL}/pages/viewpage.action?pageId=${page.id}`

  console.log(`[${index + 1}/${total}] Processing: ${title}`)

  if (!content || content.length < 50) {
    console.log('  ⚠️  Skipping (content too short)')
    return false
  }

  try {
    // Generate embedding
    console.log('  🔄 Generating embedding...')
    const embedding = await generateEmbedding(content.substring(0, 8000)) // Limit content length

    // Store in Supabase
    console.log('  💾 Storing in database...')
    const { error } = await supabase.from('documents').upsert({
      title,
      content,
      url,
      space_key: CONFLUENCE_SPACE_KEY,
      embedding,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'url'
    })

    if (error) {
      console.error('  ❌ Database error:', error.message)
      return false
    }

    console.log('  ✅ Completed\n')
    return true
  } catch (error) {
    console.error(`  ❌ Error processing page: ${error.message}\n`)
    return false
  }
}

/**
 * Main ingestion function
 */
async function ingestConfluence() {
  console.log('🚀 Starting Confluence ingestion...\n')

  try {
    // Check Ollama connection
    console.log('🔍 Checking Ollama connection...')
    const models = await ollama.list()
    const hasModel = models.models.some(m => m.name.includes(OLLAMA_MODEL))
    
    if (!hasModel) {
      console.error(`❌ Model "${OLLAMA_MODEL}" not found in Ollama`)
      console.log(`Available models: ${models.models.map(m => m.name).join(', ')}`)
      console.log(`\nRun: ollama pull ${OLLAMA_MODEL}`)
      process.exit(1)
    }
    console.log(`✅ Ollama connected (model: ${OLLAMA_MODEL})\n`)

    // Fetch pages
    const pages = await fetchConfluencePages()

    if (pages.length === 0) {
      console.log('⚠️  No pages found to process')
      return
    }

    // Process pages
    console.log('📝 Processing pages...\n')
    let successCount = 0
    
    for (let i = 0; i < pages.length; i++) {
      const success = await processPage(pages[i], i, pages.length)
      if (success) successCount++
      
      // Add delay to avoid rate limiting
      if (i < pages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Ingestion completed!`)
    console.log(`   Total pages: ${pages.length}`)
    console.log(`   Successfully processed: ${successCount}`)
    console.log(`   Failed: ${pages.length - successCount}`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('\n❌ Ingestion failed:', error.message)
    process.exit(1)
  }
}

// Run ingestion
ingestConfluence()
