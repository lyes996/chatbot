#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Validates that all required environment variables are set
 */

require('dotenv').config()

const requiredVars = {
  'Supabase': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  'OpenAI': [
    'OPENAI_API_KEY'
  ],
  'Confluence (for ingestion)': [
    'CONFLUENCE_BASE_URL',
    'CONFLUENCE_USERNAME',
    'CONFLUENCE_API_TOKEN',
    'CONFLUENCE_SPACE_KEY'
  ]
}

const optionalVars = {
  'OpenAI': ['OPENAI_MODEL']
}

console.log('🔍 Checking environment variables...\n')

let hasErrors = false
let hasWarnings = false

// Check required variables
for (const [category, vars] of Object.entries(requiredVars)) {
  console.log(`📦 ${category}:`)
  
  for (const varName of vars) {
    const value = process.env[varName]
    
    if (!value || value.includes('placeholder') || value.includes('your_')) {
      console.log(`  ❌ ${varName}: Missing or placeholder`)
      hasErrors = true
    } else {
      // Show partial value for security
      const displayValue = value.length > 20 
        ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
        : value.substring(0, 10) + '...'
      console.log(`  ✅ ${varName}: ${displayValue}`)
    }
  }
  console.log()
}

// Check optional variables
console.log('📦 Optional:')
for (const [category, vars] of Object.entries(optionalVars)) {
  for (const varName of vars) {
    const value = process.env[varName]
    
    if (!value) {
      console.log(`  ⚠️  ${varName}: Not set (will use default)`)
      hasWarnings = true
    } else {
      console.log(`  ✅ ${varName}: ${value}`)
    }
  }
}
console.log()

// Summary
console.log('='.repeat(50))
if (hasErrors) {
  console.log('❌ Configuration incomplete!')
  console.log('\nPlease update your .env file with the missing values.')
  console.log('See DEPLOYMENT_GUIDE.md for instructions.\n')
  process.exit(1)
} else if (hasWarnings) {
  console.log('⚠️  Configuration complete with warnings')
  console.log('Optional variables are not set but defaults will be used.\n')
} else {
  console.log('✅ All environment variables are configured!')
  console.log('\nYou can now:')
  console.log('  - Run "npm run ingest" to import Confluence data')
  console.log('  - Run "npm run dev" to start the development server')
  console.log('  - Run "npm run build" to create a production build\n')
}
console.log('='.repeat(50))
