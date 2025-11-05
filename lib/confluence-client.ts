/**
 * Confluence API Client
 * Handles fetching pages from Confluence
 */

export interface ConfluencePage {
  id: string
  title: string
  content: string
  url: string
  spaceKey: string
}

export interface ConfluenceConfig {
  baseUrl: string
  username: string
  apiToken: string
  spaceKey: string
}

/**
 * Check if Confluence is configured
 */
export function isConfluenceConfigured(): boolean {
  return !!(
    process.env.CONFLUENCE_BASE_URL &&
    process.env.CONFLUENCE_USERNAME &&
    process.env.CONFLUENCE_API_TOKEN &&
    process.env.CONFLUENCE_SPACE_KEY
  )
}

/**
 * Get Confluence configuration from environment
 */
export function getConfluenceConfig(): ConfluenceConfig | null {
  if (!isConfluenceConfigured()) {
    return null
  }

  return {
    baseUrl: process.env.CONFLUENCE_BASE_URL!,
    username: process.env.CONFLUENCE_USERNAME!,
    apiToken: process.env.CONFLUENCE_API_TOKEN!,
    spaceKey: process.env.CONFLUENCE_SPACE_KEY!,
  }
}

/**
 * Clean HTML content to plain text
 */
function cleanHtmlContent(html: string): string {
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
 * Fetch pages from Confluence space
 */
export async function fetchConfluencePages(
  config: ConfluenceConfig,
  limit: number = 100
): Promise<ConfluencePage[]> {
  const auth = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64')
  const pages: ConfluencePage[] = []
  let start = 0
  const pageLimit = 25

  try {
    while (pages.length < limit) {
      const url = `${config.baseUrl}/rest/api/content?spaceKey=${config.spaceKey}&limit=${pageLimit}&start=${start}&expand=body.storage,version`

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`Confluence API error: ${response.status} ${response.statusText}`)
        break
      }

      const data = await response.json()

      for (const page of data.results) {
        const content = cleanHtmlContent(page.body?.storage?.value || '')
        
        // Skip pages with very little content
        if (content.length < 50) {
          continue
        }

        pages.push({
          id: page.id,
          title: page.title,
          content,
          url: `${config.baseUrl}/pages/viewpage.action?pageId=${page.id}`,
          spaceKey: config.spaceKey,
        })

        if (pages.length >= limit) {
          break
        }
      }

      if (data.results.length < pageLimit) {
        break
      }

      start += pageLimit
    }

    return pages
  } catch (error) {
    console.error('Error fetching Confluence pages:', error)
    throw new Error('Failed to fetch Confluence pages')
  }
}
