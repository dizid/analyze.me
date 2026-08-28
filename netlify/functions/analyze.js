import axios from 'axios'
import { getUserIdFromHeaders, unauthorized } from './utils/auth.js'
import { getCorsHeaders, handlePreflight } from './utils/cors.js'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Default-on demo mode: real Anthropic calls are gated behind this flag until
// explicitly opted out. Set DEMO_MODE=false in Netlify env vars (+ redeploy) to
// enable live AI calls. See AI-COST-RISK.md for why this was added.
const DEMO_MODE = (process.env.DEMO_MODE ?? 'true') !== 'false'

// Mock analyses returned while DEMO_MODE is on. Mirrors the real handler's markdown
// shape (see lengthInstructions/structuredFormat below) so the frontend renders it
// identically to a live response.
const MOCK_ANALYSIS_SUMMARY = `- Your recent activity shows a steady, consistent rhythm rather than sudden spikes.
- One theme recurs often enough across the content to be worth naming explicitly.
- There's a small but noticeable gap between what you're spending time on and what you describe as your priorities.`

const MOCK_ANALYSIS_STRUCTURED = `## Key Takeaways
- Your recent activity shows a steady, consistent rhythm rather than sudden spikes.
- One theme recurs often enough across the content to be worth naming explicitly.
- There's a small but noticeable gap between what you're spending time on and what you describe as your priorities.

## Analysis
Looking across what you shared, the overall pattern is more consistent than it might feel day-to-day. A handful of entries stand out from the baseline, and those are usually the moments worth paying closer attention to. The recurring theme above shows up often enough that it's likely shaping decisions even when it isn't top of mind.

## Action Steps
- Revisit the standout entries above and note what made them different from the baseline.
- Name the recurring theme explicitly the next time it comes up in a decision.
- Check whether your calendar and time allocation actually match the priorities you'd state out loud.`

const getMockAnalysis = (outputLength) =>
  outputLength === 'summary' ? MOCK_ANALYSIS_SUMMARY : MOCK_ANALYSIS_STRUCTURED

// Simple in-memory rate limiting (for production, use Redis or similar)
const requestCounts = new Map()
const RATE_LIMIT = 10 // requests per minute
const RATE_WINDOW = 60000 // 1 minute in milliseconds

const checkRateLimit = (identifier) => {
  const now = Date.now()
  const userRequests = requestCounts.get(identifier) || []

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW)

  if (recentRequests.length >= RATE_LIMIT) {
    return false
  }

  recentRequests.push(now)
  requestCounts.set(identifier, recentRequests)
  return true
}

const ALLOWED_MODELS = ['claude-sonnet-4-20250514', 'claude-haiku-4-5-20251001']
const ALLOWED_OUTPUT_LENGTHS = ['summary', 'middle', 'long']

export const handler = async (event, context) => {
  const headers = getCorsHeaders()

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') return handlePreflight()

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Rate limiting by IP
    const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'

    if (!checkRateLimit(clientIp)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.'
        }),
      }
    }

    // Verify authentication
    const userId = await getUserIdFromHeaders(event.headers)
    if (!userId) return { ...unauthorized(), headers }

    // Parse request
    const { content, prompt, model = 'claude-haiku-4-5-20251001', temperature = 0.7, max_tokens = 400, output_length = 'middle' } = JSON.parse(event.body)

    // Input validation
    if (!ALLOWED_MODELS.includes(model)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid model. Allowed: ${ALLOWED_MODELS.join(', ')}` }),
      }
    }

    if (!ALLOWED_OUTPUT_LENGTHS.includes(output_length)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid output_length. Allowed: ${ALLOWED_OUTPUT_LENGTHS.join(', ')}` }),
      }
    }

    const safeTemperature = Math.max(0, Math.min(1, temperature))
    const safeMaxTokens = Math.min(max_tokens, 4096)

    // Length-specific instructions
    const lengthInstructions = {
      summary: 'Be extremely brief. Maximum 3-5 bullet points. No section headers needed.',
      middle: 'Be concise. Focus on key insights with brief context.',
      long: 'Provide thorough analysis with detailed context and examples.'
    }

    // Structured format for middle and long outputs only
    const structuredFormat = output_length !== 'summary' ? `\n\nStructure your response with these markdown sections:\n## Key Takeaways\nList the 3 most important insights as bullet points.\n\n## Analysis\nYour detailed analysis.\n\n## Action Steps\nList 2-4 specific, actionable recommendations.` : ''

    if (!content || !prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing content or prompt' }),
      }
    }

    // Validate content length (max ~50k chars for safety)
    if (content.length > 50000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Document content too large (max 50,000 characters)' }),
      }
    }

    // Check API key — only required when demo mode is off, since the demo
    // path below never calls Anthropic.
    if (!DEMO_MODE && !ANTHROPIC_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      }
    }

    // --- Demo mode: return a mock analysis, never call Anthropic. ---
    // Everything above (rate limiting, auth, input validation) is unchanged —
    // only the paid Anthropic call itself is gated. See AI-COST-RISK.md.
    if (DEMO_MODE) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          analysis: getMockAnalysis(output_length),
          usage: { input_tokens: 0, output_tokens: 0 },
        }),
      }
    }

    // --- Live implementation below, unreachable while DEMO_MODE=true ---
    // Call Claude API
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: model,
        max_tokens: safeMaxTokens,
        temperature: safeTemperature,
        system: `You are a personal document analyst. ${lengthInstructions[output_length] || lengthInstructions.middle}${structuredFormat}\n\nUse markdown formatting.`,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n---\n\nDocument Content:\n${content}`,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        timeout: 25000,
      }
    )

    // Extract and return analysis
    const analysis = response.data.content[0]?.text

    if (!analysis) {
      throw new Error('No analysis generated')
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        analysis,
        usage: response.data.usage,
      }),
    }
  } catch (error) {
    console.error('Analyze function error:', error.message, error.stack)
    let statusCode = 500
    let errorMessage = 'Internal server error'

    if (error.response) {
      statusCode = error.response.status
      errorMessage = error.response.data?.error?.message || 'API error'
      console.error('API response error:', statusCode, errorMessage)
    } else if (error.code === 'ECONNABORTED') {
      statusCode = 504
      errorMessage = 'Request timeout'
    } else {
      // Catch-all for unexpected errors (import failures, JSON parse, etc.)
      errorMessage = error.message || 'Unknown error'
      console.error('Unexpected error:', error)
    }

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ error: errorMessage }),
    }
  }
}
