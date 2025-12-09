const axios = require('axios')

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions'
const XAI_API_KEY = process.env.XAI_API_KEY

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

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

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

    // Parse and validate request
    const { content, prompt, model = 'grok-3', temperature = 0.7, max_tokens = 2000 } = JSON.parse(event.body)

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

    // Check API key
    if (!XAI_API_KEY) {
      console.error('XAI_API_KEY not configured')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      }
    }

    // Call Grok API
    const response = await axios.post(
      XAI_API_URL,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful personal document analyst. Provide insightful, constructive analysis based on the document content and prompt provided. Format your response in clear markdown with proper headings, lists, and emphasis where appropriate.',
          },
          {
            role: 'user',
            content: `${prompt}\n\n---\n\nDocument Content:\n${content}`,
          },
        ],
        temperature: temperature,
        max_tokens: max_tokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        timeout: 50000, // 50 second timeout
      }
    )

    // Extract and return analysis
    const analysis = response.data.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('No analysis generated')
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis,
        usage: response.data.usage,
      }),
    }
  } catch (error) {
    console.error('Analysis function error:', error)

    let statusCode = 500
    let errorMessage = 'Internal server error'

    if (error.response) {
      // xAI API error
      statusCode = error.response.status
      errorMessage = error.response.data?.error?.message || 'xAI API error'
    } else if (error.code === 'ECONNABORTED') {
      statusCode = 504
      errorMessage = 'Request timeout'
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({ error: errorMessage }),
    }
  }
}
